import { GoogleGenAI } from '@google/genai';
import { getDB } from '../db/AppDatabase';
import { auth } from '../db/firebaseSetup';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export const GeminiAssistantService = {
  async generateResponse(userMessage: string, context: {
    userLocation?: { lat: number; lng: number } | null;
    isDemoMode?: boolean;
    isOffline?: boolean;
  }): Promise<string> {
    
    if (context.isOffline || context.isDemoMode) {
       // Return realistic pre-canned responses for Demo Mode or Offline
       const lowerMsg = userMessage.toLowerCase();
       if (lowerMsg.includes('live now') || lowerMsg.includes('happening')) {
         return "Right now, the **Grand Rathotsava** is making its way down the Main Temple Street. Also, the **Prasada Distribution** is active at the Annadasoha Hall.";
       }
       if (lowerMsg.includes('parking')) {
         return "The nearest parking is the **North Gate P1 area**. It is currently at 65% capacity. Follow the blue signs on the map for directions.";
       }
       if (lowerMsg.includes('emergency') || lowerMsg.includes('help')) {
         return "Stay calm. If it is a medical emergency, nearest First Aid is at the **Help Desk tent** by the South Gate. If someone is missing, please report it immediately on the 'Missing' tab in the app.";
       }
       if (lowerMsg.includes('tell me about')) {
         return "Jatre - Namma Pride is a beautiful cultural legacy honoring community and harmony. Enjoy the traditional dances, incredible food, and the glorious chariot festival!";
       }
       return "I am currently in Demo/Offline mode, but during the actual festival, I will connect to the cloud to give you real-time personalized answers and safety updates.";
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set.");
    }

    try {
      // Fetch Context-Aware cached data from Room DB (IndexedDB wrapper)
      const db = await getDB();
      const events = await db.getAll('events');
      
      const systemPrompt = `You are the "Jatre – Namma Pride" AI assistant. 
You are an expert on the Jatre festival. 
Available Context:
- User Location: ${context.userLocation ? JSON.stringify(context.userLocation) : 'Unknown'}
- Live Events: ${JSON.stringify(events.filter(e => e.isLive))}
- User ID: ${auth.currentUser?.uid || 'Guest'}

Your job is to answer questions related to live events, event timings, fair locations, parking, safety, help desk, missing persons guidance, and cultural stories.
Be helpful, calm, context-aware, festival-focused, and human-friendly.
Keep responses concise and elegant.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', 
        contents: [
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      return response.text || "I'm sorry, I couldn't process that request.";
    } catch (error) {
      console.error('Gemini AI error:', error);
      return "An error occurred while contacting the AI assistant. Please try again later.";
    }
  }
};
