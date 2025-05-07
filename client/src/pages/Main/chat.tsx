import { useState, useRef, useEffect } from "react"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import useChat from "../../hooks/useChat"
import useGetUser from "../../hooks/useGetUser"
import useGetUserForProfile from "../../hooks/useGetUserForProfile"
import Loading from "../../components/ui/loading"
import { forEach } from "lodash"

// Mock current user


export default function ChatPage({ project }: any) {
  const [messages, setMessages] = useState<any[]>()
  const [currentUser, setCurrentUser] = useState<any>();
  const [replyTo, setReplyTo] = useState<any | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addMessage, uploadFile, EditMessage, DeleteFile ,DeleteMessage } = useChat();
  const { user, setUser, loading, error, refreshUser } = useGetUserForProfile();
  // Scroll to bottom when messages change

  useEffect(() => {
    setMessages(project.messages);
  }, [project])
  useEffect(() => {
    setCurrentUser({
      id: user?.id,
      nom: user?.nom,
      prenom: user?.prenom,
      avatar: user?.avatar,
    });
  }, [user])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])



  const handleSendMessage = async (text: string, attachments: any[]) => {
    const newMessage: any = {
      project: { id: project?.id },
      text,
      refTo: replyTo ? { id: replyTo.id } : null,
    }

    const savedMessage = await addMessage(newMessage);
    if (savedMessage) {
      for (let i = 0; i < attachments.length; i++) {
        const uploadedFile = await uploadFile(attachments[i].file, savedMessage);
        savedMessage.attachments = [...savedMessage.attachments, uploadedFile];
      }
      setMessages([...messages, savedMessage])
      setReplyTo(null)
    }
    console.log(savedMessage)
  }
  
  const handleEditMessage = async (message: any, newText: string, newAttachments: any[]) => {
    const EditedMessage = await EditMessage({ id: message.id, text: newText == null ? "" : newText, project: { id: project?.id } });
    const t :any = {atts:[]} ;
    message.attachments.forEach(async (att: any) => {
      const attachment = newAttachments.filter((a: any) => a.id === att.id)
      if (attachment.length == 0) {
        
        t.atts = [...t.atts,att.id] ;
        
      } 
    })
    await DeleteFile(t.atts,message.id);
    setMessages(
      messages?.map((msg) =>
        msg.id === message.id ? { ...msg, text: newText, attachments: newAttachments, edited: true } : msg,
      ),
    )
  }

  const handleDeleteMessage = async  (id: string) => {
    await DeleteMessage(id);
    setMessages(messages?.filter((msg) => msg.id !== id))
  }

  const handleReply = (message: any) => {
    setReplyTo(message)
  }

  const cancelReply = () => {
    setReplyTo(null)
  }
  if (messages == null || project == null)
    return (
      <Loading></Loading>
    )

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white shadow-sm border-b p-4">
        <h1 className="text-xl font-semibold">{project.nom}</h1>
        <p className="text-sm text-gray-500">{messages?.length} messages in this chat</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={messages}
          currentUser={currentUser}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
          onReply={handleReply}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4 mt-auto">
        <MessageInput onSendMessage={handleSendMessage} replyTo={replyTo} onCancelReply={cancelReply} />
      </div>
    </div>
  )
}
