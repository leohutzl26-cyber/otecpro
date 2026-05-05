import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with the key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

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

  // Convert the file to generative part
  const data = await fileToGenerativePart(file);

  // Initialize the model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Eres un asistente experto en extracción de datos desde Órdenes de Compra (OC) y nóminas de alumnos.
    El usuario te enviará un documento (imagen o PDF).
    Tu objetivo es extraer la lista de alumnos o participantes que figuren en el documento.
    
    Debes devolver un arreglo en formato JSON estrictamente, sin texto extra, ni markdown (sin las comillas invertidas de código).
    Cada objeto del arreglo debe tener exactamente estas propiedades:
    - rut: (string, formato XX.XXX.XXX-X o parecido, si no hay, devuelve "")
    - nombre: (string, el nombre o nombres, si no se puede separar del apellido pon todo aquí)
    - apellido: (string, los apellidos, si no se puede separar pon "")
    - email: (string, si no hay, devuelve "")
    - telefono: (string, si no hay, devuelve "")

    Si no encuentras ningún participante, devuelve [].
    Asegúrate de devolver un JSON válido.
  `;

  try {
    const result = await model.generateContent([prompt, data]);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown from response if present
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
    }

    const participantes: ExtractedParticipante[] = JSON.parse(text);
    return participantes;
  } catch (error) {
    console.error("Error extraiendo participantes:", error);
    throw new Error('Hubo un error procesando el documento con la IA.');
  }
}

/**
 * Helper to convert a File object into the format required by Gemini API
 */
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // FileReader.result includes the data URL prefix (e.g. data:image/jpeg;base64,...), we need to split it
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type
    },
  };
}
