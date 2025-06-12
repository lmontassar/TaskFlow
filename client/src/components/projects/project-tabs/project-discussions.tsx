import ChatPage from "../../../pages/Main/Chat";
import Loading from "../../ui/loading";

interface ProjectDiscussionsProps {
  project: any;
}

export function ProjectDiscussions({ project }: ProjectDiscussionsProps) {
  if (project == null) {
    return <Loading></Loading>;
  }
  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-x-hidden overflow-y-hidden rounded-lg border bg-background shadow-sm">
      <div className="flex flex-1 flex-col">
        <ChatPage project={project}></ChatPage>
      </div>
    </div>
  );
}
