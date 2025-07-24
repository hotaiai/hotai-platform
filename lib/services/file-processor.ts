import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import csv from 'csv-parser'
import { Readable } from 'stream'

export interface ProcessedFile {
  filename: string
  content: string
  mimeType: string
  size: number
  pageCount?: number
  error?: string
}

export class FileProcessor {
  static async processFile(file: File): Promise<ProcessedFile> {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const result: ProcessedFile = {
      filename: file.name,
      content: '',
      mimeType: file.type,
      size: file.size
    }

    try {
      switch (file.type) {
        case 'application/pdf':
          result.content = await this.processPDF(buffer)
          break
          
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          result.content = await this.processDOCX(buffer)
          break
          
        case 'text/csv':
          result.content = await this.processCSV(buffer)
          break
          
        case 'text/plain':
        case 'text/markdown':
        case 'text/html':
        case 'application/json':
          result.content = buffer.toString('utf-8')
          break
          
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.ms-excel':
          result.content = await this.processExcel(buffer)
          break
          
        default:
          throw new Error(`Unsupported file type: ${file.type}`)
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Failed to process file'
    }

    return result
  }

  private static async processPDF(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer)
    return data.text
  }

  private static async processDOCX(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  private static async processCSV(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const results: any[] = []
      const stream = Readable.from(buffer.toString())
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // Convert CSV data to readable format
          if (results.length > 0) {
            const headers = Object.keys(results[0])
            const content = [
              headers.join(' | '),
              headers.map(() => '---').join(' | '),
              ...results.map(row => 
                headers.map(h => row[h] || '').join(' | ')
              )
            ].join('\n')
            resolve(content)
          } else {
            resolve('')
          }
        })
        .on('error', reject)
    })
  }

  private static async processExcel(buffer: Buffer): Promise<string> {
    // For now, return a message. In production, you'd use a library like xlsx
    return 'Excel file processing not implemented. Please convert to CSV format.'
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static isSupported(mimeType: string): boolean {
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/csv',
      'text/plain',
      'text/markdown',
      'text/html',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    return supportedTypes.includes(mimeType)
  }
}