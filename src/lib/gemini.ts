/**
 * Gemini AI Integration - Extracción de participantes desde documentos
 * Usa la API REST v1 directamente para máxima compatibilidad con la clave gratuita
 */

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

export interface ExtractedParticipante {
  rut: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
}

const PROMPT = `Eres un asistente experto en extracción de datos desde Órdenes de Compra (OC) y nóminas de alumnos chilenos.
El usuario te enviará un documento (imagen o PDF con personas, alumnos o participantes de un curso).

INSTRUCCIONES ESTRICTAS:
1. Extrae TODOS los nombres de personas que aparezcan como participantes, alumnos, trabajadores o destinatarios del servicio.
2. Devuelve ÚNICAMENTE un arreglo JSON válido, sin texto adicional, sin explicaciones, sin bloques de código markdown.
3. Cada elemento del arreglo debe tener exactamente estas propiedades (usa string vacío "" si no encuentras el dato):
   - rut: RUT chileno (ej: "12.345.678-9"), o "" si no aparece
   - nombre: nombres de pila (ej: "Juan Carlos")
   - apellidoPaterno: primer apellido (ej: "Pérez")
   - apellidoMaterno: segundo apellido (ej: "González"), o "" si no aparece
   - email: correo electrónico, o ""
   - telefono: número de teléfono, o ""

REGLAS PARA APELLIDOS:
- Si ves "Juan Pérez González", nombre="Juan", apellidoPaterno="Pérez", apellidoMaterno="González"
- Si ves "María Fernanda López Soto", nombre="María Fernanda", apellidoPaterno="López", apellidoMaterno="Soto"
- Si solo hay un apellido, ponlo en apellidoPaterno y deja apellidoMaterno vacío ""

EJEMPLO de respuesta válida:
[{"rut":"12.345.678-9","nombre":"Juan Carlos","apellidoPaterno":"Pérez","apellidoMaterno":"González","email":"juan@empresa.cl","telefono":""}]

Si no encuentras ningún participante devuelve exactamente: []
Tu respuesta debe empezar directamente con [ y terminar con ]. Nada más.`;

// Lista de modelos a intentar en orden de prioridad
const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

/**
 * Extracts participant data from a file using Gemini API (REST v1)
 */
export async function extractParticipantesFromFile(file: File): Promise<ExtractedParticipante[]> {
  if (!apiKey) {
    throw new Error('No se ha configurado VITE_GEMINI_API_KEY en las variables de entorno.');
  }

  const base64Data = await fileToBase64(file);
  const mimeType = file.type || 'image/jpeg';

  const requestBody = {
    contents: [{
      parts: [
        { text: PROMPT },
        { inline_data: { mime_type: mimeType, data: base64Data } }
      ]
    }]
  };

  // Intentar con cada modelo hasta que uno funcione
  let lastError: Error | null = null;

  for (const model of MODELS_TO_TRY) {
    try {
      // Intentar primero con v1, luego v1beta
      for (const apiVersion of ['v1beta', 'v1']) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const status = response.status;

            // 404 = modelo no encontrado en esta versión, probar siguiente
            if (status === 404) continue;

            // 429 = cuota excedida para este modelo, probar siguiente modelo
            if (status === 429) {
              lastError = new Error(`Cuota excedida para ${model}`);
              break; // pasar al siguiente modelo
            }

            // 403 = API key inválida o API no habilitada
            if (status === 403) {
              throw new Error('La clave de API de Google no es válida o la API no está habilitada.');
            }

            throw new Error(`Error ${status}: ${JSON.stringify(errorData).slice(0, 200)}`);
          }

          const result = await response.json();

          // Extraer el texto de la respuesta
          const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error('La IA no devolvió ninguna respuesta.');
          }

          return parseGeminiResponse(text);
        } catch (e: any) {
          if (e.message?.includes('clave de API') || e.message?.includes('no devolvió')) throw e;
          lastError = e;
          continue;
        }
      }
    } catch (e: any) {
      if (e.message?.includes('clave de API') || e.message?.includes('no devolvió')) throw e;
      lastError = e;
      continue;
    }
  }

  throw lastError || new Error('No se pudo conectar con ningún modelo de IA.');
}

/**
 * Parse the raw text response from Gemini into structured data
 */
function parseGeminiResponse(text: string): ExtractedParticipante[] {
  const trimmed = text.trim();

  // Find JSON array in the response
  const startIdx = trimmed.indexOf('[');
  const endIdx = trimmed.lastIndexOf(']');

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    console.error('Respuesta de Gemini:', trimmed);
    throw new Error('La IA no pudo encontrar participantes en este documento. Intenta con una imagen más clara.');
  }

  try {
    const jsonText = trimmed.substring(startIdx, endIdx + 1);
    const participantes: ExtractedParticipante[] = JSON.parse(jsonText);

    if (!Array.isArray(participantes)) {
      throw new Error('Formato inválido');
    }

    return participantes;
  } catch {
    throw new Error('La IA no pudo estructurar los datos correctamente. Intenta con otro formato de documento.');
  }
}

/**
 * Convert a File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('No se pudo leer el archivo.'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo.'));
    reader.readAsDataURL(file);
  });
}
