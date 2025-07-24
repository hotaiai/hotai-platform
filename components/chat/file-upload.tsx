"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { FileText, Upload, X, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FileProcessor, ProcessedFile } from "@/lib/services/file-processor"
import { Card } from "@/components/ui/card"

interface FileUploadProps {
  onFilesProcessed: (files: ProcessedFile[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  className?: string
}

export function FileUpload({ 
  onFilesProcessed, 
  maxFiles = 5,
  maxSize = 10, // 10MB default
  className 
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [processing, setProcessing] = useState(false)

  const processFiles = async (newFiles: File[]) => {
    setProcessing(true)
    const processed: ProcessedFile[] = []

    for (const file of newFiles) {
      const result = await FileProcessor.processFile(file)
      processed.push(result)
    }

    setProcessedFiles([...processedFiles, ...processed])
    onFilesProcessed([...processedFiles, ...processed])
    setProcessing(false)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`)
      return
    }

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`${file.name}은 ${maxSize}MB를 초과합니다.`)
        return false
      }
      if (!FileProcessor.isSupported(file.type)) {
        alert(`${file.name}은 지원하지 않는 파일 형식입니다.`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles])
      await processFiles(validFiles)
    }
  }, [files, processedFiles, maxFiles, maxSize, onFilesProcessed])

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    const newProcessed = processedFiles.filter((_, i) => i !== index)
    
    setFiles(newFiles)
    setProcessedFiles(newProcessed)
    onFilesProcessed(newProcessed)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/html': ['.html'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles || processing
  })

  return (
    <div className={className}>
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
            (files.length >= maxFiles || processing) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            {isDragActive
              ? "파일을 여기에 놓으세요"
              : "파일을 드래그하거나 클릭하여 업로드"}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            PDF, DOCX, TXT, CSV, JSON, HTML, MD • 최대 {maxFiles}개 • {maxSize}MB 이하
          </p>
        </div>
      )}

      {processedFiles.length > 0 && (
        <div className="space-y-2 mt-4">
          {processedFiles.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <FileText className={cn(
                    "w-5 h-5 mt-0.5 flex-shrink-0",
                    file.error ? "text-red-500" : "text-blue-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.filename}</p>
                    <p className="text-xs text-gray-500">
                      {FileProcessor.formatFileSize(file.size)}
                      {file.content && !file.error && 
                        ` • ${file.content.length.toLocaleString()} 문자`
                      }
                    </p>
                    {file.error && (
                      <div className="flex items-center mt-1 text-xs text-red-500">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {file.error}
                      </div>
                    )}
                    {!file.error && (
                      <div className="flex items-center mt-1 text-xs text-green-600">
                        <Check className="w-3 h-3 mr-1" />
                        처리 완료
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8"
                  onClick={() => removeFile(index)}
                  disabled={processing}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {processing && (
        <div className="text-center py-4">
          <div className="inline-flex items-center text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            파일 처리 중...
          </div>
        </div>
      )}
    </div>
  )
}