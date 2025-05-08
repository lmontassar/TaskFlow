import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, X } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (text: string, attachments: any[]) => void
  replyTo: any | null
  onCancelReply: () => void
}

export function MessageInput({ onSendMessage, replyTo, onCancelReply }: MessageInputProps) {
  const [text, setText] = useState("")
  const [attachments, setAttachments] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim() || attachments.length > 0) {
      onSendMessage(text, attachments)
      setText("")
      setAttachments([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: `att${Date.now()}${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size / (1024 * 1024), // Convert to MB
        type: file.type,
        url: URL.createObjectURL(file),
        file,
      }))
      setAttachments([...attachments, ...newFiles])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        id: `att${Date.now()}${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size / (1024 * 1024),
        type: file.type,
        url: URL.createObjectURL(file),
        file,
      }))
      setAttachments([...attachments, ...newFiles])
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((att) => att.id !== id))
  }

  return (
    <div>
      {replyTo && (
        <div className="flex items-center mb-2 p-2 bg-gray-50 rounded-md">
          <div className="flex-1">
            <div className="text-sm text-gray-500">
              Replying to{" "}
              <span className="font-medium">
                {replyTo.user.prenom} {replyTo.user.nom}
              </span>
            </div>
            <div className="text-sm truncate">{replyTo.text}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={onCancelReply} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          className={`border rounded-md ${isDragging ? "border-blue-500 bg-blue-50" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[100px] max-h-[100px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none overflow-y-auto scroll-smooth"
          />

          {attachments.length > 0 && (
            <div className="p-2 border-t">
              <div className="text-sm font-medium mb-2">Attachments ({attachments.length})</div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center bg-gray-100 rounded-md p-1 pr-2">
                    <span className="text-xs truncate max-w-[150px]">{att.name}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(att.id)}
                      className="h-5 w-5 p-0 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center p-2 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500"
            >
              <Paperclip className="h-4 w-4 mr-1" />
              Attach
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
            <Button type="submit" size="sm">
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
