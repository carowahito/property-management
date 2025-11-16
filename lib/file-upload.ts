/**
 * File Upload Utility
 * Handles file uploads for documents, receipts, evidence, and other files
 */

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
  uploadedBy: string
}

export interface UploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

/**
 * Mock file upload handler
 * In production, this would upload to S3, Azure Blob Storage, or similar
 */
export async function uploadFile(
  file: File,
  category: 'document' | 'receipt' | 'evidence' | 'profile' | 'property',
  metadata?: {
    userId?: string
    propertyId?: string
    jobId?: string
    [key: string]: any
  },
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    // Validate file
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      reject(new Error('File size exceeds 10MB limit'))
      return
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (!allowedTypes.includes(file.type)) {
      reject(new Error('File type not supported'))
      return
    }

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      
      if (onProgress) {
        onProgress({
          filename: file.name,
          progress,
          status: progress < 100 ? 'uploading' : 'completed',
        })
      }

      if (progress >= 100) {
        clearInterval(interval)

        // Generate mock URL (in production, this would be S3/Azure URL)
        const mockUrl = `https://storage.example.com/${category}/${Date.now()}-${file.name}`

        const uploadedFile: UploadedFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: mockUrl,
          uploadedAt: new Date().toISOString(),
          uploadedBy: metadata?.userId || 'unknown',
        }

        resolve(uploadedFile)
      }
    }, 200)
  })
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  category: 'document' | 'receipt' | 'evidence' | 'profile' | 'property',
  metadata?: {
    userId?: string
    propertyId?: string
    jobId?: string
    [key: string]: any
  },
  onProgress?: (progress: UploadProgress[]) => void
): Promise<UploadedFile[]> {
  const progressMap = new Map<string, UploadProgress>()

  const uploadPromises = files.map((file) =>
    uploadFile(file, category, metadata, (progress) => {
      progressMap.set(file.name, progress)
      
      if (onProgress) {
        onProgress(Array.from(progressMap.values()))
      }
    })
  )

  return Promise.all(uploadPromises)
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulate API call
    setTimeout(() => {
      // In production, this would call the backend API to delete from storage
      console.log(`Deleting file: ${fileId}`)
      resolve(true)
    }, 500)
  })
}

/**
 * Get file download URL
 */
export function getFileDownloadUrl(fileUrl: string): string {
  // In production, generate signed URL for private files
  return fileUrl
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

/**
 * Get file icon based on type
 */
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType === 'application/pdf') return '📄'
  if (fileType.includes('word')) return '📝'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
  return '📎'
}
