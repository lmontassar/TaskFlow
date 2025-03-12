"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Archive,
  Forward,
  MoreHorizontal,
  Reply,
  ReplyAll,
  Star,
  Trash,
} from "lucide-react";

// Sample data for inbox messages
const messages = [
  {
    id: 1,
    read: false,
    flagged: true,
    from: {
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AJ",
    },
    subject: "Website Redesign Updates",
    preview:
      "I've attached the latest mockups for the homepage redesign. Please review and provide feedback by EOD.",
    attachments: 2,
    time: "10:30 AM",
    date: "Today",
    project: "Website Redesign",
  },
  {
    id: 2,
    read: false,
    flagged: false,
    from: {
      name: "Sarah Miller",
      email: "sarah@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SM",
    },
    subject: "Design Review Meeting",
    preview:
      "Let's schedule a design review meeting for tomorrow at 2 PM to discuss the new UI components.",
    attachments: 0,
    time: "9:15 AM",
    date: "Today",
    project: "Website Redesign",
  },
  {
    id: 3,
    read: true,
    flagged: false,
    from: {
      name: "David Chen",
      email: "david@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DC",
    },
    subject: "API Integration Progress",
    preview:
      "I've completed the initial API integration for the user authentication module. Ready for testing.",
    attachments: 1,
    time: "Yesterday",
    date: "Mar 11",
    project: "Mobile App Development",
  },
  {
    id: 4,
    read: true,
    flagged: false,
    from: {
      name: "Emma Wilson",
      email: "emma@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EW",
    },
    subject: "Backend Development Update",
    preview:
      "The database schema has been updated. Please pull the latest changes and update your local environment.",
    attachments: 0,
    time: "Yesterday",
    date: "Mar 11",
    project: "Mobile App Development",
  },
  {
    id: 5,
    read: false,
    flagged: true,
    from: {
      name: "James Brown",
      email: "james@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JB",
    },
    subject: "Urgent: Server Deployment Issue",
    preview:
      "We're experiencing some issues with the latest deployment. Can we hop on a call to discuss?",
    attachments: 0,
    time: "2 days ago",
    date: "Mar 10",
    project: "Mobile App Development",
  },
  {
    id: 6,
    read: true,
    flagged: false,
    from: {
      name: "Olivia Davis",
      email: "olivia@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "OD",
    },
    subject: "Marketing Campaign Draft",
    preview:
      "Here's the draft for our Q2 marketing campaign. Please review the messaging and creative assets.",
    attachments: 3,
    time: "2 days ago",
    date: "Mar 10",
    project: "Marketing Campaign",
  },
  {
    id: 7,
    read: true,
    flagged: true,
    from: {
      name: "Noah Smith",
      email: "noah@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "NS",
    },
    subject: "Social Media Strategy",
    preview:
      "I've outlined our social media strategy for the product launch. Let me know your thoughts.",
    attachments: 1,
    time: "3 days ago",
    date: "Mar 9",
    project: "Marketing Campaign",
  },
  {
    id: 8,
    read: true,
    flagged: false,
    from: {
      name: "Sophia Lee",
      email: "sophia@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SL",
    },
    subject: "Content Calendar Update",
    preview:
      "The content calendar for April has been updated. Please check if your deliverables are correctly scheduled.",
    attachments: 1,
    time: "4 days ago",
    date: "Mar 8",
    project: "Marketing Campaign",
  },
];

export function InboxList() {
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [openMessage, setOpenMessage] = useState<(typeof messages)[0] | null>(
    null
  );

  const toggleSelectMessage = (id: number) => {
    setSelectedMessages((prev) =>
      prev.includes(id)
        ? prev.filter((messageId) => messageId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((message) => message.id));
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                selectedMessages.length === messages.length &&
                messages.length > 0
              }
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedMessages.length > 0
                ? `${selectedMessages.length} selected`
                : "Select all"}
            </span>
          </div>
        </div>

        <div className="divide-y">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex cursor-pointer items-start gap-2 px-4 py-3 hover:bg-muted/50",
                !message.read && "bg-muted/20"
              )}
              onClick={() => setOpenMessage(message)}
            >
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  checked={selectedMessages.includes(message.id)}
                  onCheckedChange={() => toggleSelectMessage(message.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle flagged status logic would go here
                  }}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      message.flagged
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </Button>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={message.from.avatar}
                        alt={message.from.name}
                      />
                      <AvatarFallback>{message.from.initials}</AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "font-medium",
                        !message.read && "font-semibold"
                      )}
                    >
                      {message.from.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-sm">
                      {message.project}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {message.time}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          Mark as {message.read ? "Unread" : "Read"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Flag Message</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div>
                  <h3
                    className={cn("text-sm", !message.read && "font-semibold")}
                  >
                    {message.subject}
                  </h3>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {message.preview}
                  </p>
                </div>

                {message.attachments > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {message.attachments} attachment
                      {message.attachments > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Detail Dialog */}
      <Dialog
        open={!!openMessage}
        onOpenChange={(open) => !open && setOpenMessage(null)}
      >
        {openMessage && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {openMessage.subject}
              </DialogTitle>
              <DialogDescription className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={openMessage.from.avatar}
                      alt={openMessage.from.name}
                    />
                    <AvatarFallback>{openMessage.from.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{openMessage.from.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {openMessage.from.email}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {openMessage.date} at {openMessage.time}
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Badge variant="outline">{openMessage.project}</Badge>

              <div className="rounded-lg border p-4">
                <p className="whitespace-pre-line text-sm">
                  {openMessage.preview}
                  {/* Extended message content for demo purposes */}
                  {"\n\n"}I hope this email finds you well. I wanted to provide
                  an update on our progress with the {openMessage.project}.
                  {"\n\n"}
                  We've made significant progress on the tasks we discussed in
                  our last meeting. The team has been working diligently to
                  ensure we meet our deadlines.
                  {"\n\n"}
                  Please let me know if you have any questions or need any
                  clarification on the points mentioned above.
                  {"\n\n"}
                  Best regards,
                  {"\n"}
                  {openMessage.from.name}
                </p>
              </div>

              {openMessage.attachments > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    Attachments ({openMessage.attachments})
                  </h4>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {Array.from({ length: openMessage.attachments }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-md border p-2"
                        >
                          <div className="h-10 w-10 rounded bg-muted"></div>
                          <div className="text-xs">
                            <div className="font-medium">
                              Document-{i + 1}.pdf
                            </div>
                            <div className="text-muted-foreground">120 KB</div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Reply className="mr-2 h-4 w-4" />
                  Reply
                </Button>
                <Button variant="outline" size="sm">
                  <ReplyAll className="mr-2 h-4 w-4" />
                  Reply All
                </Button>
                <Button variant="outline" size="sm">
                  <Forward className="mr-2 h-4 w-4" />
                  Forward
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
