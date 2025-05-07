"use client";

import type React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Check, FileText, FileImage } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import type { ChatMessage } from "./ai-chat-interface";
import { cn } from "@/lib/utils";

interface AIChatMessagesProps {
  messages: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function AIChatMessages({
  messages,
  messagesEndRef,
}: AIChatMessagesProps) {
  const [copiedMessages, setCopiedMessages] = useState<Record<string, boolean>>(
    {}
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Reset copied status after 2 seconds
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    Object.entries(copiedMessages).forEach(([id, copied]) => {
      if (copied) {
        const timer = setTimeout(() => {
          setCopiedMessages((prev) => ({ ...prev, [id]: false }));
        }, 2000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [copiedMessages]);

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessages((prev) => ({ ...prev, [messageId]: true }));
  };

  const formatMessageContent = (content: string) => {
    // Convert line breaks to <br> tags
    const withLineBreaks = content.replace(/\n/g, "<br>");

    // Convert URLs to links
    const withLinks = withLineBreaks.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>'
    );

    return withLinks;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <FileImage className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-scroll px-4 py-2 scroll-smooth">
      {messages.map((message) => {
        if (message.role === "system") {
          return (
            <div
              key={message.id}
              className="mx-auto max-w-2xl rounded-lg bg-muted/50 p-4 text-center"
            >
              <p
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: formatMessageContent(message.content),
                }}
              />
            </div>
          );
        }

        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              {message.role === "user" ? (
                <>
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="User"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="AI"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
                </>
              )}
            </Avatar>

            <div
              className={cn(
                "flex max-w-[80%] flex-col gap-1",
                message.role === "user" ? "items-end" : ""
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {message.role === "user" ? "You" : "AI Assistant"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(message.timestamp, "h:mm a")}
                </span>
              </div>

              <div
                className={cn(
                  "rounded-lg px-3 py-2",
                  message.role === "user"
                    ? "rounded-tr-none bg-primary text-primary-foreground"
                    : "rounded-tl-none bg-muted"
                )}
              >
                {message.isLoading ? (
                  <>
                    <div
                      className="whitespace-pre-wrap break-words text-sm"
                      dangerouslySetInnerHTML={{
                        __html: formatMessageContent(message.content),
                      }}
                    />
                    <div className="mt-1 flex items-center gap-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-current"></div>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-current animation-delay-200"></div>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-current animation-delay-500"></div>
                    </div>
                  </>
                ) : (
                  <div
                    className="whitespace-pre-wrap break-words text-sm"
                    dangerouslySetInnerHTML={{
                      __html: formatMessageContent(message.content),
                    }}
                  />
                )}
              </div>

              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-1 space-y-2">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={cn(
                        "flex items-center gap-2 rounded-md border p-2",
                        message.role === "user"
                          ? "bg-primary/10"
                          : "bg-background"
                      )}
                    >
                      {getFileIcon(attachment.type)}
                      <span className="text-sm">{attachment.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {message.role === "assistant" && !message.isLoading && (
                <div className="mt-1 flex justify-end">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            copyToClipboard(message.content, message.id)
                          }
                        >
                          {copiedMessages[message.id] ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {copiedMessages[message.id]
                            ? "Copied!"
                            : "Copy to clipboard"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
