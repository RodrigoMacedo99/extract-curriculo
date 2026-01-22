import { AIResumeResponse, AI_RESPONSE_SCHEMA } from "@shared/types";

/**
 * Valida a resposta JSON da IA contra o schema esperado
 */
export function validateAIResponse(data: unknown): { valid: boolean; errors: string[]; data?: AIResumeResponse } {
  const errors: string[] = [];

  // Verificar se é um objeto
  if (typeof data !== "object" || data === null) {
    return { valid: false, errors: ["Resposta deve ser um objeto JSON válido"] };
  }

  const obj = data as Record<string, unknown>;

  // Validar resumo_habilidades
  if (!Array.isArray(obj.resumo_habilidades)) {
    errors.push("Campo 'resumo_habilidades' deve ser um array");
  } else {
    if (obj.resumo_habilidades.length === 0) {
      errors.push("Campo 'resumo_habilidades' não pode estar vazio");
    }
    if (!obj.resumo_habilidades.every((item) => typeof item === "string")) {
      errors.push("Todos os itens em 'resumo_habilidades' devem ser strings");
    }
  }

  // Validar experiencias_resumidas
  if (!Array.isArray(obj.experiencias_resumidas)) {
    errors.push("Campo 'experiencias_resumidas' deve ser um array");
  } else {
    obj.experiencias_resumidas.forEach((exp, idx) => {
      if (typeof exp !== "object" || exp === null) {
        errors.push(`Experiência ${idx} deve ser um objeto`);
        return;
      }

      const expObj = exp as Record<string, unknown>;

      if (typeof expObj.empresa !== "string" || !expObj.empresa.trim()) {
        errors.push(`Experiência ${idx}: campo 'empresa' deve ser uma string não-vazia`);
      }

      if (typeof expObj.cargo !== "string" || !expObj.cargo.trim()) {
        errors.push(`Experiência ${idx}: campo 'cargo' deve ser uma string não-vazia`);
      }

      if (typeof expObj.periodo !== "string" || !expObj.periodo.trim()) {
        errors.push(`Experiência ${idx}: campo 'periodo' deve ser uma string não-vazia`);
      }

      if (!Array.isArray(expObj.responsabilidades)) {
        errors.push(`Experiência ${idx}: campo 'responsabilidades' deve ser um array`);
      } else {
        if (expObj.responsabilidades.length === 0) {
          errors.push(`Experiência ${idx}: campo 'responsabilidades' não pode estar vazio`);
        }
        if (!expObj.responsabilidades.every((item) => typeof item === "string")) {
          errors.push(`Experiência ${idx}: todos os itens em 'responsabilidades' devem ser strings`);
        }
      }

      // Verificar campos extras
      const allowedFields = ["empresa", "cargo", "periodo", "responsabilidades"];
      const extraFields = Object.keys(expObj).filter((key) => !allowedFields.includes(key));
      if (extraFields.length > 0) {
        errors.push(`Experiência ${idx}: campos não permitidos: ${extraFields.join(", ")}`);
      }
    });
  }

  // Verificar campos extras no objeto raiz
  const allowedRootFields = ["resumo_habilidades", "experiencias_resumidas"];
  const extraRootFields = Object.keys(obj).filter((key) => !allowedRootFields.includes(key));
  if (extraRootFields.length > 0) {
    errors.push(`Campos não permitidos no nível raiz: ${extraRootFields.join(", ")}`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: obj as unknown as AIResumeResponse,
  };
}

/**
 * Tenta fazer parse de uma resposta de texto que pode conter JSON
 */
export function extractJSON(text: string): unknown {
  // Tentar fazer parse direto
  try {
    return JSON.parse(text);
  } catch {
    // Tentar encontrar um bloco JSON dentro do texto
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
