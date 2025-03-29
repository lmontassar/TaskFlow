"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, CheckCircle2, Clock, MoreHorizontal, Trash2, X, Edit, StarIcon } from "lucide-react"
import { format, parseISO } from "date-fns"
import type { Task } from "./tasks-interface"
import _ from "lodash"
import { Input } from "../ui/input"

import DurationInput from "../ui/divided-duration-input"

function formatDurationReact(duration: number): string {
  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ]

  let remaining = duration
  const parts: string[] = []

  for (const unit of units) {
    const count = Math.floor(remaining / unit.seconds)
    if (count > 0) {
      parts.push(`${count} ${unit.label}${count > 1 ? "s" : ""}`)
      remaining %= unit.seconds
    }
  }

  return parts.slice(0, 2).join(" and ") || "0 minutes"
}

interface TaskDetailsProps {
  task: any
  onClose: () => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  allTasks: Task[]
}

export function TaskDetails({ task, onClose, onUpdate, onDelete, allTasks }: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<Task>({ ...task })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [commentText, setCommentText] = useState("")
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const [marge, setMarge] = useState(editedTask.marge)
  const [duration, setDuration] = useState(editedTask.duree)

  const handleTaskUpdate = (field: string, value: any) => {
    setEditedTask({
      ...editedTask,
      [field]: value,
    })
  }

  const saveChanges = () => {
    console.log(editedTask)
    onUpdate( {
      ...editedTask, ["duree"]:duration,["marge"]:Number(marge)
    } )

    setIsEditing(false)
  }

  const cancelEditing = () => {
    setEditedTask({ ...task })
    setIsEditing(false)
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return

    const newComment = {
      id: `comment-${Date.now()}`,
      user: {
        id: "current-user",
        name: "You",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "YO",
      },
      content: commentText,
      createdAt: new Date().toISOString(),
    }

    const updatedTask = {
      ...task,
      comments: [...task.comments, newComment],
    }

    onUpdate(updatedTask)
    setCommentText("")
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null

    try {
      const date = parseISO(dateString)
      return format(date, "MMM d, yyyy")
    } catch (error) {
      return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return (
          <Badge variant="outline" className="bg-slate-50">
            To Do
          </Badge>
        )
      case "PROGRESS":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            In Progress
          </Badge>
        )
      case "REVIEW":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Review
          </Badge>
        )
      case "DONE":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            DONE
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDifficulteBadge = (difficulte: string) => {
    switch (difficulte.toLowerCase()) {
      case "hard":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Hard
          </Badge>
        )
      case "normal":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Normal
          </Badge>
        )
      case "easy":
        return (
          <Badge variant="outline" className="bg-slate-50">
            Easy
          </Badge>
        )
      default:
        return <Badge variant="outline">{difficulte}</Badge>
    }
  }

  // Get all unique assignees from all tasks for the dropdown
  const allAssignees = new Map()
  allTasks.forEach((t) => {
    t.assignee.forEach((assignee) => {
      if (!allAssignees.has(assignee.id)) {
        allAssignees.set(assignee.id, assignee)
      }
    })
  })

  // Get all unique projects from all tasks for the dropdown
  const allProjects = new Map()
  allTasks.forEach((t) => {
    if (!allProjects.has(t.project.id)) {
      allProjects.set(t.project.id, t.project)
    }
  })

  return (
    <div className="border-l w-[400px] flex flex-col">
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this task?</DialogTitle>
            <DialogDescription>
              This action cannot be unDONE. This will permanently delete the task and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(task.id)
                setConfirmDelete(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <h3 className="font-medium">Task Details</h3>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task Name</Label>
                <Textarea
                  id="task-name"
                  value={editedTask.nomTache}
                  onChange={(e) => handleTaskUpdate("nomTache", e.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={editedTask.description || ""}
                  onChange={(e) => handleTaskUpdate("description", e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-status">Status</Label>
                  <Select value={editedTask.statut} onValueChange={(value:any) => handleTaskUpdate("statut", value)}>
                    <SelectTrigger id="task-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="PROGRESS">In Progress</SelectItem>
                      <SelectItem value="REVIEW">Review</SelectItem>
                      <SelectItem value="DONE">DONE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-difficulte">Difficulty : {editedTask.difficulte.toString().trim()}</Label>
                  <Select
                    value={editedTask.difficulte.toString().trim()}
                    onValueChange={(value:any) => { console.log(value); handleTaskUpdate("difficulte", value )} }
                  >
                    <SelectTrigger id="task-difficulte">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>



              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-budget">Budget Estimé : </Label>
                  <Input
                    type="number"
                    id="task-budget"
                    value={editedTask.budgetEstime || ""}
                    onChange={(e) => handleTaskUpdate("budgetEstime", e.target.value)}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-qualite">Quality (0-5)</Label>
                  <Select
                    value={(editedTask.qualite || 0).toString()}
                    onValueChange={(value) => handleTaskUpdate("qualite", Number.parseInt(value))}
                  >
                    <SelectTrigger id="task-qualite">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Not rated</SelectItem>
                      <SelectItem value="1">1 - Poor</SelectItem>
                      <SelectItem value="2">2 - Fair</SelectItem>
                      <SelectItem value="3">3 - Good</SelectItem>
                      <SelectItem value="4">4 - Very Good</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              
                <div className="space-y-2">
                  <Label htmlFor="task-duree">Duration</Label>
                  <DurationInput value={duration} onChange={setDuration} />

                  {/* <Textarea
                    id="task-duree"
                    value={editedTask.duree || ""}
                    onChange={(e) => handleTaskUpdate("duree", e.target.value)}
                    className="resize-none"
                  /> */}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-marge">Marge</Label>
                  <DurationInput value={marge} onChange={setMarge} />

                  {/* <Textarea
                    id="task-marge"
                    value={editedTask.marge || ""}
                    onChange={(e) => handleTaskUpdate("marge", e.target.value)}
                    className="resize-none"
                  /> */}
                </div>
              

              
                <div className="space-y-2">
                  <Label htmlFor="task-start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="task-start-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedTask.dateDebut ? formatDate(editedTask.dateDebut) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editedTask.dateDebut ? parseISO(editedTask.dateDebut) : undefined}
                        onSelect={(date) => handleTaskUpdate("dateDebut", date ? date.toISOString() : undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-due-date">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="task-due-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedTask.dateFinEstime ? formatDate(editedTask.dateFinEstime) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editedTask.dateFinEstime ? parseISO(editedTask.dateFinEstime) : undefined}
                        onSelect={(date) => handleTaskUpdate("dateFinEstime", date ? date.toISOString() : undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              

              <div className="flex w-full gap-1 space-y-4">
                <Button className="flex-1 w-full"  onClick={saveChanges}>Save Changes</Button>
                <Button variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{task.nomTache}</h2>
                </div>

                <div className="flex flex-wrap justify-between gap-2">
                  <div className="flex gap-2">
                    {getStatusBadge(task.statut)}
                    {getDifficulteBadge(task.difficulte)}
                  </div>
                  {task.dateFinEstime && (
                    <Badge variant="outline" className="flex gap-1 bg-red-100 border-1 border-red-200 text-red-700">
                      <Clock className="h-3 w-3" />
                      {formatDate(task.dateFinEstime)}
                    </Badge>
                  )}
                </div>

                {task.description && (
                  <div className="rounded-md border p-3">
                    <p className="whitespace-pre-wrap text-sm">{task.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 text-sm font-medium">Project</h4>
                  <Badge variant="outline">{task.project.nom}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium">Quality</h4>
                  <div className="flex items-center">

                    { task.qualite != 0 && (
                    <>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${i < (task.qualite || 0) ? "text-blue-500 fill-blue-500" : "text-muted-foreground"}`}
                            />
                          ))}
                          </>
                          
                      ) || (
                        <span className="text-sm">Not Rated</span>
                      ) }
                  </div>
                </div>
                {task.budgetEstime!=0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Budget</h4>
                    <span className="text-sm">{task.budgetEstime}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="mb-1 text-sm font-medium">Created</h4>
                  <span className="text-sm">{formatDate(task.dateCreation)}</span>
                </div>
                {task.dateFin && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Finished Date</h4>
                    <span className="text-sm">{formatDate(task.dateFin)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {task.dateDebut && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Started</h4>
                    <span className="text-sm">{formatDate(task.dateDebut)}</span>
                  </div>
                )}

                {task.dateFinEstime && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Due Date</h4>
                    <span className="text-sm">{formatDate(task.dateFinEstime)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {task.duree != 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Duration</h4>
                    <span className="text-sm">{formatDurationReact(task.duree)}</span>
                  </div>
                )}
                {task.marge != 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Marge</h4>
                    <span className="text-sm">{formatDurationReact(task.marge)}</span>
                  </div>
                )}
              </div>

              <Tabs className="mt-4" defaultValue="assignees">
                <TabsList className="w-full">
                  <TabsTrigger value="assignees" className="flex-1">
                    Assignees
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="flex-1">
                    Comments
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="flex-1">
                    Attachments
                  </TabsTrigger>
                </TabsList>

                {/* <TabsContent value="comments" className="space-y-4 pt-4">
                  {task.comments.length > 0 ? (
                    <div className="space-y-4">
                      {task.comments.map((comment:any) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                            <AvatarFallback>{comment.user.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{comment.user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm">{comment.content}</p>

                            {comment.attachments && comment.attachments.length > 0 && (
                              <div className="rounded-md border p-2">
                                <div className="flex items-center gap-2">
                                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{comment.attachments[0].name}</span>
                                </div>
                              </div>
                            )}
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
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="mt-2 flex justify-between">
                      <Button variant="outline" size="sm">
                        <Paperclip className="mr-2 h-4 w-4" />
                        Attach
                      </Button>
                      <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                </TabsContent> */}

                <TabsContent value="assignees" className="pt-2">
                  <div className="text-center text-sm text-muted-foreground">
                    <div className="grid gap-3 pl-3">
                      {task.assignee.length > 0 ? (
                        task.assignee.map((assignee) => (
                          <div key={assignee.id} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  assignee.avatar.startsWith("avatar")
                                    ? `/api/user/avatar/${assignee.avatar}`
                                    : assignee.avatar
                                }
                                alt={assignee.nom}
                              />
                              <AvatarFallback>{assignee.initials}</AvatarFallback>
                            </Avatar>

                            <span className="text-sm font-medium text-gray-800">
                              {_.startCase(assignee.nom)} {_.startCase(assignee.prenom)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No assignees</span>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* <TabsContent value="attachments" className="pt-4">
                  {task.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {task.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between rounded-md border p-2">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{attachment.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {attachment.size} ·{" "}
                                {formatDistanceToNow(parseISO(attachment.uploadedAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                      No attachments yet
                    </div>
                  )}
                </TabsContent> */}
              </Tabs>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

