"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void
  maxFiles?: number
  className?: string
}

export function ImageUpload({ 
  onImagesChange, 
  maxFiles = 5,
  className 
}: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다.`)
      return
    }

    const newImages = [...images, ...acceptedFiles]
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file))
    
    setImages(newImages)
    setPreviews([...previews, ...newPreviews])
    onImagesChange(newImages)
  }, [images, previews, maxFiles, onImagesChange])

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index])
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    
    setImages(newImages)
    setPreviews(newPreviews)
    onImagesChange(newImages)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: maxFiles - images.length,
    disabled: images.length >= maxFiles
  })

  return (
    <div className={className}>
      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
            images.length >= maxFiles && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <ImagePlus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "이미지를 여기에 놓으세요"
              : "이미지를 드래그하거나 클릭하여 업로드"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            최대 {maxFiles}개 / PNG, JPG, GIF, WebP
          </p>
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-24 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}