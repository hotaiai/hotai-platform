"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, Loader2, Image as ImageIcon, Paperclip } from "lucide-react"
import { ChatMessage } from "@/components/chat/chat-message"
import { ImageUpload } from "@/components/chat/image-upload"
import { FileUpload } from "@/components/chat/file-upload"
import { useChat } from "@/hooks/use-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProcessedFile } from "@/lib/services/file-processor"

const AI_MODELS = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o", multimodal: true },
    { value: "gpt-4o-mini", label: "GPT-4o mini", multimodal: true },
    { value: "o1-preview", label: "o1-preview", multimodal: false },
    { value: "o1-mini", label: "o1-mini", multimodal: false },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", multimodal: true },
    { value: "claude-3-opus", label: "Claude 3 Opus", multimodal: true },
    { value: "claude-3-haiku", label: "Claude 3 Haiku", multimodal: true },
  ],
  google: [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", multimodal: true },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", multimodal: true },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", multimodal: true },
  ],
}

export default function ChatPage() {
  const [selectedProvider, setSelectedProvider] = useState<keyof typeof AI_MODELS>("openai")
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const [message, setMessage] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const { messages, isLoading, sendMessage } = useChat()

  const currentModel = AI_MODELS[selectedProvider].find(m => m.value === selectedModel)
  const isMultimodal = currentModel?.multimodal || false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    // Combine message with file contents if any
    let fullMessage = message
    if (processedFiles.length > 0) {
      const fileContents = processedFiles
        .filter(f => !f.error)
        .map(f => `[${f.filename}]\n${f.content}`)
        .join('\n\n---\n\n')
      fullMessage = `${message}\n\n${fileContents}`
    }

    await sendMessage(fullMessage, selectedModel, uploadedImages)
    setMessage("")
    setUploadedImages([])
    setProcessedFiles([])
    setShowImageUpload(false)
    setShowFileUpload(false)
  }

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider as keyof typeof AI_MODELS)
    setSelectedModel(AI_MODELS[provider as keyof typeof AI_MODELS][0].value)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          AI 채팅
        </h1>
        <p className="text-muted-foreground mt-2">
          다양한 AI 모델과 대화하고 최적의 답변을 찾아보세요
        </p>
      </div>

      <Card className="h-[calc(100vh-200px)] flex flex-col">
        {/* Model Selector */}
        <div className="p-4 border-b">
          <Tabs value={selectedProvider} onValueChange={handleProviderChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedProvider} className="mt-4">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="AI 모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS[selectedProvider].map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.label}</span>
                        {model.multimodal && (
                          <ImageIcon className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground mt-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>AI와 대화를 시작해보세요</p>
              {isMultimodal && (
                <p className="text-sm mt-2">이미지도 함께 업로드할 수 있습니다</p>
              )}
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI가 응답을 생성하고 있습니다...</span>
            </div>
          )}
        </div>

        {/* Image Upload */}
        {showImageUpload && isMultimodal && (
          <div className="p-4 border-t bg-gray-50">
            <ImageUpload 
              onImagesChange={setUploadedImages}
              maxFiles={5}
            />
          </div>
        )}

        {/* File Upload */}
        {showFileUpload && (
          <div className="p-4 border-t bg-gray-50">
            <FileUpload 
              onFilesProcessed={setProcessedFiles}
              maxFiles={5}
            />
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={showFileUpload ? "bg-primary text-white" : ""}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            {isMultimodal && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowImageUpload(!showImageUpload)}
                className={showImageUpload ? "bg-primary text-white" : ""}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            )}
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isMultimodal ? "메시지를 입력하세요 (이미지도 업로드 가능)..." : "메시지를 입력하세요..."}
              className="resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {(uploadedImages.length > 0 || processedFiles.length > 0) && (
            <p className="text-sm text-muted-foreground mt-2">
              {uploadedImages.length > 0 && `${uploadedImages.length}개의 이미지`}
              {uploadedImages.length > 0 && processedFiles.length > 0 && ', '}
              {processedFiles.length > 0 && `${processedFiles.length}개의 파일`}
              {' 선택됨'}
            </p>
          )}
        </form>
      </Card>
    </div>
  )
}