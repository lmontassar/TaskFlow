import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { useTranslation } from "react-i18next";

const useTasks = () => {
  let [tasks, setTasks] = useState([]);
  let [isLoading , setIsLoading] = useState(false);
  const [addTaskError, setAddTaskError] = useState<string | null>("");
  const { t  } = useTranslation();

  const formatDurationReact = (duration: number): string  => {
    const units = [
      { label: t("date.year","year"), seconds: 31536000 },
      { label: t("date.month","month"), seconds: 2592000 },
      { label: t("date.week","week"), seconds: 604800 },
      { label: t("date.day","day"), seconds: 86400 },
      { label: t("date.hour","hour"), seconds: 3600 },
      { label: t("date.minute","minute"), seconds: 60 },
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
  const checkIfCreatorOfProject = (project:any) => {
    if( project && project.createur ) {
        const token:String  = localStorage.getItem("authToken") || "";
        if(token != ""){
          const id = JSON.parse(atob(token.split('.')[1])).id;
          if( id!="" && id == project.createur.id ) return true ;
        }
    }
    return false;
  }
  const checkIfAssigneeTask = ( task:any, user :any = null )=> {
    if (user == null){
      const token:String  = localStorage.getItem("authToken") || "";
      if(token != ""){
        const id = JSON.parse(atob(token.split('.')[1])).id;
        user = { 'id': id}
      }else return false;
    }
     return task?.assignee?.some( (u:any) => u.id === user.id);
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
        return true;
      } else {
        switch (res.status) {
          case 403: {
            setAddTaskError("error 403");
            break;
          }
          case 416: {
            setAddTaskError("error 416");
            break;
          }
          case 400: {
            setAddTaskError("error 400");
            break;
          }
        }
      }
    } catch (error) {
      setAddTaskError("error 400");
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

      if (res.ok) {
        console.log("changed");
        return true;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return false;
  };
  const handleDeleteTask = async (taskID: any) => {
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
        console.log("changed");
        return true;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return false;
  };
  const DeleteSubTask = async (taskID: any,subTaskID:any) => {
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
        console.log("changed");
        return true;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return false;
  };
  const DeletePrecTask = async (taskID: any,precTaskID:any) => {
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
        console.log("changed");
        return true;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return false;
  };
  const DeleteParallelTask = async (taskID: any,parallelTaskID:any) => {
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
        console.error("Failed to delete parallel task:", await res.text());
        return false;
      }
  
      //const result = await res.json();
      console.log("Successfully deleted parallel task:", );
      return true;

    } catch (error) {
      console.log(error);
    }
    return false;
  };
  const handleUpdateTask = async (updated: any) => {
    try {
      const token = localStorage.getItem("authToken");
      // send only the ID and the attributes you want to edit
      const fixedTask = {
        budgetEstime : updated.budgetEstime ,
        dateCreation : updated.dateCreation ,
        dateDebut: updated.dateDebut ,
        dateFin: updated.dateFin ,
        dateFinEstime: updated.dateFinEstime ,
        description: updated.description ,
        difficulte: updated.difficulte ,
        duree: updated.duree ,
        id: updated.id ,
        marge: updated.marge ,
        nomTache: updated.nomTache ,
        qualite: updated.qualite ,
        statut: updated.statut ,
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
        return true;
      } else {
        switch (res.status) {
          case 416: {
            setAddTaskError("error 416");
            break;
          }
          case 400: {
            setAddTaskError("error 400");
            break;
          }
        }
      }
    } catch (error) {
      setAddTaskError("error 400");
    }
    return false;
  };
  const getTasksByProjectID = async (projectID: any) => {
    setIsLoading(true);
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
  const getMyTasks = async () =>{
    setIsLoading(true);
    const token:String  = localStorage.getItem("authToken") || "";
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
  const handleDeleteAssignee = async (taskID:any,userID:any) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const data = new FormData();
      data.append("taskID", taskID);
      data.append("userID",userID);
      const res = await fetch("/api/tache/delete/assignee", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        console.log("changed");
        return true;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return false;
  };
  const handleAddAssignee = async (taskID: any,userID:any) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
        return;
      }
      const data = new FormData();
      data.append("taskID",taskID);
      data.append("userID",userID);
      const res = await fetch("/api/tache/add/assignee", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (res.ok) {
        return true;
      } else {
        
      }
    } catch (error) {
      
    }
    return false;
  };
  const GetTask = async (taskID: any) => {
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
        console.log(result)
        return result;
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error");
    }
    return [];
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
        console.log(result)
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
        console.log(result)
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
        console.log("changed");
        return true;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return false;
  };
  const AddSubTask = async (taskID: any, SubTaskID: any) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token missing!");
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
        console.log("changed");
        return true;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
    }
    return false;
  };
  const AddPrecTask = async (taskID: any, PrecTaskID: any) => {
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
        console.log("changed");
        return true;
      } else {
        console.log("noo way");
      }
    } catch (error) {
      console.log("noo way");
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
