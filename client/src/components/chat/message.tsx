import { useState } from "react"
import { formatDistanceToNow, isSameDay, isSameMonth, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AttachmentList } from "./attachment-list"
import { MoreHorizontal, Edit, Trash2, Reply, Check, X, FileIcon, FileTextIcon, ImageIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface MessageProps {
  message: any
  isOwn: boolean
  referencedMessage: any | null
  onEdit: (message: any, text: string, attachments: any[]) => void
  onDelete: (id: string) => void
  onReply: (message: any) => void
}

export function Message({ message, isOwn, referencedMessage, onEdit, onDelete, onReply }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.text)
  const [editAttachments, setEditAttachments] = useState<any[]>([])

  const handleEdit = () => {
    setIsEditing(true)
    setEditText(message?.text)
    setEditAttachments([...message.attachments])
  }

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(message, editText, editAttachments)
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(message.id)
  }

  const handleReply = () => {
    onReply(message)
  }

  const handleDeleteAttachment = (attachmentId: string) => {
    setEditAttachments(editAttachments.filter((att) => att.id !== attachmentId))
  }

  // const timeAgo = formatDistanceToNow(message.createdAt, { addSuffix: true })
  const createdDate = new Date(message.createdAt)
  const displayTime = isSameDay(createdDate, new Date())
    // ─── Today: time only ─────────────────────────────────────────────
    ? format(createdDate, "h:mm a")
    // ─── Same month, different day: weekday + time ──────────────────
    : isSameMonth(createdDate, new Date())
      ? format(createdDate, "EEEE h:mm a")
      // ─── Different month: full month/day/year + time ───────────────
      : format(createdDate, "MMMM d, yyyy, h:mm a")

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4 max-w-full`}>
      <div className={`max-w-[80%] ${isOwn ? "order-2" : "order-1"}`}>
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"} items-center mb-2`}>
          {!isOwn && (
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={message.user.avatar || "/placeholder.svg"} alt={message.user.nom} />
              <AvatarFallback>
                {message.user.prenom.charAt(0)}
                {message.user.nom.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
            <span className="text-sm font-medium">{isOwn ? "You" : `${message.user.prenom} ${message.user.nom}`}</span>
            <span className="text-xs text-gray-500">{displayTime}</span>
          </div>
          {isOwn && (
            <Avatar className="h-8 w-8 ml-2">
              <AvatarImage src={message.user.avatar || "/placeholder.svg"} alt={message.user.nom} />
              <AvatarFallback>
                {message.user.prenom.charAt(0)}
                {message.user.nom.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        <Card className={`${isOwn ? "bg-blue-50 border-blue-100" : "bg-white"} shadow-sm p-0 gap-0`}>
          {referencedMessage && (
            <div className="px-2 pt-3 pb-0">
              <div className="border-l-2 border-gray-300 pl-3 pr-3 py-1 text-sm text-gray-600 bg-gray-50 rounded-sm mb-2">
                <div className="font-medium">
                  {referencedMessage.user.prenom} {referencedMessage.user.nom}
                </div>
                <div className="truncate">
                  {referencedMessage.text.length > 60
                    ? `${referencedMessage.text.substring(0, 60)}...`
                    : referencedMessage.text}
                </div>
              </div>
            </div>
          )}

          <CardContent className="p-2 pl-4 pr-4">
            {isEditing ? (
              <Textarea
                value={editText}
                onChange={(e: any) => setEditText(e.target.value)}
                className="min-h-[100px]"
                autoFocus
              />
            ) : (
              <>
                <div className="whitespace-pre-wrap break-words">{message.text}</div>
                {message.edited && <span className="text-xs text-gray-500 mt-1 inline-block">(edited)</span>}
              </>
            )}

            {isEditing
              ? editAttachments.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">Attachments</div>
                  <div className="space-y-2">
                    {editAttachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center p-2 border rounded-md">
                        <div className="mr-2 text-gray-500">
                          {attachment.type.startsWith("image/") ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : attachment.type.includes("pdf") || attachment.type.includes("doc") ? (
                            <FileTextIcon className="h-4 w-4" />
                          ) : (
                            <FileIcon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{attachment.name}</div>
                          <div className="text-xs text-gray-500">
                            {attachment.size < 1
                              ? `${Math.round(attachment.size * 1000)} KB`
                              : `${attachment.size.toFixed(1)} MB`}
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )
              : message.attachments.length > 0 && (
                <div className="mt-3">
                  <AttachmentList attachments={message.attachments} />
                </div>
              )}
          </CardContent>

          {isEditing ? (
            <CardFooter className="flex justify-end space-x-2 p-3">
              <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} className="h-8">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </CardFooter>
          ) : (
            <>
              {isOwn && (
                <CardFooter className="flex justify-end p-3 pt-0">

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-7 px-2">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </CardFooter>
              )}
            </>
          )}
        </Card>
        <div className={`mt-1 flex ${isOwn ? "justify-end" : "justify-start"}`}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReply}
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        </div>
      </div>
    </div>
  )
}
