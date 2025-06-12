import { useState, useRef, useEffect } from "react";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import useChat from "../../hooks/useChat";
import useGetUser from "../../hooks/useGetUser";
import useGetUserForProfile from "../../hooks/useGetUserForProfile";
import Loading from "../../components/ui/loading";
import { forEach } from "lodash";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useParams } from "react-router-dom";
import useGetProject from "../../hooks/useGetProjects";
import useProject from "../../hooks/useProject";
import { Card } from "../../components/ui/card";
export function ChatsPage() {
  useEffect(() => {
    document.title = "TaskFlow - Chats";
  }, []);
  const { projects } = useGetProject();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const { project, getProjectById } = useProject();
  useEffect(() => {
    if (selectedProjectId !== null) {
      getProjectById(selectedProjectId);
    }
  }, [selectedProjectId]);
  if (!projects) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-2">
      {/* Sidebar with project list */}
      <aside className="w-64 p-4 overflow-y-auto bg-card text-card-foreground rounded-xl border py-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Projets</h2>
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`cursor-pointer px-3 py-2 rounded-md ${
                project.id === selectedProjectId
                  ? "bg-violet-100 text-violet-700 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {project.nom}
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat area */}
      <main className="flex-1">
        {project ? (
          <Card className="flex flex-col h-[88dvh]">
            <ChatPage project={project} />
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Sélectionnez un projet pour commencer la discussion.
          </div>
        )}
      </main>
    </div>
  );
}
export default function ChatPage({ project }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>();
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addMessage, uploadFile, EditMessage, DeleteFile, DeleteMessage } =
    useChat();
  const { user } = useGetUserForProfile();
  // Scroll to bottom when messages change
  const token = localStorage.getItem("authToken") || "";

  useEffect(() => {
    setMessages(project.messages);
  }, [project.id]);

  useEffect(() => {
    setCurrentUser({
      id: user?.id,
      nom: user?.nom,
      prenom: user?.prenom,
      avatar: user?.avatar,
    });
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clientRef = useRef<any>(null);

  const handleAddMessage = (message: any) => {
    setMessages((prevMessages) => {
      const existingIndex = prevMessages.findIndex((m) => m.id === message.id);
      if (existingIndex !== -1) {
        // Replace the existing message with the new one (e.g. edited)
        const updatedMessages = [...prevMessages];
        updatedMessages[existingIndex] = message;
        return updatedMessages;
      }
      // Add new message
      return [...prevMessages, message];
    });
  };

  const handleRemoveMessage = (messageID: any) => {
    setMessages((prevMessages) => {
      return prevMessages?.filter((msg) => msg.id != messageID);
    });
  };

  useEffect(() => {
    if (!project || clientRef.current) return;
    const socket = new SockJS("/ws");
    const client = Stomp.over(socket);
    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        client.subscribe(`/topic/messages/${project.id}`, async (message) => {
          const msg = JSON.parse(message.body);
          handleAddMessage(msg);
        });
        client.subscribe(
          `/topic/message/delete/${project.id}`,
          async (message) => {
            const messageID = message.body;
            handleRemoveMessage(messageID);
          }
        );
      },
      (error: any) => {
        console.error("Projects WebSocket error:", error);
      }
    );
  }, [project?.id]);

  const handleSendMessage = async (text: string, attachments: any[]) => {
    const newMessage: any = {
      project: { id: project?.id },
      text,
      refTo: replyTo ? { id: replyTo.id } : null,
    };

    const savedMessage = await addMessage(newMessage);
    if (savedMessage) {
      for (let i = 0; i < attachments.length; i++) {
        const uploadedFile = await uploadFile(
          attachments[i].file,
          savedMessage
        );
        savedMessage.attachments = [...savedMessage.attachments, uploadedFile];
      }
      setMessages([...messages, savedMessage]);
      setReplyTo(null);
    }
    console.log(savedMessage);
  };

  const handleEditMessage = async (
    message: any,
    newText: string,
    newAttachments: any[]
  ) => {
    const EditedMessage = await EditMessage({
      id: message.id,
      text: newText == null ? "" : newText,
      project: { id: project?.id },
    });
    const t: any = { atts: [] };
    message.attachments.forEach(async (att: any) => {
      const attachment = newAttachments.filter((a: any) => a.id === att.id);
      if (attachment.length == 0) {
        t.atts = [...t.atts, att.id];
      }
    });
    await DeleteFile(t.atts, message.id);
    setMessages(
      messages?.map((msg) =>
        msg.id === message.id
          ? { ...msg, text: newText, attachments: newAttachments, edited: true }
          : msg
      )
    );
  };

  const handleDeleteMessage = async (id: string) => {
    await DeleteMessage(id);
    setMessages(messages?.filter((msg) => msg.id !== id));
  };

  const handleReply = (message: any) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };
  if (messages == null || project == null) return <Loading></Loading>;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white shadow-sm border-b p-4">
        <h1 className="text-xl font-semibold">{project.nom}</h1>
        <p className="text-sm text-gray-500">
          {messages?.length} messages in this chat
        </p>
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
        <MessageInput
          onSendMessage={handleSendMessage}
          replyTo={replyTo}
          onCancelReply={cancelReply}
        />
      </div>
    </div>
  );
}
