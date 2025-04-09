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
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SearchFormProps {
  children: React.ReactNode;
  project?: any;
  setProject?: any;
}

export default function SearchForm({
  children,
  project,
  setProject,
}: SearchFormProps) {
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
        role: "",
      }),
    });
    if (!result.ok) {
      throw new Error("Failed to add collaborator");
    }
    const data = await result.json();
    setProject(data);
  };
  const fetchResults = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/search?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      console.log("Fetched Data:", data); // Debug API response

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
          {loading && (
            <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
              <div className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-3 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                Loading...
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium">
              {results.map((result) => {
                const isInProject =
                  project.listeCollaborateur.some(
                    (collaborator: any) => collaborator.user.id === result.id
                  ) || project.createur.id === result.id;
                let role = "";
                if (isInProject) {
                  role = project.listeCollaborateur.find(
                    (collaborator: any) => collaborator.user.id === result.id
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
                        src={
                          result?.avatar
                        }
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
        </CommandList>
      </CommandDialog>
    </>
  );
}
