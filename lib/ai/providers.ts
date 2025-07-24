import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize AI providers
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

// Model configurations
export const AI_MODELS = {
  openai: {
    "gpt-4o": { name: "GPT-4o", maxTokens: 4096, costPer1k: 0.03 },
    "gpt-4o-mini": { name: "GPT-4o mini", maxTokens: 4096, costPer1k: 0.01 },
    "o1-preview": { name: "o1-preview", maxTokens: 8192, costPer1k: 0.05 },
    "o1-mini": { name: "o1-mini", maxTokens: 4096, costPer1k: 0.02 },
  },
  anthropic: {
    "claude-3-5-sonnet": { name: "Claude 3.5 Sonnet", maxTokens: 4096, costPer1k: 0.015 },
    "claude-3-opus": { name: "Claude 3 Opus", maxTokens: 4096, costPer1k: 0.03 },
    "claude-3-haiku": { name: "Claude 3 Haiku", maxTokens: 4096, costPer1k: 0.0025 },
  },
  google: {
    "gemini-2.0-flash": { name: "Gemini 2.0 Flash", maxTokens: 8192, costPer1k: 0.001 },
    "gemini-1.5-pro": { name: "Gemini 1.5 Pro", maxTokens: 8192, costPer1k: 0.01 },
    "gemini-1.5-flash": { name: "Gemini 1.5 Flash", maxTokens: 8192, costPer1k: 0.0005 },
  },
} as const

export type AIProvider = keyof typeof AI_MODELS
export type AIModel = {
  [K in AIProvider]: keyof typeof AI_MODELS[K]
}[AIProvider]