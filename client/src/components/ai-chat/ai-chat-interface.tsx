"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { AIChatHeader } from "@/components/ai-chat/ai-chat-header";
import { AIChatSidebar } from "@/components/ai-chat/ai-chat-sidebar";
import { AIChatInput } from "@/components/ai-chat/ai-chat-input";
import AIChatMessages from "@/components/ai-chat/ai-chat-messages";
import { useMediaQuery } from "@/hooks/use-mobile";
import useProject from "../../hooks/useProject";
import { useParams } from "react-router-dom";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export function AIChatInterface() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const token = localStorage.getItem("authToken") || "";

  const { projectId } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`/api/ai-chat/getChats/${projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch chats");
        }

        const data = await response.json();

        const formattedSessions: ChatSession[] = data.map((session: any) => ({
          id: session.id,
          title: session.title,
          lastMessage: session.lastMessage,
          timestamp: new Date(session.timestamp),
          messages: session.messageList.map((message: any) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            timestamp: new Date(message.timestamp),
          })),
        }));

        console.log("Fetched sessions:", formattedSessions);
        setSessions(formattedSessions);
        setCurrentSession(formattedSessions[0] || null);
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
      }
    };

    if (projectId) {
      fetchChats();
    }

    return () => {
      setSessions([]);
      setCurrentSession(null);
    };
  }, [projectId, token]);

  useEffect(() => {
    if (sessions.length === 0) {
      const session = createNewSession();
      setSessions([session]);
      setCurrentSession(session);
    }
  }, []);

  useEffect(() => {
    if (currentSession?.messages) {
      scrollToBottom();
    }
  }, [currentSession?.messages]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewSession = (): ChatSession => {
    return {
      id: "",
      title: "New Conversation",
      lastMessage: "",
      timestamp: new Date(),
      messages: [],
    };
  };

  const handleSendMessage = async (message: string, attachments?: File[]) => {
    if (!message.trim() && (!attachments || attachments.length === 0)) return;

    setIsProcessing(true);
    const session = currentSession ?? createAndSetNewSession();

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    const assistantMessageId = uuidv4();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    const updatedMessages = [
      ...session.messages,
      userMessage,
      assistantMessage,
    ];
    const updatedSession: ChatSession = {
      ...session,
      lastMessage: message,
      timestamp: new Date(),
      messages: updatedMessages,
    };

    updateSessionState(updatedSession);

    try {
      const response = await fetch("/api/ai-chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          projectID: projectId,
          AIChatId: currentSession?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      updateAssistantMessage(session.id, assistantMessageId, data.content);
      finalizeAssistantMessage(session.id, assistantMessageId);

      if (updatedSession.title === "New Conversation") {
        const newTitle = generateSessionTitle(message);
        updateSessionTitle(session.id, newTitle);
      }
    } catch (err) {
      console.error("API error", err);
      updateAssistantMessage(
        session.id,
        assistantMessageId,
        "Sorry, I encountered an error."
      );
      finalizeAssistantMessage(session.id, assistantMessageId);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSessionTitle = (message: string) => {
    return message.length <= 20 ? message : message.substring(0, 20) + "...";
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title } : s))
    );
    if (currentSession?.id === sessionId) {
      setCurrentSession((prev) => (prev ? { ...prev, title } : null));
    }
  };

  const createAndSetNewSession = () => {
    const session = createNewSession();
    setSessions((prev) => [session, ...prev]);
    setCurrentSession(session);
    return session;
  };

  const updateSessionState = (updatedSession: ChatSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    setCurrentSession(updatedSession);
  };

  const updateAssistantMessage = (
    sessionId: string,
    messageId: string,
    content: string
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id !== sessionId
          ? session
          : {
              ...session,
              messages: session.messages.map((msg) =>
                msg.id === messageId ? { ...msg, content } : msg
              ),
            }
      )
    );

    if (currentSession?.id === sessionId) {
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === messageId ? { ...msg, content } : msg
              ),
            }
          : null
      );
    }
  };

  const finalizeAssistantMessage = (sessionId: string, messageId: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id !== sessionId
          ? session
          : {
              ...session,
              messages: session.messages.map((msg) =>
                msg.id === messageId ? { ...msg, isLoading: false } : msg
              ),
            }
      )
    );

    if (currentSession?.id === sessionId) {
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === messageId ? { ...msg, isLoading: false } : msg
              ),
            }
          : null
      );
    }
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) setCurrentSession(session);
    if (isMobile) setSidebarOpen(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    console.log("Deleting session with ID:", sessionId);
    try {
      const response = await fetch(`/api/ai-chat/${sessionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);
      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSessions[0] || null);
      }
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden rounded-lg border bg-background shadow-sm">
      <AIChatSidebar
        isOpen={sidebarOpen}
        sessions={sessions}
        currentSessionId={currentSession?.id}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewSession={createAndSetNewSession}
      />
      <div className="flex flex-1 flex-col">
        <AIChatHeader
          title={currentSession?.title || "New Conversation"}
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {currentSession ? (
            <>
              <AIChatMessages
                messages={currentSession.messages}
                messagesEndRef={messagesEndRef}
              />
              <AIChatInput
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-muted-foreground">
              Start a new conversation to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
