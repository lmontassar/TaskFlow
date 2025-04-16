"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, ClipboardList } from "lucide-react"
import { useTranslation } from "react-i18next"


// Change the interface to rename 'tasks' to 'tasksToHide'
interface TasksSearchProps {
  onTaskSelect: (taskId: string) => void
  tasksToHide: any[]
  fetchTasks: () => Promise<any[]>
  placeholder?: string
  thisTask?:any
  disabled?:boolean
}

// Update the component parameters
export function TasksSearch({
  onTaskSelect,
  tasksToHide = [],
  fetchTasks,
  placeholder = "Search tasks...",
  thisTask,
  disabled = false
}: TasksSearchProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Effect to handle search
  useEffect(() => {
    // Debounce search to avoid too many API calls
      handleFetchTasks()
  }, [tasksToHide])

  const handleFetchTasks = async () =>{
    setIsSearching(true)
    try {
      const fetchedTasks = await fetchTasks()
      if(fetchedTasks == null || fetchedTasks == undefined) return
      const filteredResults = fetchedTasks.filter(
        (fetchedTask) => (thisTask == null ? true : thisTask.id != fetchedTask.id) &&  !tasksToHide.some((existingTask) => existingTask.id === fetchedTask.id) ,
      )
      setSearchResults(filteredResults)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }
  useEffect(()=>{
    handleFetchTasks()
  },[])
 

  const handleSelect = (task: any) => {
    if ( tasksToHide.some( t => t.id == task.id ) ) return;
    onTaskSelect(task)
    setOpen(false)
  }

  // Helper function to get status badge color
  const getStatusColor = (status: any["statut"]) => {
    switch (status) {
      case "TODO":
        return "bg-slate-500"
      case "PROGRESS":
        return "bg-blue-500"
      case "REVIEW":
        return "bg-amber-500"
      case "DONE":
        return "bg-green-500"
      default:
        return "bg-slate-500"
    }
  }

  // Helper function to get difficulty badge color
  const getDifficultyColor = (difficulty: any["difficulte"]) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const displayedTasks = searchResults

  return (
    <div className={`space-y-4 ${disabled ? 'pointer-events-none' : ''}`}>
      <Popover open={open} onOpenChange={ (e:any)=> { if(!disabled) setOpen(e) }}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" 
                  aria-expanded={open} className="w-full justify-between" 
              >
             {/* {placeholder.length < 50 ? placeholder : placeholder.substring(0,50)+"..." } */}
            
            <span className="flex items-center gap-2  truncate max-w-[calc(100%-1.5rem)]">
              <ClipboardList className=" h-4 w-4  text-muted-foreground" />
              {placeholder}
            </span>
            {disabled!=true && (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
            
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0">
          <Command>
            <CommandInput placeholder={t("tasks.taskSearch.inputPlaceholder")} value={search} onValueChange={setSearch} disabled={disabled} />
            <CommandList>
              {isSearching ? (
                <div className="py-6 text-center text-sm text-muted-foreground">{t("tasks.staskSearch.loading")}</div>
              ) : (
                <>
                  <CommandEmpty>{t("tasks.taskSearch.empty")}</CommandEmpty>
                  <CommandGroup>
                    {displayedTasks.map((task) => (
                      <CommandItem
                        key={task.id}
                        onSelect={() => handleSelect(task)}
                        className="flex items-start gap-2 py-2"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{task.nomTache}</span>
                            <Badge
                              variant="outline"
                              className={`ml-2 ${getStatusColor(task.statut)} text-white text-xs`}
                            >
                              {t(`tasks.taskStatus.${task.statut}`)}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-1">{task.description}</span>
                          <div className="flex items-center mt-1 gap-2">
                            <Badge variant="outline" className={`${getDifficultyColor(task.difficulte)} text-xs`}>
                            {t(`tasks.taskDifficulty.${task.difficulte}`)}
                            </Badge>
                            {task.assignee && task.assignee.length > 0 && (
                              <div className="flex -space-x-2">
                                {task.assignee.slice(0, 3).map((user, index) => (
                                  <Avatar key={index} className="h-5 w-5 border-2 border-background">
                                    <AvatarImage src={user.avatar} alt={user.nom} />
                                    <AvatarFallback>{user.nom?.charAt(0) || "U"}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {task.assignee.length > 3 && (
                                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-xs">
                                    +{task.assignee.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
