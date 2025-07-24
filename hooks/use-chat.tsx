"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string, model: string, images?: File[]) => {
    try {
      setIsLoading(true)
      
      // Add user message
      const userMessage: Message = { role: "user", content }
      setMessages(prev => [...prev, userMessage])

      // Prepare request body
      let body: any = {
        messages: [...messages, userMessage],
        model,
      }

      // If images are provided, convert to base64
      if (images && images.length > 0) {
        const imageDataPromises = images.map(async (image) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64 = reader.result as string
              resolve(base64)
            }
            reader.onerror = reject
            reader.readAsDataURL(image)
          })
        })
        
        const imageData = await Promise.all(imageDataPromises)
        body.images = imageData
      }

      // Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()
      
      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      toast.error("Failed to send message")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  return {
    messages,
    isLoading,
    sendMessage,
  }
}