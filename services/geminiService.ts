import { GoogleGenAI } from "@google/genai";
import { UserInput, CourseStructure } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to determine mime type if browser fails or defaults to generic
const getMimeType = (file: File): string => {
  if (file.type && file.type !== 'application/octet-stream') return file.type;
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  switch(extension) {
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'xls': return 'application/vnd.ms-excel';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc': return 'application/msword';
      case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'ppt': return 'application/vnd.ms-powerpoint';
      case 'pdf': return 'application/pdf';
      case 'csv': return 'text/csv';
      case 'txt': return 'text/plain';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      default: return file.type || 'application/octet-stream';
  }
};

// Helper to convert File to Base64
const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      const mimeType = getMimeType(file);
      
      resolve({
        inlineData: {
          data: base64String,
          mimeType: mimeType,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateCourse = async (input: UserInput): Promise<CourseStructure> => {
  // Switch to gemini-3-pro-preview for better handling of complex JSON structures
  const modelId = 'gemini-3-pro-preview';

  const promptText = `
    Genera un curso completo en español con los siguientes parámetros:
    - Tema: ${input.topic}
    - Nivel: ${input.level}
    - Perfil del Alumno: ${input.profile}
    - Objetivo Principal: ${input.goal}
    - Tiempo Disponible: ${input.timeAvailable}
    - Formato Preferido: ${input.format}

    Si hay archivos adjuntos, úsalos como fuente principal de verdad para el contenido, complementando con tu conocimiento general.
    Asegúrate de incluir la sección 'references' con fuentes reales y creíbles que hayas utilizado o que sean relevantes para el tema.
  `;

  // Prepare contents
  const parts: any[] = [{ text: promptText }];

  if (input.files && input.files.length > 0) {
    for (const file of input.files) {
      const part = await fileToPart(file);
      parts.push(part);
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        // Increase token limit for long courses
        maxOutputTokens: 8192, 
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Clean potential markdown code blocks if the model adds them despite mimeType
    text = text.trim();
    if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
        text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const courseData = JSON.parse(text) as CourseStructure;
    return courseData;

  } catch (error) {
    console.error("Error generating course:", error);
    throw error;
  }
};