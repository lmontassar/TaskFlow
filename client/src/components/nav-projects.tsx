import {
  ChevronRight,
  Folder,
  MoreHorizontal,
  Plus,
  Share,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { EditDialog } from "./EditDialog";
import { useContext, useState } from "react";
import Input42 from "./ui/date-range";
import Textarea03 from "./Textarea-helper";
import useCreateProject from "../hooks/useCreateProject";
import { useNavigate } from "react-router-dom";
import { Context } from "../App";
import TagsInput from "./TagsInput";
import InputNumber from "./InputNumber";
import { Tag } from "emblor";
import { toast } from "sonner";
import SuccessAlert from "./comp-272";
type Project = {
  name: string;
  description: string;
  budgetEstimate: string;
  startDate: string;
  endDateEstimate: string;
  tags: string[];
};
export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [budgetEstimate, setBudgetEstimate] = useState<number | undefined>(
    undefined
  );
  const [created, setCreated] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: null,
    to: null,
  });
  const { createProject, isLoading, error, project } = useCreateProject();
  const { user } = useContext(Context);
  const handleDateChange = (date: any) => {
    setSelectedDateRange(date); // Store the selected date range in the state
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const newProject = await createProject({
        nom: name,
        description,
        dateDebut: selectedDateRange.from || new Date(),
        dateFinEstime: selectedDateRange.to || new Date(),
        budgetEstime: budgetEstimate || 0,
        tags: tags,
        createur: user?.id,
      });
      setCreated(true);
      setTimeout(() => {
        navigate(0);
      }, 1000);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects && projects.length > 0 ? (
          projects.map((item) => (
            <Collapsible
              key={item.name}
              asChild
              defaultOpen={true}
              className="group/collapsible"
            >
              <SidebarMenuItem key={item.name}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.name}>
                    {item.icon && <item.icon />}
                    <span>{item.name}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem key={item.name}>
                      <SidebarMenuSubButton asChild>
                        <a href={item.name}>
                          <span>{item.name}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))
        ) : (
          <EditDialog
            trigger={
              <div className="w-full flex flex-row items-center justify-start gap-1 p-1 hover:cursor-pointer">
                <Plus />
                <span>Create new project</span>
              </div>
            }
            title="Create New Project"
            button={isLoading ? "Creating..." : "Create Project"}
            disabled={isLoading || created}
            onClick={handleSubmit} // Disable the button while loading
            description=""
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="input-01">Project Name</Label>
                <Input
                  id="input-01"
                  placeholder="Enter a name for your project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <InputNumber
                  label="Estimated Budget"
                  budget={budgetEstimate || 0}
                  setBudget={setBudgetEstimate}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="input-03">Tags</Label>
                <TagsInput tags={tags} setTags={setTags} />
              </div>
              <Textarea03
                label="Description"
                helperText="Please add as many details as you can"
                placeholder="Enter a description for your project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input42
                className={"w-full"}
                label={"Estimated Time"}
                type={"button"}
                onChange={handleDateChange}
              />
              {created && (
                <SuccessAlert>Project created successfully</SuccessAlert>
              )}
            </div>
          </EditDialog>
        )}
        {}
      </SidebarMenu>
    </SidebarGroup>
  );
}
