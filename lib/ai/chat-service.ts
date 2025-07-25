import { openai, anthropic, genAI, AI_MODELS, AIModel } from "./providers"
import { OpenAI } from "openai"
import { Anthropic } from "@anthropic-ai/sdk"

type ChatCompletionMessageParam = OpenAI.Chat.ChatCompletionMessageParam
type MessageParam = Anthropic.Messages.MessageParam

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  images?: string[] // base64 encoded images
}

export interface ChatOptions {
  model: AIModel
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export class ChatService {
  static async chat(options: ChatOptions): Promise<string> {
    const { model, messages, temperature = 0.7, maxTokens = 1000 } = options
    
    if (model.startsWith("gpt") || model.startsWith("o1")) {
      return this.chatWithOpenAI(model, messages, temperature, maxTokens)
    } else if (model.startsWith("claude")) {
      return this.chatWithAnthropic(model, messages, temperature, maxTokens)
    } else if (model.startsWith("gemini")) {
      return this.chatWithGoogle(model, messages, temperature, maxTokens)
    }
    
    throw new Error(`Unsupported model: ${model}`)
  }

  private static async chatWithOpenAI(
    model: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const openaiMessages: ChatCompletionMessageParam[] = messages.map(msg => {
      // Handle multimodal messages
      if (msg.images && msg.images.length > 0 && msg.role === "user") {
        const content: any[] = [
          { type: "text", text: msg.content }
        ]
        
        // Add images to content
        msg.images.forEach(imageBase64 => {
          content.push({
            type: "image_url",
            image_url: {
              url: imageBase64
            }
          })
        })
        
        return {
          role: msg.role,
          content
        }
      }
      
      return {
        role: msg.role,
        content: msg.content,
      }
    })

    const response = await openai.chat.completions.create({
      model,
      messages: openaiMessages,
      temperature,
      max_tokens: maxTokens,
    })

    return response.choices[0]?.message?.content || ""
  }

  private static async chatWithAnthropic(
    model: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    // Convert messages to Anthropic format
    const systemMessage = messages.find(m => m.role === "system")?.content || ""
    const anthropicMessages: MessageParam[] = messages
      .filter(m => m.role !== "system")
      .map(msg => {
        // Handle multimodal messages
        if (msg.images && msg.images.length > 0 && msg.role === "user") {
          const content: any[] = [
            { type: "text", text: msg.content }
          ]
          
          // Add images to content
          msg.images.forEach(imageBase64 => {
            // Extract base64 data from data URL
            const base64Data = imageBase64.split(',')[1]
            const mimeType = imageBase64.match(/data:([^;]+);/)?.[1] || 'image/jpeg'
            
            content.push({
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Data
              }
            })
          })
          
          return {
            role: "user" as const,
            content
          }
        }
        
        return {
          role: msg.role === "user" ? "user" as const : "assistant" as const,
          content: msg.content,
        }
      })

    const response = await anthropic.messages.create({
      model,
      system: systemMessage,
      messages: anthropicMessages,
      temperature,
      max_tokens: maxTokens,
    })

    return response.content[0]?.type === "text" ? response.content[0].text : ""
  }

  private static async chatWithGoogle(
    model: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const geminiModel = genAI.getGenerativeModel({ model })
    
    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(msg => {
      const parts: any[] = [{ text: msg.content }]
      
      // Add images if present
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(imageBase64 => {
          // Extract base64 data from data URL
          const base64Data = imageBase64.split(',')[1]
          const mimeType = imageBase64.match(/data:([^;]+);/)?.[1] || 'image/jpeg'
          
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data
            }
          })
        })
      }
      
      return {
        role: msg.role === "user" ? "user" : "model",
        parts,
      }
    })
    
    const lastMessage = messages[messages.length - 1]
    const lastParts: any[] = [{ text: lastMessage.content }]
    
    // Add images to last message if present
    if (lastMessage.images && lastMessage.images.length > 0) {
      lastMessage.images.forEach(imageBase64 => {
        const base64Data = imageBase64.split(',')[1]
        const mimeType = imageBase64.match(/data:([^;]+);/)?.[1] || 'image/jpeg'
        
        lastParts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        })
      })
    }
    
    const chat = geminiModel.startChat({
      history,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    })

    const result = await chat.sendMessage(lastParts)
    return result.response.text()
  }

  static async *chatStream(options: ChatOptions): AsyncGenerator<string> {
    const { model, messages, temperature = 0.7, maxTokens = 1000 } = options
    
    if (model.startsWith("gpt") || model.startsWith("o1")) {
      yield* this.streamOpenAI(model, messages, temperature, maxTokens)
    } else if (model.startsWith("claude")) {
      yield* this.streamAnthropic(model, messages, temperature, maxTokens)
    } else if (model.startsWith("gemini")) {
      yield* this.streamGoogle(model, messages, temperature, maxTokens)
    } else {
      throw new Error(`Unsupported model: ${model}`)
    }
  }

  private static async *streamOpenAI(
    model: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const openaiMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }))

    const stream = await openai.chat.completions.create({
      model,
      messages: openaiMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }

  private static async *streamAnthropic(
    model: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const systemMessage = messages.find(m => m.role === "system")?.content || ""
    const anthropicMessages: MessageParam[] = messages
      .filter(m => m.role !== "system")
      .map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }))

    const stream = await anthropic.messages.create({
      model,
      system: systemMessage,
      messages: anthropicMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        yield chunk.delta.text
      }
    }
  }

  private static async *streamGoogle(
    model: string,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const geminiModel = genAI.getGenerativeModel({ model })
    
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))
    
    const lastMessage = messages[messages.length - 1]
    
    const chat = geminiModel.startChat({
      history,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    })

    const result = await chat.sendMessageStream(lastMessage.content)
    
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        yield text
      }
    }
  }

  static calculateCost(model: AIModel, tokens: number): number {
    const provider = this.getProvider(model)
    const modelConfigs = AI_MODELS[provider]
    const modelConfig = modelConfigs[model as keyof typeof modelConfigs]
    
    if (!modelConfig || !('costPer1k' in modelConfig)) {
      throw new Error(`Invalid model configuration for ${model}`)
    }
    
    return (tokens / 1000) * (modelConfig as { costPer1k: number }).costPer1k
  }

  private static getProvider(model: AIModel): keyof typeof AI_MODELS {
    if (model.startsWith("gpt") || model.startsWith("o1")) return "openai"
    if (model.startsWith("claude")) return "anthropic"
    if (model.startsWith("gemini")) return "google"
    throw new Error(`Unknown provider for model: ${model}`)
  }
}