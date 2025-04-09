import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import useTasks from "../../hooks/useTasks"

// Mock data - replace with your actual data fetching logic




interface UserSearchProps {
  onUserSelect: (users: any[]) => void
  selectedUsers?: any[]
  placeholder?: string
  alreadyincluded :any
  task: any
}

export function UserSearch({ onUserSelect, alreadyincluded = [] , task  ,selectedUsers = [], placeholder = "Search users..." }: UserSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<any[]>(selectedUsers)
  const [included , setIncluded] = useState<any>(alreadyincluded);
  const [users , setUsers ] = useState<any>( selectedUsers.map(u => u.user) );
  const {handleAddAssignee} = useTasks();
  useEffect(() => {
    setIncluded(alreadyincluded);
  }, [alreadyincluded]);
  const filteredUsers = users.filter(
    (user) =>
      !included.some((s) => s.id === user.id) &&
      ( (user.nom + user.prenom ).toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())),
  )

  const handleSelect = async (user: any) => {
    const res = await handleAddAssignee(task.id,user.id)
    if( res == true  ) {
        task.assignee = [...task.assignee ,user];
    }

    const newSelected = [...selected, user]
    
    //setSelected(newSelected)
    onUserSelect(newSelected)
    setOpen(false)
    setIncluded([...included ,user])
    
  }

  const handleRemove = (userId: string) => {
    const newSelected = selected.filter((user) => user.id !== userId)
    task.assignee = task.assignee.filter( (user:any) => user.id !== userId );
    setSelected(newSelected)
    onUserSelect(newSelected)
  }

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search users..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {filteredUsers.map((user) => (
                  <CommandItem key={user.id} onSelect={() => handleSelect(user)} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} alt={user.prenom+user.nom} />
                      <AvatarFallback>{user.nom.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{user.prenom} {user.nom}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <Check
                      className={`ml-auto h-4 w-4 ${
                        selected.some((s) => s.id === user.id) ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((user) => (
            <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {user.name}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleRemove(user.id)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )} */}
    </div>
  )
}

