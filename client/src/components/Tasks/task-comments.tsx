import { useContext, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format, parseISO } from "date-fns";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Send, MessageCircle, Pencil, Trash, X, Check } from "lucide-react";
import { Context } from "../../App";
import { Mention } from "primereact/mention";

function TaskComments({
  comments,
  task,
  handleAddComment,
  handleEditComment,
  handleDeleteComment,
}: any) {
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(Context);
  const [collabs, setCollabs] = useState([
    ...(task?.project?.listeCollaborateur || []),
    {
      user: {
        id: task?.rapporteur?.id,
        nom: task?.rapporteur?.nom,
        prenom: task?.rapporteur?.prenom,
        email: task?.rapporteur?.email,
        avatar: task?.rapporteur?.avatar,
      },
    },
  ]); // Assuming this is the list of collaborators
  const [suggestions, setSuggestions] = useState([]);

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
  const onSearch = (event: any) => {
    //in a real application, make a request to a remote url with the query and return suggestions, for demo we filter at client side
    setTimeout(() => {
      const query = event.query;
      let suggestions;

      if (!query.trim().length) {
        suggestions = collabs.filter((customer: any) => {
          return customer.user.id !== user?.id;
        });
      } else {
        suggestions = collabs.filter((customer: any) => {
          return (
            customer.user.email.toLowerCase().startsWith(query.toLowerCase()) &&
            customer.user.id !== user?.id
          );
        });
      }

      setSuggestions(suggestions);
    }, 250);
  };
  const itemTemplate = (suggestion: any) => {
    return (
      <div className="flex items-center bg-white dark:bg-zinc-900 p-2 rounded-md">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={suggestion.user.avatar || "/placeholder.svg"}
            alt={suggestion.user.nom}
          />
          <AvatarFallback>{suggestion.user.nom}</AvatarFallback>
        </Avatar>
        <span className="flex flex-col ml-2">
          {suggestion.user.nom + " " + suggestion.user.prenom}
          <small
            style={{ fontSize: ".75rem", color: "var(--text-color-secondary)" }}
          >
            @{suggestion.user.email}
          </small>
        </span>
      </div>
    );
  };
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>

      {comments.length > 0 ? (
        <div
          className="space-y-4 max-h-[300px] overflow-y-auto pr-1"
          id="comments"
        >
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
                    <Mention
                      value={editingContent}
                      onChange={(e) =>
                        setEditingContent((e.target as HTMLInputElement).value)
                      }
                      suggestions={suggestions}
                      onSearch={onSearch}
                      field="user.id"
                      placeholder="Write a thoughtful comment..."
                      rows={4}
                      cols={40}
                      itemTemplate={itemTemplate}
                      pt={{
                        input: {
                          className:
                            "p-3 border border-gray-300 dark:border-zinc-700 rounded-lg w-full min-h-[100px] resize-none text-sm bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
                        },
                      }}
                      autoResize
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
                  <p className="text-sm text-muted-foreground whitespace-pre-line break-words overflow-hidden">
                    {comment.content
                      .split(/(\s+)/)
                      .map((part: string, i: any) =>
                        part.startsWith("@") ? (
                          <strong
                            key={i}
                            className="font-semibold text-foreground"
                          >
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
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

      <div className="p-4 bg-white dark:bg-zinc-900 space-y-3">
        <div className="flex flex-col items-start gap-2 mb-2">
          <Mention
            value={commentText}
            onChange={(e) =>
              setCommentText((e.target as HTMLInputElement).value)
            }
            suggestions={suggestions}
            onSearch={onSearch}
            field="user.id"
            placeholder="Write a thoughtful comment..."
            rows={4}
            cols={40}
            itemTemplate={itemTemplate}
            pt={{
              input: {
                className:
                  "p-3 border border-gray-300 dark:border-zinc-700 rounded-lg w-full min-h-[100px] resize-none text-sm bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
              },
            }}
            autoResize
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setIsLoading(true);
                handleAddComment(commentText, setCommentText);
                setIsLoading(false);
              }}
              disabled={!commentText.trim() || isLoading}
              className="flex items-center gap-1 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskComments;
