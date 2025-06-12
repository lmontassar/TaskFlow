import * as React from "react";
import { Plus, SearchIcon } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "./button";
import { Badge } from "./badge";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface SearchFormProps {
  children: React.ReactNode;
  project?: any;
  setProject?: any;
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "./loading";
export default function SearchForm({
  children,
  project,
  setProject,
}: SearchFormProps) {
  if (!project) {
    return <Loading />; // or handle the case when project is not provided
  }
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const addCollaborator = async (collaborate: any, project: any) => {
    const token = localStorage.getItem("authToken");
    const result = await fetch(`/api/project/addCollaborator`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: collaborate.email,
        projectId: project.id,
        role: "",
      }),
    });
    if (!result.ok) {
      throw new Error(result.statusText);
    }
    const data = await result.json();
    setProject(data);
  };

  const fetchResults = React.useCallback(async (query: string) => {
    const projectId = (await project?.id) || null;
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/search?query=${encodeURIComponent(
          query
        )}&projectId=${projectId}`
      );
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();

      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      fetchResults(searchTerm);
    }, 100);

    return () => clearTimeout(handler);
  }, [searchTerm, fetchResults]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {children}
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a member email or search..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          {loading && <Loading />}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full sticky top-0 z-10 border-b">
              <TabsTrigger
                value="all"
                className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="available"
                className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
              >
                Available
              </TabsTrigger>
              <TabsTrigger
                value="unavailable"
                className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
              >
                Unavailable
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {results.length > 0 && (
                <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                  {results.map((result) => {
                    const isInProject =
                      project.listeCollaborateur.some(
                        (collaborator: any) =>
                          collaborator.user.id === result.id
                      ) || project.createur.id === result.id;
                    let role = "";
                    if (isInProject) {
                      role = project.listeCollaborateur.find(
                        (collaborator: any) =>
                          collaborator.user.id === result.id
                      )?.role;
                      if (project.createur.id === result.id) {
                        role = "Owner";
                      }
                    }

                    return (
                      <div
                        className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground hover:cursor-pointer"
                        key={result.id}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={result?.avatar} alt={result.nom} />
                          <AvatarFallback>{result.initials}</AvatarFallback>
                        </Avatar>

                        <span>{result.nom || "Unknown"}</span>
                        <span className="ml-2 text-muted-foreground">
                          {result.email || "No Email"}
                        </span>
                        {result?.isAvailable === false && (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            Unavailable
                          </Badge>
                        )}

                        {!isInProject ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                            onClick={() => {
                              addCollaborator(result, project);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Add to the project
                          </Button>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {role || "Member"}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {!loading && results.length === 0 && searchTerm && (
                <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                  <div className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                    No results found.
                  </div>
                </div>
              )}
              {!loading && results.length === 0 && !searchTerm && (
                <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                  <div className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                    Start typing to search for members...
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="available">
              {results.length > 0 && (
                <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                  {results
                    .filter((result) => result.isAvailable === true)
                    .map((result) => {
                      const isInProject =
                        project.listeCollaborateur.some(
                          (collaborator: any) =>
                            collaborator.user.id === result.id
                        ) || project.createur.id === result.id;
                      let role = "";
                      if (isInProject) {
                        role = project.listeCollaborateur.find(
                          (collaborator: any) =>
                            collaborator.user.id === result.id
                        )?.role;
                        if (project.createur.id === result.id) {
                          role = "Owner";
                        }
                      }

                      return (
                        <div
                          className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground hover:cursor-pointer"
                          key={result.id}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={result?.avatar}
                              alt={result.nom}
                            />
                            <AvatarFallback>{result.initials}</AvatarFallback>
                          </Avatar>

                          <span>{result.nom || "Unknown"}</span>
                          <span className="ml-2 text-muted-foreground">
                            {result.email || "No Email"}
                          </span>
                          {!isInProject ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                              onClick={() => {
                                addCollaborator(result, project);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              Add to the project
                            </Button>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {role || "Member"}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
              {!loading && results.length === 0 && searchTerm && (
                <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                  <div className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                    No results found.
                  </div>
                </div>
              )}
              {!loading && results.length === 0 && !searchTerm && (
                <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                  <div className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                    Start typing to search for members...
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="unavailable">
              {results.length > 0 && (
                <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                  {results
                    .filter((result) => result.isAvailable === false)
                    .map((result) => {
                      const isInProject =
                        project.listeCollaborateur.some(
                          (collaborator: any) =>
                            collaborator.user.id === result.id
                        ) || project.createur.id === result.id;
                      let role = "";
                      if (isInProject) {
                        role = project.listeCollaborateur.find(
                          (collaborator: any) =>
                            collaborator.user.id === result.id
                        )?.role;
                        if (project.createur.id === result.id) {
                          role = "Owner";
                        }
                      }

                      return (
                        <div
                          className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground hover:cursor-pointer"
                          key={result.id}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={result?.avatar}
                              alt={result.nom}
                            />
                            <AvatarFallback>{result.initials}</AvatarFallback>
                          </Avatar>

                          <span>{result.nom || "Unknown"}</span>
                          <span className="ml-2 text-muted-foreground">
                            {result.email || "No Email"}
                          </span>
                          {!isInProject ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                              onClick={() => {
                                addCollaborator(result, project);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              Add to the project
                            </Button>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {role || "Member"}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
              {!loading && results.length === 0 && searchTerm && (
                <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                  <div className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                    No results found.
                  </div>
                </div>
              )}
              {!loading && results.length === 0 && !searchTerm && (
                <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
                  <div className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                    Start typing to search for members...
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CommandList>
      </CommandDialog>
    </>
  );
}
