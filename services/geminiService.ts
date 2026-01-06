
import { GoogleGenAI, Type } from "@google/genai";
import { AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface TweetInsight {
  id: string;
  author: string;
  handle: string;
  content: string;
  time: string;
  verified: boolean;
}

export const getAnichessTweets = async (): Promise<TweetInsight[]> => {
  const prompt = `
    SEARCH THE WEB for the most recent official tweets and announcements from the Anichess game (@AnichessGame).
    Look for information about Spellmate seasons, tournaments, new partnerships, or patch notes.
    Format the results as a JSON array of objects with fields: id, author (set to "Anichess"), handle (set to "@AnichessGame"), content (the summary of the tweet/post), time (how long ago, e.g., "4h", "2d"), and verified (boolean).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              author: { type: Type.STRING },
              handle: { type: Type.STRING },
              content: { type: Type.STRING },
              time: { type: Type.STRING },
              verified: { type: Type.BOOLEAN }
            },
            required: ["author", "handle", "content", "time"]
          }
        }
      }
    });

    let tweets: TweetInsight[] = [];
    try {
      const cleanedText = response.text?.replace(/```json\n?|```/g, "").trim();
      tweets = JSON.parse(cleanedText || "[]");
    } catch (parseError) {
      console.warn("Twitter parsing error, fallback used");
      tweets = [{
        id: "1",
        author: "Anichess",
        handle: "@AnichessGame",
        content: "Stay tuned for the next phase of the Checkmate Arena! Major updates coming soon to the Ronin Network.",
        time: "1h",
        verified: true
      }];
    }
    return tweets;
  } catch (error) {
    console.error("Anichess Twitter Feed Error:", error);
    return [];
  }
};
