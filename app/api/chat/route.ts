import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ChatService } from "@/lib/ai/chat-service"
import { UsageTracker } from "@/lib/services/usage-tracker"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages, model, images } = await req.json()

    // If images are provided, format messages for multimodal
    let formattedMessages = messages
    if (images && images.length > 0) {
      // Get the last user message and add images to it
      const lastUserMessageIndex = messages.findLastIndex((m: any) => m.role === "user")
      if (lastUserMessageIndex !== -1) {
        formattedMessages = [...messages]
        formattedMessages[lastUserMessageIndex] = {
          ...messages[lastUserMessageIndex],
          images: images
        }
      }
    }

    const response = await ChatService.chat({
      model,
      messages: formattedMessages,
    })

    // Track usage
    const usage = UsageTracker.calculateUsage(model, formattedMessages, response)
    const cost = UsageTracker.calculateCost(model, usage)

    // Save usage to database
    await supabase.from('usage').insert({
      user_id: user.id,
      model,
      prompt_tokens: usage.promptTokens,
      completion_tokens: usage.completionTokens,
      total_tokens: usage.totalTokens,
      cost
    })

    return NextResponse.json({ 
      content: response,
      usage: {
        ...usage,
        cost,
        formattedCost: UsageTracker.formatCost(cost)
      }
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}