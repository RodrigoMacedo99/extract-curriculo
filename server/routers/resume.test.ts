import { describe, expect, it, vi, beforeEach } from "vitest";
import { validateAIResponse, extractJSON } from "../validation";
import { AIResumeResponse } from "@shared/types";

describe("Resume Validation", () => {
  describe("validateAIResponse", () => {
    it("deve validar uma resposta correta", () => {
      const validResponse: AIResumeResponse = {
        resumo_habilidades: [
          "Desenvolvimento web com JavaScript, React e Node.js",
          "Banco de dados SQL e NoSQL",
        ],
        experiencias_resumidas: [
          {
            empresa: "Tech Company",
            cargo: "Senior Developer",
            periodo: "2020-2023",
            responsabilidades: [
              "Desenvolveu aplicações web com React",
              "Implementou APIs REST com Node.js",
            ],
          },
        ],
      };

      const result = validateAIResponse(validResponse);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validResponse);
    });

    it("deve rejeitar quando resumo_habilidades está vazio", () => {
      const invalidResponse = {
        resumo_habilidades: [],
        experiencias_resumidas: [
          {
            empresa: "Tech Company",
            cargo: "Senior Developer",
            periodo: "2020-2023",
            responsabilidades: ["Desenvolveu aplicações"],
          },
        ],
      };

      const result = validateAIResponse(invalidResponse);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Campo 'resumo_habilidades' não pode estar vazio");
    });

    it("deve rejeitar quando faltam campos obrigatórios", () => {
      const invalidResponse = {
        resumo_habilidades: ["JavaScript"],
        experiencias_resumidas: [
          {
            empresa: "Tech Company",
            cargo: "Senior Developer",
            // periodo está faltando
            responsabilidades: ["Desenvolveu aplicações"],
          },
        ],
      };

      const result = validateAIResponse(invalidResponse);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("periodo"))).toBe(true);
    });

    it("deve rejeitar quando há campos extras", () => {
      const invalidResponse = {
        resumo_habilidades: ["JavaScript"],
        experiencias_resumidas: [
          {
            empresa: "Tech Company",
            cargo: "Senior Developer",
            periodo: "2020-2023",
            responsabilidades: ["Desenvolveu aplicações"],
            extra_field: "não permitido",
          },
        ],
      };

      const result = validateAIResponse(invalidResponse);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("extra_field"))).toBe(true);
    });

    it("deve rejeitar quando responsabilidades está vazio", () => {
      const invalidResponse = {
        resumo_habilidades: ["JavaScript"],
        experiencias_resumidas: [
          {
            empresa: "Tech Company",
            cargo: "Senior Developer",
            periodo: "2020-2023",
            responsabilidades: [],
          },
        ],
      };

      const result = validateAIResponse(invalidResponse);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("responsabilidades"))).toBe(true);
    });

    it("deve rejeitar quando o input não é um objeto", () => {
      const result = validateAIResponse("não é um objeto");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Resposta deve ser um objeto JSON válido");
    });

    it("deve rejeitar quando resumo_habilidades não é array", () => {
      const invalidResponse = {
        resumo_habilidades: "não é array",
        experiencias_resumidas: [],
      };

      const result = validateAIResponse(invalidResponse);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("resumo_habilidades"))).toBe(true);
    });
  });

  describe("extractJSON", () => {
    it("deve extrair JSON válido diretamente", () => {
      const jsonStr = '{"key": "value", "number": 42}';
      const result = extractJSON(jsonStr);
      expect(result).toEqual({ key: "value", number: 42 });
    });

    it("deve extrair JSON de dentro de um texto", () => {
      const text = 'Aqui está o resultado: {"resumo_habilidades": ["JavaScript"], "experiencias_resumidas": []}';
      const result = extractJSON(text);
      expect(result).toEqual({
        resumo_habilidades: ["JavaScript"],
        experiencias_resumidas: [],
      });
    });

    it("deve retornar null para JSON inválido", () => {
      const invalidJson = "{ invalid json }";
      const result = extractJSON(invalidJson);
      expect(result).toBeNull();
    });

    it("deve lidar com JSON aninhado", () => {
      const complexJson = `{
        "resumo_habilidades": ["JS", "React"],
        "experiencias_resumidas": [
          {
            "empresa": "Company",
            "cargo": "Dev",
            "periodo": "2020-2023",
            "responsabilidades": ["Task 1", "Task 2"]
          }
        ]
      }`;
      const result = extractJSON(complexJson);
      expect(result).toBeDefined();
      expect((result as any).resumo_habilidades).toEqual(["JS", "React"]);
    });

    it("deve extrair JSON com caracteres especiais", () => {
      const jsonWithSpecialChars = '{"text": "Olá, mundo! 🚀", "value": 123}';
      const result = extractJSON(jsonWithSpecialChars);
      expect(result).toEqual({ text: "Olá, mundo! 🚀", value: 123 });
    });
  });
});
