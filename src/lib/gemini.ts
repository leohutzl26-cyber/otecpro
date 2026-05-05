import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with the key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

export interface ExtractedParticipante {
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

/**
 * Extracts participant data from a file using Gemini 1.5 Flash.
 */
export async function extractParticipantesFromFile(file: File): Promise<ExtractedParticipante[]> {
  if (!apiKey) {
    throw new Error('No se ha configurado VITE_GEMINI_API_KEY en las variables de entorno.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Convert the file to generative part
  const data = await fileToGenerativePart(file);

  const prompt = `Eres un asistente experto en extracción de datos desde Órdenes de Compra (OC) y nóminas de alumnos chilenos.
El usuario te enviará un documento (imagen o PDF con personas, alumnos o participantes de un curso).

INSTRUCCIONES ESTRICTAS:
1. Extrae TODOS los nombres de personas que aparezcan como participantes, alumnos, trabajadores o destinatarios del servicio.
2. Devuelve ÚNICAMENTE un arreglo JSON válido, sin texto adicional, sin explicaciones, sin bloques de código markdown.
3. Cada elemento del arreglo debe tener exactamente estas propiedades (usa string vacío "" si no encuentras el dato):
   - rut: RUT chileno (ej: "12.345.678-9"), o "" si no aparece
   - nombre: primer nombre o nombres de pila
   - apellido: apellido(s) paterno y materno
   - email: correo electrónico, o ""
   - telefono: número de teléfono, o ""

EJEMPLO de respuesta válida:
[{"rut":"12.345.678-9","nombre":"Juan Carlos","apellido":"Pérez González","email":"juan@empresa.cl","telefono":""},{"rut":"","nombre":"María","apellido":"López","email":"","telefono":""}]

Si no encuentras ningún participante devuelve exactamente: []

IMPORTANTE: Tu respuesta debe empezar directamente con [ y terminar con ]. Nada más.`;

  try {
    const result = await model.generateContent([prompt, data]);
    const response = await result.response;
    let text = response.text().trim();

    // Extraer el JSON aunque venga envuelto en markdown o texto adicional
    // Buscar el primer [ y el último ] para extraer el array
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');

    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
      console.error('Respuesta de Gemini no contiene JSON válido:', text);
      throw new Error('La IA no devolvió una lista válida. Intenta con una imagen más clara del documento.');
    }

    const jsonText = text.substring(startIdx, endIdx + 1);
    const participantes: ExtractedParticipante[] = JSON.parse(jsonText);

    if (!Array.isArray(participantes)) {
      throw new Error('La respuesta de la IA no es un arreglo de participantes.');
    }

    return participantes;
  } catch (error: any) {
    console.error('Error detallado de Gemini:', error);

    // Re-lanzar con mensajes específicos
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      throw new Error('La clave de API de Google no es válida. Verifica la configuración en Vercel.');
    }
    if (error.message?.includes('SAFETY') || error.message?.includes('safety')) {
      throw new Error('El documento fue bloqueado por filtros de seguridad. Intenta con otro formato.');
    }
    if (error.message?.includes('imagen más clara') || error.message?.includes('arreglo')) {
      throw error; // re-lanzar nuestros propios errores
    }
    if (error instanceof SyntaxError) {
      throw new Error('La IA no pudo estructurar los datos. Intenta con una imagen de mejor resolución.');
    }

    throw new Error(`Error al procesar el documento: ${error.message || 'Error desconocido'}`);
  }
}

/**
 * Helper to convert a File object into the format required by Gemini API
 */
async function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // FileReader result includes the data URL prefix (e.g. data:image/jpeg;base64,...) 
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('No se pudo leer el archivo. Intenta con otro formato.'));
        return;
      }
      // For PDFs, use application/pdf; for images use the file's mime type
      const mimeType = file.type || 'image/jpeg';
      resolve({ inlineData: { data: base64, mimeType } });
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo.'));
    reader.readAsDataURL(file);
  });
}
