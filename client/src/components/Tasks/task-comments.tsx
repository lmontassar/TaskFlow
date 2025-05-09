import { useContext, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format, parseISO } from "date-fns";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Send, MessageCircle, Pencil, Trash, X, Check } from "lucide-react";
import { Context } from "../../App";

function TaskComments({
  comments,
  handleAddComment,
  handleEditComment,
  handleDeleteComment,
}: any) {
  const [commentText, setCommentText] = useState("");
  const { user } = useContext(Context);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = parseISO(dateString);
      return format(date, "MMM d, yyyy");
    } catch {
      return null;
    }
  };

  const startEditing = (comment: any) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const saveEditing = () => {
    if (editingId && editingContent.trim()) {
      handleEditComment(editingId, editingContent);
      cancelEditing();
    }
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>

      {comments.length > 0 ? (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {comments.map((comment: any) => (
            <div
              key={comment.id}
              className="flex gap-3 p-3 rounded-md bg-muted/40 hover:bg-muted transition group"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={comment.user.avatar || "/placeholder.svg"}
                  alt={comment.user.nom}
                />
                <AvatarFallback>{comment.user.initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{comment.user.nom}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {comment.user.id === user?.id && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => startEditing(comment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>

                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={saveEditing}
                        disabled={!editingContent.trim()}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEditing}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground text-sm border border-dashed rounded-md py-8">
          <MessageCircle className="mb-2 h-6 w-6" />
          No comments yet. Be the first to share your thoughts.
        </div>
      )}

      <Separator />

      <div className="space-y-2">
        <Textarea
          ref={commentInputRef}
          placeholder="Write a thoughtful comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => handleAddComment(commentText, setCommentText)}
            disabled={!commentText.trim()}
            className="gap-1"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TaskComments;
