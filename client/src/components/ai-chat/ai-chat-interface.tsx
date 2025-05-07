"use client";

import { useState, useRef, useEffect } from "react";
import { AIChatHeader } from "@/components/ai-chat/ai-chat-header";
import { AIChatSidebar } from "@/components/ai-chat/ai-chat-sidebar";
import { AIChatInput } from "@/components/ai-chat/ai-chat-input";
import AIChatMessages from "@/components/ai-chat/ai-chat-messages";
import { useMediaQuery } from "@/hooks/use-mobile";
import { v4 as uuidv4 } from "uuid";

const SYSTEM_PROMPT = `You are a project management AI assistant named TaskFlowAI. You help users manage projects by creating projects, adding and assigning tasks, tracking progress, and generating reports. If someone asks something unrelated, respond that your scope is limited to project management.`;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
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
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only create session on first mount
  useEffect(() => {
    if (sessions.length === 0) {
      const session = createNewSession();
      setSessions([session]);
      setCurrentSession(session);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewSession = (): ChatSession => {
    return {
      id: uuidv4(),
      title: "New Conversation",
      lastMessage: "",
      timestamp: new Date(),
      messages: [
        {
          id: uuidv4(),
          role: "system",
          content: SYSTEM_PROMPT,
          timestamp: new Date(),
        },
      ],
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
      attachments: attachments?.map((file) => ({
        id: uuidv4(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
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
    const updatedSession = {
      ...session,
      lastMessage: message,
      timestamp: new Date(),
      messages: updatedMessages,
    };

    updateSessionState(updatedSession);

    try {
      // In a production environment, this should be a server-side API route
      // to keep your API keys secure
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY || " "}`, // ⚠️ Do NOT expose API keys in production!
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 1024,
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk
            .split("\n")
            .filter((line) => line.trim().startsWith("data:"));

          for (const line of lines) {
            const jsonStr = line.replace("data: ", "").trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                result += content;
                updateAssistantMessage(session.id, assistantMessageId, result);
              }
            } catch (err) {
              console.error("Error parsing stream chunk", err);
            }
          }
        }
      } else {
        throw new Error("Response body is null");
      }

      finalizeAssistantMessage(session.id, assistantMessageId);

      // Update session title if it's a new conversation
      if (updatedSession.title === "New Conversation") {
        const newTitle = generateSessionTitle(message);
        updateSessionTitle(session.id, newTitle);
      }
    } catch (err) {
      console.error("Error fetching from API", err);
      updateAssistantMessage(
        session.id,
        assistantMessageId,
        "Sorry, I encountered an error. Please try again."
      );
      finalizeAssistantMessage(session.id, assistantMessageId);
    }

    setIsProcessing(false);
  };

  const generateSessionTitle = (message: string) => {
    // Generate a title based on the first user message
    if (message.length <= 20) return message;
    return message.substring(0, 20) + "...";
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

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(updatedSessions);
    if (currentSession?.id === sessionId) {
      setCurrentSession(updatedSessions[0] || null);
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
