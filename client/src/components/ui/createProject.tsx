import React, { useContext, useEffect, useRef, useState } from "react";
import { EditDialog } from "./EditDialog";
import { Plus, Redo2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Label } from "recharts";
import { Input } from "./input";
import InputNumber from "./InputNumber";
import TagsInput from "./TagsInput";
import Textarea03 from "./Textarea-helper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Button } from "./button";
import Input42 from "./date-range";
import SuccessAlert from "./comp-272";
import useProject from "../../hooks/useProject";
import useCreateProject from "../../hooks/useCreateProject";
import { Context } from "../../App";
import { useSidebar } from "./sidebar";
import { Tag } from "emblor";
import { useNavigate } from "react-router-dom";

function CreateProjectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [created, setCreated] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const { isMobile } = useSidebar();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [oldDescription, setOldDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [budgetEstimate, setBudgetEstimate] = useState<number | undefined>(
    undefined
  );
  const { user } = useContext(Context);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const { createProject, isLoading, error, project } = useCreateProject();
  const { generateDescription } = useProject();
  const typeOutDescription = (
    text: string,
    setDescription: (desc: string) => void,
    callback?: () => void
  ) => {
    setDescription("");
    timeoutsRef.current.forEach(clearTimeout); // clear any existing timeouts
    timeoutsRef.current = [];

    for (let i = 0; i < text.length; i++) {
      const timeout = setTimeout(() => {
        setDescription(text.slice(0, i + 1));
        if (i === text.length - 1 && callback) callback();
      }, i * 20);
      timeoutsRef.current.push(timeout);
    }
  };
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: null,
    to: null,
  });
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
        navigate(`/projects/${newProject.id}`);
      }, 1500);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };
  return (
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
      disabled={isLoading || created || loadingDescription}
      onClick={handleSubmit}
      description=""
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="input-01">{t("project.creation_form.name")}</Label>
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
          <Label htmlFor="input-03">{t("project.creation_form.tags")}</Label>
          <TagsInput
            tags={tags}
            setTags={setTags}
            placeholder={t("project.creation_form.tags_placeholder")}
          />
        </div>
        <div className="relative">
          <Textarea03
            label={t("project.creation_form.description")}
            helperText={t("project.creation_form.description_helper_text")}
            placeholder={t("project.creation_form.description_placeholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="absolute bottom-0 right-0">
            <div className="flex gap-2">
              {oldDescription !== "" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => {
                          setLoadingDescription(true);
                          typeOutDescription(
                            oldDescription,
                            setDescription,
                            () => {
                              setOldDescription("");
                              setLoadingDescription(false);
                            }
                          );
                        }}
                        variant="ghost"
                        type="button"
                        className="cursor-pointer p-2 w-4 h-4 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                        disabled={loadingDescription}
                      >
                        <Redo2 className="text-red-500 rotate-180" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Return the old description</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={async () => {
                        setLoadingDescription(true);
                        const newDescription = await generateDescription(
                          description,
                          name
                        );
                        setOldDescription(description);
                        if (newDescription) {
                          typeOutDescription(
                            newDescription,
                            setDescription,
                            () => setLoadingDescription(false)
                          );
                        } else {
                          setLoadingDescription(false);
                        }
                      }}
                      variant="ghost"
                      type="button"
                      disabled={name === "" || loadingDescription}
                      className="cursor-pointer p-2 w-4 h-4 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                    >
                      {loadingDescription ? (
                        <div className="animate-spin">
                          <svg
                            className="w-4 h-4 text-blue-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12z"
                            />
                          </svg>
                        </div>
                      ) : (
                        <Sparkles className="text-muted-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate description with AI</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <Input42
          className="w-full"
          label={t("project.creation_form.estimated_time")}
          type="button"
          onChange={handleDateChange}
        />
        {created && (
          <SuccessAlert>{t("project.creation_form.success")}</SuccessAlert>
        )}
      </div>
    </EditDialog>
  );
}

export default CreateProjectPage;
