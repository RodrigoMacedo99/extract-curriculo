import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createResume, getUserResumes, getResumeById, updateResume, deleteResume } from "../db";
import { invokeLLM } from "../_core/llm";
import { validateAIResponse, extractJSON } from "../validation";
import { AI_SYSTEM_PROMPT, AIResumeResponse, DadosNormalizados } from "@shared/types";
import { TRPCError } from "@trpc/server";

const processResumeInput = z.object({
  candidateName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  habilidades_brutas: z.array(z.string()),
  experiencias_brutas: z.array(
    z.object({
      cargo: z.string(),
      empresa: z.string(),
      periodo: z.string(),
      descricao_texto: z.string(),
    })
  ),
});

export const resumeRouter = router({
  // Processar dados normalizados com IA
  processWithAI: protectedProcedure
    .input(processResumeInput)
    .mutation(async ({ input, ctx }) => {
      try {
        // Preparar dados para envio à IA
        const aiInput = {
          habilidades_brutas: input.habilidades_brutas,
          experiencias_brutas: input.experiencias_brutas,
        };

        // Chamar IA com schema estruturado
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: AI_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: JSON.stringify(aiInput),
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "resume_summary",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  resumo_habilidades: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de habilidades resumidas",
                  },
                  experiencias_resumidas: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        empresa: { type: "string" },
                        cargo: { type: "string" },
                        periodo: { type: "string" },
                        responsabilidades: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                      required: ["empresa", "cargo", "periodo", "responsabilidades"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["resumo_habilidades", "experiencias_resumidas"],
                additionalProperties: false,
              },
            },
          },
        });

        // Extrair conteúdo da resposta
        const responseContent = response.choices[0]?.message?.content;
        if (!responseContent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Resposta vazia da IA",
          });
        }

        // Fazer parse do JSON
        const contentStr = typeof responseContent === "string" ? responseContent : JSON.stringify(responseContent);
        const jsonData = extractJSON(contentStr);
        if (!jsonData) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível fazer parse da resposta JSON",
          });
        }

        // Validar resposta
        const validation = validateAIResponse(jsonData);
        if (!validation.valid) {
          console.error("Erros de validação:", validation.errors);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Resposta inválida da IA: ${validation.errors.join(", ")}`,
          });
        }

        // Salvar no banco de dados
        const resume = await createResume({
          userId: ctx.user.id,
          fileName: `resume-${Date.now()}.pdf`,
          candidateName: input.candidateName || null,
          email: input.email || null,
          phone: input.phone || null,
          habilidadesBrutas: JSON.stringify(input.habilidades_brutas),
          experienciasBrutas: JSON.stringify(input.experiencias_brutas),
          resumoHabilidades: JSON.stringify(validation.data!.resumo_habilidades),
          experienciasResumidas: JSON.stringify(validation.data!.experiencias_resumidas),
          status: "completed" as const,
          processedAt: new Date(),
        });

        if (!resume) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao salvar currículo no banco de dados",
          });
        }

        return {
          success: true,
          resumeId: resume.id,
          result: validation.data!,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Erro ao processar currículo:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao processar currículo com IA",
        });
      }
    }),

  // Listar currículos do usuário
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const resumes = await getUserResumes(ctx.user.id);
      return resumes.map((resume) => ({
        ...resume,
        habilidadesBrutas: resume.habilidadesBrutas ? JSON.parse(resume.habilidadesBrutas) : [],
        experienciasBrutas: resume.experienciasBrutas ? JSON.parse(resume.experienciasBrutas) : [],
        resumoHabilidades: resume.resumoHabilidades ? JSON.parse(resume.resumoHabilidades) : [],
        experienciasResumidas: resume.experienciasResumidas ? JSON.parse(resume.experienciasResumidas) : [],
      }));
    } catch (error) {
      console.error("Erro ao listar currículos:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar currículos",
      });
    }
  }),

  // Obter detalhes de um currículo
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    try {
      const resume = await getResumeById(input.id);

      if (!resume) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Currículo não encontrado",
        });
      }

      // Verificar permissão
      if (resume.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Sem permissão para acessar este currículo",
        });
      }

      return {
        ...resume,
        habilidadesBrutas: resume.habilidadesBrutas ? JSON.parse(resume.habilidadesBrutas) : [],
        experienciasBrutas: resume.experienciasBrutas ? JSON.parse(resume.experienciasBrutas) : [],
        resumoHabilidades: resume.resumoHabilidades ? JSON.parse(resume.resumoHabilidades) : [],
        experienciasResumidas: resume.experienciasResumidas ? JSON.parse(resume.experienciasResumidas) : [],
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error("Erro ao obter currículo:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao obter currículo",
      });
    }
  }),

  // Deletar um currículo
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    try {
      const resume = await getResumeById(input.id);

      if (!resume) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Currículo não encontrado",
        });
      }

      // Verificar permissão
      if (resume.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Sem permissão para deletar este currículo",
        });
      }

      await deleteResume(input.id);

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error("Erro ao deletar currículo:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao deletar currículo",
      });
    }
  }),
});
