import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StorySegment, GameSettings } from "../types";

// Initialize the API client
// Note: process.env.API_KEY is expected to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";

// Schema for structured JSON output from the text model
const storySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    storyText: {
      type: Type.STRING,
      description: "The narrative content of the story segment in Japanese.",
    },
    choices: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 3-4 possible actions the user can take next in Japanese.",
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A detailed visual description of the current scene to be used for image generation. Focus on environment, lighting, and characters. MUST BE IN ENGLISH.",
    },
  },
  required: ["storyText", "choices", "imagePrompt"],
};

export const generateInitialStory = async (settings: GameSettings): Promise<Omit<StorySegment, 'id'>> => {
  const prompt = `
    Create the opening of an interactive novel OR continue from a provided summary.
    
    User Settings / Context:
    - Gender: ${settings.gender}
    - Age: ${settings.age}
    - Genre: ${settings.genre}
    - Setting / Previous Summary: ${settings.setting}

    Instructions:
    1. Analyze the "Setting / Previous Summary" field.
       - If it describes a specific world setting or premise, start a NEW story (Chapter 1).
       - If it looks like a summary of a previous adventure, CONTINUE from that point.
    2. Write an extensive, descriptive segment (about 1000 Japanese characters) in JAPANESE.
    3. Focus on sensory details, internal monologue, and atmospheric setting.
    4. Provide 3 distinct choices for the character to take next in JAPANESE.
    5. Provide a detailed image prompt for the scene in ENGLISH.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
        systemInstruction: "You are a master novelist. Write long, immersive, and highly descriptive Japanese prose. Each response should feel like a substantial chapter of a book, roughly 1000 characters. Output strict JSON.",
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      text: data.storyText,
      choices: data.choices,
      imagePrompt: data.imagePrompt,
    };
  } catch (error) {
    console.error("Error generating initial story:", error);
    throw new Error("Failed to start the story.");
  }
};

export const generateStoryContinuation = async (
  history: StorySegment[], 
  userAction: string
): Promise<Omit<StorySegment, 'id'>> => {
  
  const context = history.map((seg) => {
    if (seg.isUserAction) {
      return `User Action: ${seg.userActionText}`;
    } else {
      return `Story: ${seg.text}`;
    }
  }).join("\n\n");

  const prompt = `
    Continue the story based on the user's action.

    Previous Story Context:
    ${context}

    Latest User Action: "${userAction}"

    Instructions:
    1. Write a long, detailed next segment (about 1000 Japanese characters) in JAPANESE.
    2. Advance the plot significantly while maintaining a high level of descriptive detail.
    3. Provide 3 distinct choices for the next step in JAPANESE.
    4. Provide a descriptive image prompt for the NEW scene in ENGLISH.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
        systemInstruction: "You are a master novelist. Maintain continuity. Write immersive, long-form Japanese prose (approx 1000 chars per segment). Output strict JSON.",
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      text: data.storyText,
      choices: data.choices,
      imagePrompt: data.imagePrompt,
    };
  } catch (error) {
    console.error("Error continuing story:", error);
    throw new Error("Failed to continue the story.");
  }
};

export const generateSceneImage = async (imagePrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: imagePrompt }],
      },
      config: {
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    return `https://picsum.photos/800/800?grayscale&blur=2`;
  }
};

export const generateStorySummary = async (history: StorySegment[], settings: GameSettings): Promise<string> => {
  const context = history.map((seg) => {
    if (seg.isUserAction) {
      return `User: ${seg.userActionText}`;
    } else {
      return `Story: ${seg.text}`;
    }
  }).join("\n\n");

  const prompt = `
    Summarize the current state of this interactive story so the player can continue later.

    Original Settings:
    - Age/Gender: ${settings.age}, ${settings.gender}
    - Genre: ${settings.genre}

    Story Log:
    ${context}

    Instructions:
    1. Create a detailed summary (about 300-500 characters) in JAPANESE.
    2. Include location, key events, status, and items.
    3. Output as a "Save Data" log.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "You are a chronicler. Summarize the adventure concisely but with enough detail to resume play.",
      },
    });

    return response.text || "あらすじの生成に失敗しました。";
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary.");
  }
};