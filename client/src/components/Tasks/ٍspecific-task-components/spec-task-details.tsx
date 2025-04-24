import {  parseISO } from "date-fns"
import _ from "lodash"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Clock, CalendarIcon, StarIcon, X } from 'lucide-react'
import DurationInput from "@/components/ui/divided-duration-input"
import { TasksSearch } from "../../ui/TasksSearch"
import { useTranslation } from "react-i18next"
import useTasks from "../../../hooks/useTasks"

export default function SpecificTaskDetails(
    {
        isEditing,
        editError,
        editedTask,
        handleTaskUpdate,
        duration,
        setDuration,
        marge,
        setMarge,
        formatDate,
        task,
        
        handleDeleteParent,
        canEdit,
        tasksToHide,
        handleGetAllTasks,
        handleAddParent,
        handlechangeStatut,
        canEditStatut,
        saveChanges,
        cancelEditing
    } :any
) {
    const {
        getDifficulteBadge,
        getStatusBadge, 
        formatDurationReact,
       } = useTasks()
    const {t} = useTranslation();
    return (
        <Card className="basis-full lg:basis-[70%] grow lg:grow-0">
          <CardContent className="p-6">
            {isEditing ? (
              <div className="space-y-4">

                {editError !== "" && (
                  <Alert
                    variant="destructive"
                    className="mb-4 border border-destructive-foreground"
                  >
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription> {editError} </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="task-name">{t("tasks.specific.form.task_name", "Task Name")}</Label>
                  <Input
                    id="task-name"
                    value={editedTask.nomTache}
                    onChange={(e:any) => handleTaskUpdate("nomTache", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-description">{t("tasks.specific.form.description", "Description")}</Label>
                  <Textarea
                    id="task-description"
                    value={editedTask.description || ""}
                    onChange={(e:any) => handleTaskUpdate("description", e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-status">{t("tasks.specific.form.status", "Status")}</Label>
                    <Select value={editedTask.statut} onValueChange={(value:any) => handleTaskUpdate("statut", value)}>
                      <SelectTrigger id="task-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO"> {t(`tasks.tasks-list.status.todo`)}</SelectItem>
                        <SelectItem value="PROGRESS"> {t(`tasks.tasks-list.status.progress`)}</SelectItem>
                        <SelectItem value="REVIEW"> {t(`tasks.tasks-list.status.review`)}</SelectItem>
                        <SelectItem value="DONE"> {t(`tasks.tasks-list.status.done`)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-difficulte">{t("tasks.specific.form.difficulty", "Difficulty")}</Label>
                    <Select
                      value={editedTask.difficulte?.toString().trim()}
                      onValueChange={(value:any) => handleTaskUpdate("difficulte", value)}
                    >
                      <SelectTrigger id="task-difficulte">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">{t(`tasks.tasks-list.difficulty.easy`)}</SelectItem>
                        <SelectItem value="normal">{t(`tasks.tasks-list.difficulty.normal`)}</SelectItem>
                        <SelectItem value="hard">{t(`tasks.tasks-list.difficulty.hard`)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-budget">{t("tasks.specific.form.budget", "Budget Estimé")}</Label>
                    <Input
                      type="number"
                      id="task-budget"
                      value={editedTask.budgetEstime || ""}
                      onChange={(e:any) => handleTaskUpdate("budgetEstime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-qualite">{t("tasks.specific.form.quality", "Quality")} (0-5)</Label>
                    <Select
                      value={(editedTask.qualite || 0).toString()}
                      onValueChange={(value:any) => handleTaskUpdate("qualite", Number.parseInt(value))}
                    >
                      <SelectTrigger id="task-qualite">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 - {t("tasks.details.qualit.zero", "Not rated")}</SelectItem>
                        <SelectItem value="1">1 - {t("tasks.details.qualit.one", "Poor")}</SelectItem>
                        <SelectItem value="2">2 - {t("tasks.details.qualit.two", "Fair")}</SelectItem>
                        <SelectItem value="3">3 - {t("tasks.details.qualit.three", "Good")}</SelectItem>
                        <SelectItem value="4">4 - {t("tasks.details.qualit.four", "Very Good")}</SelectItem>
                        <SelectItem value="5">5 - {t("tasks.details.qualit.five", "Excellent")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-duree">{t("tasks.specific.form.duration", "Duration")}</Label>
                    <DurationInput value={duration} onChange={setDuration} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-marge">{t("tasks.specific.form.margin", "Marge")}</Label>
                    <DurationInput value={marge} onChange={setMarge} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-start-date">{t("tasks.specific.form.start_date", "Start Date")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="task-start-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedTask.dateDebut ? formatDate(editedTask.dateDebut) : <span>{t("tasks.details.form.pick_date", "Pick a date")}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editedTask.dateDebut ? parseISO(editedTask.dateDebut) : undefined}
                          onSelect={(date:any) => handleTaskUpdate("dateDebut", date ? date.toISOString() : undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">{t("tasks.specific.form.due_date", "Due Date")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="task-due-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedTask.dateFinEstime ? formatDate(editedTask.dateFinEstime) : <span>{t("tasks.details.form.pick_date", "Pick a date")}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editedTask.dateFinEstime ? parseISO(editedTask.dateFinEstime) : undefined}
                          onSelect={(date:any) => handleTaskUpdate("dateFinEstime", date ? date.toISOString() : undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={saveChanges}>
                    {t("tasks.specific.buttons.save_changes", "error")}
                  </Button>
                  <Button variant="outline" onClick={cancelEditing}>
                    {t("tasks.specific.buttons.cancel", "error")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{task.nomTache}</h2>
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="flex gap-2">

                      {(canEditStatut) && (
                        <>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              {getStatusBadge(task.statut)}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-24">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handlechangeStatut(task.id, "TODO")}
                              >
                                {getStatusBadge("TODO")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  handlechangeStatut(task.id, "PROGRESS")
                                }
                              >
                                {getStatusBadge("PROGRESS")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  handlechangeStatut(task.id, "REVIEW")
                                }
                              >
                                {getStatusBadge("REVIEW")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handlechangeStatut(task.id, "DONE")}
                              >
                                {getStatusBadge("DONE")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      ) || <>{getStatusBadge(task.statut)}</>}
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
                    <div className="rounded-md border p-4 mt-4 bg-slate-50">
                      <p className="whitespace-pre-wrap text-sm">{task.description}</p>
                    </div>
                  )}
                </div>
                <div className="pl-6 pr-6"></div>

                <div className=" lg:w-1/2 md:max-w-[300px] lg:max-w-[300px]">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Parent</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 overflow-hidden">
                      <TasksSearch
                        key={`parent-search-${task.id}`}
                        placeholder={
                          task.parent
                            ? task.parent.nomTache
                            : canEdit
                              ? t("tasks.taskSearch.setParent")
                              : t("tasks.taskSearch.noParent")
                        }
                        onTaskSelect={handleAddParent}
                        fetchTasks={handleGetAllTasks}
                        tasksToHide={tasksToHide}
                        thisTask={task}
                        disabled={!canEdit}
                      />
                    </div>

                    {task.parent && canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteParent}
                        className="h-9 px-2 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        <span>{t("tasks.specific.remove", "Remove")}</span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.project", "Project")}</h3>
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-sm">
                        {task.project.nom}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.reporter", "Reporter")}</h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={task.rapporteur.avatar || "/placeholder.svg"} alt={task.rapporteur.nom} />
                        <AvatarFallback>
                          {task.rapporteur.nom[0]}
                          {task.rapporteur.prenom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {_.startCase(task.rapporteur.prenom)} {_.startCase(task.rapporteur.nom)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.quality", "Quality")}</h3>
                    <div className="flex items-center">
                      {task.qualite !== 0 ? (
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${i < (task.qualite || 0) ? "text-blue-500 fill-blue-500" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm">{t("tasks.specific.not_rated", "Not Rated")}</span>
                      )}
                    </div>
                  </div>

                  {task.budgetEstime !== 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.budget", "Budget")}</h3>
                      <span className="text-sm">{task.budgetEstime}</span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.created", "Created")}</h3>
                    <span className="text-sm">{formatDate(task.dateCreation)}</span>
                  </div>

                  {task.dateFin && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.finished_date", "Finished Date")}</h3>
                      <span className="text-sm">{formatDate(task.dateFin)}</span>
                    </div>
                  )}

                  {task.dateDebut && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.started", "Started")}</h3>
                      <span className="text-sm">{formatDate(task.dateDebut)}</span>
                    </div>
                  )}

                  {task.dateFinEstime && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.due_date", "Due Date")}</h3>
                      <span className="text-sm">{formatDate(task.dateFinEstime)}</span>
                    </div>
                  )}

                  {task.duree !== 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.duration", "Duration")}</h3>
                      <span className="text-sm">{formatDurationReact(task.duree)}</span>
                    </div>
                  )}

                  {task.marge !== 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("tasks.specific.margin", "Marge")}</h3>
                      <span className="text-sm">{formatDurationReact(task.marge)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    );
}