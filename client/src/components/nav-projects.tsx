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
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../App";
import TagsInput from "./TagsInput";
import InputNumber from "./InputNumber";
import { Tag } from "emblor";
import { toast } from "sonner";
import SuccessAlert from "./comp-272";
import { useTranslation } from "react-i18next";
type Project = {
  id: string;
  nom: string;
  description: string;
  budgetEstime: string;
  dateDebut: string;
  dateFinEstime: string;
  listeCollaborateur: string[];
  createur: any;
  tags: string[];
  dateCreation: string;
};
export function NavProjects({
  userProject,
  projectLoading,
}: {
  userProject: Project | null;
  projectLoading: boolean;
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
  const { t } = useTranslation();

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
      }, 1500);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {userProject ? (
          <Collapsible
            key={userProject.id}
            asChild
            defaultOpen={true}
            className="group/collapsible"
          >
            <SidebarMenuItem key={userProject.nom}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={userProject.nom}>
                  <Folder />
                  <Link to={`/projects/${userProject.id}`}>
                    <span>{userProject.nom}</span>
                  </Link>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem key={userProject.nom}>
                    <SidebarMenuSubButton asChild>
                      <a href={userProject.nom}>
                        <span>{userProject.nom}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ) : (
          <EditDialog
            trigger={
              <div className="w-full flex flex-row items-center justify-start gap-1 p-1 hover:cursor-pointer">
                <Plus />
                <span>{t("project.creation_form.title")}</span>
              </div>
            }
            title={t("project.creation_form.title")}
            button={
              isLoading
                ? t("project.creation_form.submit_loading")
                : t("project.creation_form.submit")
            }
            disabled={isLoading || created}
            onClick={handleSubmit} // Disable the button while loading
            description=""
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="input-01">
                  {t("project.creation_form.name")}
                </Label>
                <Input
                  id="input-01"
                  placeholder={t("project.creation_form.name_placeholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <InputNumber
                  label={t("project.creation_form.estimated_budget")}
                  budget={budgetEstimate || 0}
                  setBudget={setBudgetEstimate}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="input-03">
                  {t("project.creation_form.tags")}
                </Label>
                <TagsInput
                  tags={tags}
                  setTags={setTags}
                  placeholder={t("project.creation_form.tags_placeholder")}
                />
              </div>
              <Textarea03
                label={t("project.creation_form.description")}
                helperText={t("project.creation_form.description_helper_text")}
                placeholder={t("project.creation_form.description_placeholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input42
                className={"w-full"}
                label={t("project.creation_form.estimated_time")}
                type={"button"}
                onChange={handleDateChange}
              />
              {created && (
                <SuccessAlert>
                  {t("project.creation_form.success")}
                </SuccessAlert>
              )}
            </div>
          </EditDialog>
        )}
        {}
      </SidebarMenu>
    </SidebarGroup>
  );
}
