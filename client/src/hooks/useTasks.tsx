import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';

const useTasks = () => {
  let [tasks, setTasks] = useState([]);
  let [isLoading, setIsLoading] = useState(false);
  const [addTaskError, setAddTaskError] = useState<string | null>("");
  const { t } = useTranslation();

  const formatDurationReact = (duration: number): string => {
    const units = [
      { label: t("date.year", "year"), seconds: 31536000 },
      { label: t("date.month", "month"), seconds: 2592000 },
      { label: t("date.week", "week"), seconds: 604800 },
      { label: t("date.day", "day"), seconds: 86400 },
      { label: t("date.hour", "hour"), seconds: 3600 },
      { label: t("date.minute", "minute"), seconds: 60 },
    ]
    let remaining = duration
    const parts: string[] = []
    for (const unit of units) {
      const count = Math.floor(remaining / unit.seconds)
      if (count > 0) {
        parts.push(`${count} ${unit.label}${count > 1 ? "s" : ""}`)
        remaining %= unit.seconds
      }
    }
    return parts.slice(0, 2).join(" and ") || "0 minutes"
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return (
          <Badge variant="outline" className="cursor-pointer bg-slate-50">
            {t(`tasks.tasks-list.status.todo`)}
          </Badge>
        )
      case "PROGRESS":
        return (
          <Badge variant="outline" className="cursor-pointer bg-blue-50 text-blue-700 border-blue-200">
            {t(`tasks.tasks-list.status.progress`)}
          </Badge>
        )
      case "REVIEW":
        return (
          <Badge variant="outline" className="cursor-pointer bg-yellow-50 text-yellow-700 border-yellow-200">
            {t(`tasks.tasks-list.status.review`)}
          </Badge>
        )
      case "DONE":
        return (
          <Badge variant="outline" className="cursor-pointer bg-green-50 text-green-700 border-green-200">
            {t(`tasks.tasks-list.status.done`)}
          </Badge>
        )
      default:
        return <Badge variant="outline" className="cursor-pointer" >{status}</Badge>
    }
  }
  const getDifficulteBadge = (difficulte: string) => {
    switch (difficulte.toLowerCase()) {
      case "hard":
        return (
          <Badge variant="outline" className="cursor-pointer bg-red-50 text-red-700 border-red-200">
            {t(`tasks.tasks-list.difficulty.hard`)}
          </Badge>
        )
      case "normal":
        return (
          <Badge variant="outline" className="cursor-pointer bg-yellow-50 text-yellow-700 border-yellow-200">
            {t(`tasks.tasks-list.difficulty.normal`)}
          </Badge>
        )
      case "easy":
        return (
          <Badge variant="outline" className="cursor-pointer bg-slate-50">
            {t(`tasks.tasks-list.difficulty.easy`)}
          </Badge>
        )
      default:
        return <Badge variant="outline">{difficulte}</Badge>
    }
  }
  const checkIfCreatorOfProject = (project: any) => {
    if (project && project.createur) {
      const token: String = localStorage.getItem("authToken") || "";
      if (token != "") {
        const id = JSON.parse(atob(token.split('.')[1])).id;
        if (id != "" && id == project.createur.id) return true;
      }
    }
    return false;
  }
  const checkIfAssigneeTask = (task: any, user: any = null) => {
    if (user == null) {
      const token: String = localStorage.getItem("authToken") || "";
      if (token != "") {
        const id = JSON.parse(atob(token.split('.')[1])).id;
        user = { 'id': id }
      } else return false;
    }
    return task?.assignee?.some((u: any) => u.id === user.id);
  }
  const correctedDifficulty = (difficulty: string) => {
    const mapping: Record<string, string> = {
      normal: "normal", // Fix typo if backend expects this
      easy: "easy",
      hard: "hard",
    };
    return mapping[difficulty] || difficulty;
  };
  const correctedStatus = (difficulty: string) => {
    const mapping: Record<string, string> = {
      TODO: "TODO", // Fix typo if backend expects this
      PROGRESS: "PROGRESS",
      REVIEW: "REVIEW",
      DONE: "DONE",
    };
    return mapping[difficulty] || difficulty;
  };
  const handleTaskCreate = async (task: any) => {
    const fixedTask = {
      ...task,
      difficulte: correctedDifficulty(task.difficulte),
    };

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }

      const res = await fetch("/api/tache/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fixedTask),
      });

      if (res.ok) {
        toast.success(t("toast.use_tasks.add_task.success"));
        setIsLoading(false);
        return true;
      } else {
        switch (res.status) {
          case 403: {
            setAddTaskError(t("toast.use_tasks.add_task.unauthorized"));
            break;
          }
          case 416: {
            setAddTaskError(t("toast.use_tasks.add_task.invalid_input"));
            break;
          }
          case 400: {
            setAddTaskError(t("toast.use_tasks.add_task.error"));
            break;
          }
        }
      }
    } catch (error) {
      setAddTaskError(t("toast.use_tasks.add_task.error"));
    }
    return false;
  };
  const handleFindAllTasks = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }

      const res = await fetch("/api/tache/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        return setTasks(result);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error");
    }
    return [];
  };
  const handleUpdateStatutTask = async (taskID: any, statut: any) => {
    const toastId = toast.loading(t("toast.use_tasks.update_status.loading"));
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const fixedStatut = correctedStatus(statut);
      const data = new FormData();
      data.append("taskID", taskID);
      data.append("statut", fixedStatut);

      const res = await fetch("/api/tache/update/statut", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      if (res?.ok) {
        toast.success(t("toast.use_tasks.update_status.success"), { id: toastId });
        return true;
      } else {
        toast.error(t("toast.use_tasks.update_status.error"), { id: toastId });
      }
    } catch (error) {
      toast.error(t("toast.server_error"), { id: toastId });
    }
    return false;
  };
  const handleDeleteTask = async (taskID: any) => {
    const toastId = toast.loading(t("toast.use_tasks.delete_task.loading"));
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const data = new FormData();
      data.append("taskID", taskID);

      const res = await fetch("/api/tache/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        toast.success(t("toast.use_tasks.delete_task.success"), { id: toastId });
        return true;
      } else {
        toast.error(t("toast.use_tasks.delete_task.error"), { id: toastId });
      }
    } catch (error) {
      toast.error(t("toast.server_error"), { id: toastId });
    }
    return false;
  };
  const DeleteSubTask = async (taskID: any, subTaskID: any, type: any = null) => {
    const msg = type === null ? "disassociate_subtask" : "disassociate_parenttask";
    const toastId = toast.loading(t(`toast.use_tasks.${msg}.loading`));

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const data = new FormData();
      data.append("taskID", taskID);
      data.append("subTaskID", subTaskID);
      const res = await fetch("/api/tache/delete/soustache", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        toast.success(t(`toast.use_tasks.${msg}.success`), { id: toastId });
        return true;
      } else {
        toast.error(t(`toast.use_tasks.${msg}.error`), { id: toastId });
      }
    } catch (error) {
      toast.error(t("toast.server_error"), { id: toastId });
    }
    return false;
  };
  const DeletePrecTask = async (taskID: any, precTaskID: any) => {
    const toastId = toast.loading(t("toast.use_tasks.disassociate_precedentetask.loading"));
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const data = new FormData();
      data.append("taskID", taskID);
      data.append("precTaskID", precTaskID);

      const res = await fetch("/api/tache/delete/precedente", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        toast.success(t("toast.use_tasks.disassociate_precedentetask.success"), { id: toastId });
        return true;
      } else {
        toast.error(t("toast.use_tasks.disassociate_precedentetask.error"), { id: toastId });
      }
    } catch (error) {
      toast.error(t("toast.server_error"), { id: toastId });
    }
    return false;
  };
  const DeleteParallelTask = async (taskID: any, parallelTaskID: any) => {
    const toastId = toast.loading(t("toast.use_tasks.disassociate_parallelestask.loading"));
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const data = new FormData();
      data.append("taskID", taskID);
      data.append("parallelTaskID", parallelTaskID);

      const res = await fetch("/api/tache/delete/parallel", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) {
        toast.error(t("toast.use_tasks.disassociate_parallelestask.error"), { id: toastId });
        return false;
      }
      toast.success(t("toast.use_tasks.disassociate_parallelestask.success"), { id: toastId });
      return true;

    } catch (error) {
      toast.error(t("toast.server_error"), { id: toastId });
    }
    return false;
  };
  
  const handleUpdateTask = async (updated: any) => {
    let message = "";
    try {
      const token = localStorage.getItem("authToken");
      // send only the ID and the attributes you want to edit
      const fixedTask = {
        budgetEstime: updated.budgetEstime,
        dateCreation: updated.dateCreation,
        dateDebut: updated.dateDebut,
        dateFin: updated.dateFin,
        dateFinEstime: updated.dateFinEstime,
        description: updated.description,
        difficulte: updated.difficulte,
        duree: updated.duree,
        id: updated.id,
        marge: updated.marge,
        nomTache: updated.nomTache,
        qualite: updated.qualite,
        statut: updated.statut,
      }
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const res = await fetch("/api/tache/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fixedTask),
      });

      if (res.ok) {
        toast.success(t("task.update_success"));
        return { message, result: true }
      } else {
        switch (res.status) {
          case 416: {
            const errorText = await res.text();
            switch (errorText) {
              case "nom_tache_invalid":
                message = t("task.error.nom_tache_invalid");
                break;
              case "description_invalid":
                message = t("task.error.description_invalid");
                break;
              case "date_invalid":
                message =t("task.error.date_invalid");
                break;
              case "duree_invalid":
                message =t("task.error.duree_invalid");
                break;
              case "marge_invalid":
                message =t("task.error.marge_invalid");
                break;
              case "budget_invalid":
                message =t("task.error.budget_invalid");
                break;
              case "qualite_invalid":
                message =t("task.error.qualite_invalid");
                break;
              case "difficulte_invalid":
                message =t("task.error.difficulte_invalid");
                break;
            }
            break;
          }
          case 400: {
            message = t("task.error.bad_request");
            break;
          }
          default : {
            message = t("task.error.unexpected") ;
          }
        }
      }
    } catch (error) {
      toast.error(t("toast.server_error"));
    }
    return { message, result: false }
  };

  const getTasksByProjectID = async (projectID: any) => {
    setIsLoading(true);
    console.log("try to get tasks ... ")
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const res = await fetch(`/api/tache/get/project/${projectID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        setTasks(result)
        setIsLoading(false);
        return result;
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error");
    }
    setIsLoading(false);
    return [];
  };
  const getMyTasks = async () => {
    setIsLoading(true);
    const token: String = localStorage.getItem("authToken") || "";
    if (!token) return;
    const id = JSON.parse(atob(token.split('.')[1])).id;

    try {
      const res = await fetch(`/api/tache/get/user/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        setIsLoading(false);
        return setTasks(result);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error");
    }
    setIsLoading(false);
    return [];
  };
  const handleDeleteAssignee = async (taskID: any, userID: any) => {
    const toastId = toast.loading(t("toast.use_tasks.delete_assigne.loading"));
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const data = new FormData();
      data.append("taskID", taskID);
      data.append("userID", userID);
      const res = await fetch("/api/tache/delete/assignee", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        toast.success(t("toast.use_tasks.delete_assigne.success"), { id: toastId });
        return true;
      } else {
        toast.error(t("toast.use_tasks.delete_assigne.error"), { id: toastId });
      }
    } catch (error) {
      toast.error(t("toast.server_error"), { id: toastId });
    }
    return false;
  };
  const handleAddAssignee = async (taskID: any, userID: any) => {
    const toastId = toast.loading(t("toast.use_tasks.add_assigne.loading"));
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const data = new FormData();
      data.append("taskID", taskID);
      data.append("userID", userID);
      const res = await fetch("/api/tache/add/assignee", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        toast.success(t("toast.use_tasks.add_assigne.success"), { id: toastId });
        return true;
      } else {
        toast.error(t("toast.use_tasks.add_assigne.error"), { id: toastId });
      }
    } catch (error) {
      toast.error(t("toast.server_error"), { id: toastId });
    }
    return false;
  };
  const GetTask = async (taskID: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const res = await fetch(`/api/tache/get/${taskID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        setIsLoading(false);
        return { result, status: 200 };
      } else {
        setIsLoading(false);
        return { result: null, status: res.status }
      }
    } catch (error) {
      setIsLoading(false);
      return { result: null, status: 404 }
    }
  };
  const getTasksCanBePrecedente = async (taskID: any) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const res = await fetch(`/api/tache/get/taskscanbeprecedente/${taskID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        return result;
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error");
    }
    return [];
  };
  const GetSubTasks = async (subTaskID: any) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const res = await fetch(`/api/tache/get/soustaches/${subTaskID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const result = await res.json();
        return result;
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error");
    }
    return [];
  };
  const AddParallelTask = async (taskID: any, ParallelTaskID: any) => {
    const toastId = toast.loading(t("toast.use_tasks.add_paralleletask.loading"));
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }

      const data = new FormData();
      data.append("taskID", taskID);
      data.append("parallelTaskID", ParallelTaskID);
      const res = await fetch("/api/tache/add/parallel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        toast.success(t("toast.use_tasks.add_paralleletask.success"), { id: toastId });
        return true;
      } else {
        toast.error(t("toast.use_tasks.add_paralleletask.error"), { id: toastId });
      }
    } catch (error) {
      toast.error(t("toast.server_error"), { id: toastId });
    }
    return false;
  };
  const AddSubTask = async (taskID: any, SubTaskID: any, type: any = null) => {
    const msg = type === null ? "add_subtask" : "add_parenttask";
    const toastId = toast.loading(t(`toast.use_tasks.${msg}.loading`));
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const data = new FormData();
      data.append("taskID", taskID);
      data.append("subTaskID", SubTaskID);
      const res = await fetch("/api/tache/add/soustache", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        toast.success(t(`toast.use_tasks.${msg}.success`), { id: toastId });
        return true;
      } else {
        toast.error(t(`toast.use_tasks.${msg}.error`), { id: toastId });
      }
    } catch (error) {
      toast.error(t("toast.server_error"), { id: toastId });
    }
    return false;
  };
  const AddPrecTask = async (taskID: any, PrecTaskID: any) => {
    const toastId = toast.loading(t("toast.use_tasks.add_precedentetask.loading"));
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }

      const data = new FormData();
      data.append("taskID", taskID);
      data.append("precedenteTaskID", PrecTaskID);
      const res = await fetch("/api/tache/add/precedente", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        toast.success(t("toast.use_tasks.add_precedentetask.success"), { id: toastId });
        return true;
      } else {
        toast.error(t("toast.use_tasks.add_precedentetask.error"), { id: toastId });
      }
    } catch (error) {
      toast.error(t("toast.server_error"), { id: toastId });
    }
    return false;
  };

  return {
    getTasksCanBePrecedente,
    isLoading,
    formatDurationReact,
    getStatusBadge,
    getDifficulteBadge,
    AddPrecTask,
    AddSubTask,
    AddParallelTask,
    DeleteParallelTask,
    DeletePrecTask,
    DeleteSubTask,
    GetSubTasks,
    GetTask,
    getMyTasks,
    handleDeleteAssignee,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateStatutTask,
    handleTaskCreate,
    handleFindAllTasks,
    addTaskError,
    setAddTaskError,
    tasks,
    setTasks,
    getTasksByProjectID,
    checkIfCreatorOfProject,
    handleAddAssignee,
    checkIfAssigneeTask,
  };
};
export default useTasks;
