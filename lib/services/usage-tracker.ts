import { AI_MODELS } from "@/lib/ai/providers"

interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export class UsageTracker {
  // Token counting approximation (more accurate would use tiktoken)
  static countTokens(text: string): number {
    // Rough approximation: ~4 characters per token for English
    // This is a simplified version - in production use tiktoken or similar
    return Math.ceil(text.length / 4)
  }

  static calculateUsage(
    model: string,
    messages: Array<{ content: string }>,
    response: string
  ): TokenUsage {
    // Count prompt tokens
    const promptTokens = messages.reduce((total, msg) => {
      return total + this.countTokens(msg.content)
    }, 0)

    // Count completion tokens
    const completionTokens = this.countTokens(response)

    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens
    }
  }

  static calculateCost(model: string, usage: TokenUsage): number {
    const provider = this.getProvider(model)
    const modelConfig = AI_MODELS[provider][model as keyof (typeof AI_MODELS)[typeof provider]]
    
    if (!modelConfig || !('costPer1k' in modelConfig)) {
      console.warn(`Unknown model: ${model}`)
      return 0
    }

    // Calculate cost based on total tokens
    return (usage.totalTokens / 1000) * (modelConfig as any).costPer1k
  }

  private static getProvider(model: string): keyof typeof AI_MODELS {
    if (model.startsWith("gpt") || model.startsWith("o1")) return "openai"
    if (model.startsWith("claude")) return "anthropic"
    if (model.startsWith("gemini")) return "google"
    throw new Error(`Unknown provider for model: ${model}`)
  }

  static formatCost(cost: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(cost)
  }

  static formatTokens(tokens: number): string {
    return new Intl.NumberFormat('ko-KR').format(tokens)
  }
}