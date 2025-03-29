"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Plus, ThumbsUp } from "lucide-react";

interface ProjectDiscussionsProps {
  projectId: string;
}

export function ProjectDiscussions({ projectId }: ProjectDiscussionsProps) {
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      title: "Homepage Design Feedback",
      author: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AJ",
      },
      date: "2025-03-10T09:30:00Z",
      content:
        "I've reviewed the homepage mockups and have a few suggestions. The hero section could use more contrast between the text and background image. Also, I think we should consider adding a clear CTA button above the fold.",
      replies: [
        {
          id: 101,
          author: {
            name: "Sarah Miller",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "SM",
          },
          date: "2025-03-10T10:15:00Z",
          content:
            "Good points, Alex. I'll adjust the contrast and add a more prominent CTA. Would you prefer a solid button or a ghost style?",
          likes: 2,
        },
        {
          id: 102,
          author: {
            name: "David Chen",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "DC",
          },
          date: "2025-03-10T11:05:00Z",
          content:
            "From a development perspective, either button style works. But I agree that we need something more prominent in that section.",
          likes: 1,
        },
      ],
      tags: ["design", "feedback"],
    },
    {
      id: 2,
      title: "Mobile Responsiveness Strategy",
      author: {
        name: "David Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "DC",
      },
      date: "2025-03-12T14:20:00Z",
      content:
        "We need to decide on our approach for the responsive design. Are we going with a mobile-first approach or designing for desktop and then adapting? This will impact how we structure the CSS and component hierarchy.",
      replies: [
        {
          id: 201,
          author: {
            name: "Sarah Miller",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "SM",
          },
          date: "2025-03-12T15:30:00Z",
          content:
            "I recommend mobile-first. It's easier to scale up than to retrofit for smaller screens later.",
          likes: 3,
        },
      ],
      tags: ["development", "mobile"],
    },
  ]);

  const [newReply, setNewReply] = useState("");
  const [activeDiscussion, setActiveDiscussion] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const handleReply = (discussionId: number) => {
    if (!newReply.trim()) return;

    setDiscussions(
      discussions.map((discussion) => {
        if (discussion.id === discussionId) {
          return {
            ...discussion,
            replies: [
              ...discussion.replies,
              {
                id: Date.now(),
                author: {
                  name: "You",
                  avatar: "/placeholder.svg?height=32&width=32",
                  initials: "YO",
                },
                date: new Date().toISOString(),
                content: newReply,
                likes: 0,
              },
            ],
          };
        }
        return discussion;
      })
    );

    setNewReply("");
    setActiveDiscussion(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Discussions</CardTitle>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Discussion
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="rounded-lg border">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={discussion.author.avatar}
                        alt={discussion.author.name}
                      />
                      <AvatarFallback>
                        {discussion.author.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{discussion.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Started by {discussion.author.name}{" "}
                        {formatDate(discussion.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {discussion.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm">{discussion.content}</p>
              </div>

              <div className="p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Replies ({discussion.replies.length})
                </h4>

                <div className="space-y-4">
                  {discussion.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={reply.author.avatar}
                          alt={reply.author.name}
                        />
                        <AvatarFallback>{reply.author.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {reply.author.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(reply.date)}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                          >
                            <ThumbsUp className="mr-1 h-3 w-3" />
                            {reply.likes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {activeDiscussion === discussion.id ? (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Write your reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveDiscussion(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReply(discussion.id)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setActiveDiscussion(discussion.id)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
