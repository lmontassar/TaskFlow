import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Trash2 } from "lucide-react";

import { UserSearch } from "@/components/ui/assigneeSearch";
import { AttachmentsTab } from "@/components/attachments/attachments-tab";

export default function SpecificTaskMainTabs({
  canEdit,
  task,
  setTask,
  setAssigneeToAdd,
  checkIfCreatorOfProject,
  setAssigneeToDelete,
  checkIfAssigneeTask,
}: any) {
  const { t } = useTranslation();
  return (
    <Card className="basis-full lg:basis-[calc(30%-1rem)] grow lg:grow-0">
      <Tabs defaultValue="assignees" className="ml-2 mr-2">
        <TabsList className="w-full">
          <TabsTrigger value="assignees" className="flex-1">
            {t("tasks.specific.tabs.assignees", "Assignees")}
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex-1">
            {t("tasks.specific.tabs.comments", "Comments")}
          </TabsTrigger>
          {(checkIfCreatorOfProject(task?.project) ||
            checkIfAssigneeTask(task)) && (
            <TabsTrigger value="attachments" className="flex-1">
              {t("tasks.specific.tabs.attachments", "Attachments")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="assignees" className="mt-2">
          {canEdit && (
            <div className="mb-2">
              <UserSearch
                key={task.id}
                onUserSelect={setAssigneeToAdd}
                alreadyincluded={task.assignee}
                selectedUsers={task.project.listeCollaborateur}
                task={task}
              />
            </div>
          )}
          <div>
            {task.assignee.length > 0 ? (
              task.assignee.map((assignee: any) => (
                <div
                  key={assignee.id}
                  className="flex items-center justify-between p-2 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={assignee.avatar || "/placeholder.svg"}
                        alt={assignee.nom}
                      />
                      <AvatarFallback>
                        {assignee.initials ||
                          `${assignee.nom[0]}${assignee.prenom[0]}`}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {_.startCase(assignee.prenom)} {_.startCase(assignee.nom)}
                    </span>
                  </div>

                  {checkIfCreatorOfProject(task.project) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAssigneeToDelete(assignee)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                {t("tasks.specific.no_assignees", "No assignees for this task")}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-6 text-muted-foreground">
                Comments feature coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {(checkIfCreatorOfProject(task?.project) ||
          checkIfAssigneeTask(task)) && (
          <TabsContent value="attachments" className="pt-2">
            <AttachmentsTab task={task} />
          </TabsContent>
        )}
      </Tabs>
    </Card>
  );
}
