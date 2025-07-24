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

  const sendMessage = useCallback(async (content: string, model: string) => {
    try {
      setIsLoading(true)
      
      // Add user message
      const userMessage: Message = { role: "user", content }
      setMessages(prev => [...prev, userMessage])

      // Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model,
        }),
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