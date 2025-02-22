import Anthropic from "@anthropic-ai/sdk";
import type { NoteGroup } from "../types/note";
import env from "../config/env";

export interface AIAnalysis {
  suggestedGroupId?: string;
  newGroup?: {
    name: string;
    description: string;
  };
  explanation: string;
}

export class AIService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.CLAUDE_API_KEY as string,
    });
  }

  async analyzeNote(
    content: string,
    existingGroups: NoteGroup[]
  ): Promise<AIAnalysis> {
    const prompt = `Analiza esta nota: "${content}"

Grupos existentes:
${existingGroups
  .map((g) => `- ${g.name}: ${g.description} (ID: ${g.id})`)
  .join("\n")}

Tu tarea es:
1. Analizar el contenido de la nota
2. Determinar si corresponde a alguno de los grupos existentes o si necesita un nuevo grupo
3. Proporcionar una breve explicación de tu decisión

Responde en formato JSON con esta estructura:
{
  "suggestedGroupId": "ID del grupo existente si hay match (si no hay match, omitir este campo)",
  "newGroup": {
    "name": "nombre sugerido si se necesita nuevo grupo",
    "description": "descripción sugerida si se necesita nuevo grupo"
  } (omitir este objeto si hay match con grupo existente),
  "explanation": "explicación de por qué sugieres este grupo o por qué se necesita uno nuevo"
}

Asegúrate de:
- Si encuentras un grupo que coincida, incluye SOLO suggestedGroupId y explanation
- Si no hay coincidencia, incluye SOLO newGroup y explanation
- La explicación debe ser concisa pero informativa`;

    try {
      const response = await this.client.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const analysis = JSON.parse(
        response.content[0].type === "text" ? response.content[0].text : ""
      ) as AIAnalysis;

      // Validar la respuesta
      if (analysis.suggestedGroupId && analysis.newGroup) {
        throw new Error(
          "La respuesta de IA no puede sugerir ambos: un grupo existente y un nuevo grupo"
        );
      }

      if (!analysis.suggestedGroupId && !analysis.newGroup) {
        throw new Error(
          "La respuesta de IA debe sugerir un grupo existente o uno nuevo"
        );
      }

      if (!analysis.explanation) {
        throw new Error("La respuesta de IA debe incluir una explicación");
      }

      return analysis;
    } catch (error) {
      console.error("Error en el análisis de IA:", error);
      // Proporcionar una respuesta por defecto en caso de error
      return {
        newGroup: {
          name: "Notas sin clasificar",
          description:
            "Grupo temporal para notas que requieren clasificación manual",
        },
        explanation:
          "Error en el análisis de IA. Se asigna a grupo por defecto.",
      };
    }
  }

  async suggestGroupName(content: string): Promise<string> {
    const prompt = `Dada esta nota: "${content}"
    
Sugiere un nombre corto y descriptivo para un grupo que podría contener notas similares.
Responde solo con el nombre sugerido, sin explicaciones adicionales.
El nombre debe ser conciso (máximo 3 palabras) y descriptivo.`;

    try {
      const response = await this.client.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response.content[0].type === "text"
        ? response.content[0].text.trim()
        : "Notas sin clasificar";
    } catch (error) {
      console.error("Error al sugerir nombre de grupo:", error);
      return "Notas sin clasificar";
    }
  }

  async suggestGroupDescription(
    name: string,
    noteContent: string
  ): Promise<string> {
    const prompt = `Dado este nombre de grupo "${name}" y esta nota de ejemplo: "${noteContent}"
    
Genera una descripción concisa pero informativa para el grupo.
La descripción debe explicar qué tipo de notas irían en este grupo.
Responde solo con la descripción, sin explicaciones adicionales.
Máximo 2 líneas.`;

    try {
      const response = await this.client.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response.content[0].type === "text"
        ? response.content[0].text
        : "Grupo temporal para notas pendientes de clasificación";
    } catch (error) {
      console.error("Error al sugerir descripción de grupo:", error);
      return "Grupo temporal para notas pendientes de clasificación";
    }
  }
}
