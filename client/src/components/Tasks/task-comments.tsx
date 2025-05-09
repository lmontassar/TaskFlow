import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format, parseISO } from "date-fns";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Send } from "lucide-react";

function TaskComments({ comments, handleAddComment }: any) {
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;

    try {
      const date = parseISO(dateString);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return null;
    }
  };
  return (
    <div>
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={comment.user.avatar || "/placeholder.svg"}
                  alt={comment.user.name}
                />
                <AvatarFallback>{comment.user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          No comments yet
        </div>
      )}

      <Separator />

      <div>
        <Textarea
          ref={commentInputRef}
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e: any) => setCommentText(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <div className="mt-2 flex justify-between">
          <Button
            size="sm"
            onClick={() => {
              handleAddComment(commentText, setCommentText);
            }}
            disabled={!commentText.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TaskComments;
