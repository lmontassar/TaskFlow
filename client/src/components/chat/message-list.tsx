import { Message } from "./message"

interface MessageListProps {
  messages: any[]
  currentUser: any
  onEdit: (id: string, text: string, attachments: any[]) => void
  onDelete: (id: string) => void
  onReply: (message: any) => void
}

export function MessageList({ messages, currentUser, onEdit, onDelete, onReply }: MessageListProps) {
  // Group messages by date
  const groupedMessages: { [key: string]: any[] } = {}

  messages.forEach((message) => {
    const date = new Date(message?.createdAt).toLocaleDateString()
    if (!groupedMessages[date]) {
      groupedMessages[date] = []
    }
    groupedMessages[date].push(message)
  })

  // Find referenced messages
  const getReferencedMessage = (refId: string | null) => {
    if (!refId) return null
    return messages.find((msg) => msg.id === refId) || null
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">{date}</div>
          </div>

          {dateMessages.map((message) => (
            <Message
              key={message?.id}
              message={message}
              isOwn={message?.user.id === currentUser.id}
              referencedMessage={getReferencedMessage(message?.refTo)}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
