import {
  Check,
  ChevronRight,
  Folder,
  MoreHorizontal,
  Plus,
  Redo2,
  Share,
  Sparkles,
  Trash2,
  X,
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
} from "./collapsible";
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./sidebar";
import CreateProjectPage from "./createProject";
import { Link, useNavigate } from "react-router-dom";

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
  userProjects,
  projectLoading,
}: {
  userProjects: Project[] | null;
  projectLoading: boolean;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {userProjects && userProjects.length > 0 ? (
          userProjects.map((userProject: Project) => (
            <Collapsible
              key={userProject.id}
              asChild
              defaultOpen={true}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={userProject.nom}>
                    <Folder />
                    <Link to={`/projects/${userProject.id}`}>
                      <span>{userProject.nom}</span>
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
            </Collapsible>
          ))
        ) : (
          <CreateProjectPage />
        )}
        {}
      </SidebarMenu>
    </SidebarGroup>
  );
}
