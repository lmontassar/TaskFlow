import { useState } from "react";

const useTasks = () => {
  let [tasks, setTasks] = useState([]);

  const [addTaskError, setAddTaskError] = useState<string | null>("");

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
    console.log(fixedTask);
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
          Authorization: `Bearer${token}`,
        },
        body: JSON.stringify(fixedTask),
      });

      if (res.ok) {
        handleFindAllTasks();
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
        console.log(result);
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
      console.log(JSON.stringify(data));
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
      console.log(JSON.stringify(data));
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

  const handleUpdateTask = async (updated: any) => {
    try {
      const token = localStorage.getItem("authToken");
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
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        handleFindAllTasks();
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
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      console.log(projectID);

      const res = await fetch(`/api/tache/get/project/${projectID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        console.log(result);
        return setTasks(result);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error");
    }
    return [];
  };
  return {
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
  };
};
export default useTasks;
