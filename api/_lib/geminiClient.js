// The one place the real Gemini call happens, and the one place
// GEMINI_API_KEY is read. Never imported by client code (nothing under
// src/ imports this file) and never logged.
import { GoogleGenAI } from '@google/genai'
import { HARD_MODE_MODEL } from './opponentAgent.js'

let client = null

function getClient() {
  if (client) return client
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set')
  }
  client = new GoogleGenAI({ apiKey })
  return client
}

// Calls Gemini with Google Search grounding enabled (the model decides for
// itself whether to search) and returns the raw interaction. Callers read
// `.steps` for the search evidence and final JSON text — see
// opponentAgent.js's runOnce.
export async function callGemini(prompt) {
  const ai = getClient()
  return ai.interactions.create({
    model: HARD_MODE_MODEL,
    input: prompt,
    tools: [{ type: 'google_search' }],
  })
}
