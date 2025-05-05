import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";
import useTasks from "@/hooks/useTasks";
import TaskDependecies from "./ٍspecific-task-components/task-dependecies";
import SpecificTaskDetails from "./ٍspecific-task-components/spec-task-details";
import SpecificTaskMainTabs from "./ٍspecific-task-components/spec-main-tabs";
import SpecificTaskHeader from "./ٍspecific-task-components/spec-task-header";
import SpecificRessourcesTask from "./ٍspecific-task-components/spec-ress-task";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function SpecificTaskPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [task, setTask] = useState<any>(null);
  const [subTasks, setSubTasks] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [assigneeToDelete, setAssigneeToDelete] = useState<any>(null);
  const [duration, setDuration] = useState("");
  const [marge, setMarge] = useState("");
  const [assigneeToAdd, setAssigneeToAdd] = useState<any>(null);
  const [subTaskToDelete, setSubTaskToDelete] = useState<any>(null);
  const [precTaskToDelete, setPrecTaskToDelete] = useState<any>(null);
  const [parallelTaskToDelete, setParallelTaskToDelete] = useState<any>(null);
  const [tasksToHide, setTasksToHide] = useState<any>(null);
  const [status, setStatus] = useState(null);
  const [editError, setEditError] = useState("");
  const { t } = useTranslation();
  const token = localStorage.getItem("authToken") || "";

  const clientRef = useRef<any>(null);
  const {
    getTasksCanBePrecedente,
    AddPrecTask,
    AddSubTask,
    AddParallelTask,
    DeleteParallelTask,
    DeletePrecTask,
    GetSubTasks,
    GetTask,
    handleDeleteAssignee,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateStatutTask,
    checkIfCreatorOfProject,
    checkIfAssigneeTask,
    DeleteSubTask,
    getTasksByProjectID,
  } = useTasks();

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const res: any = await GetTask(taskId);
        setStatus(res.status);
        setTask(res.result);
        setEditedTask(res.result);
        setDuration(res.result.duree);
        setMarge(res.result.marge);
        const subTasks = await GetSubTasks(taskId);
        setSubTasks(subTasks);
        let updatedTasksToHide = [
          ...subTasks,
          res.result,

          ...(res.result?.precedentes || []),
          ...(res.result?.paralleles || []),
        ];
        if (res.result?.parent != null)
          updatedTasksToHide = [...updatedTasksToHide, res.result?.parent];
        setTasksToHide(updatedTasksToHide);
      } catch (err) {
        setError("Failed to load task details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);
  useEffect(() => {
    if (!taskId || clientRef.current) return; // prevent duplicate connections

    const socket = new SockJS("/api/ws");
    const client = Stomp.over(socket);

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log("Task WebSocket connected :", taskId);
        client.subscribe(`/topic/tasks/${taskId}`, async (message) => {
          const t = JSON.parse(message.body);
          console.log("Received task update:", t);

          setTask(t);
          setEditedTask(t);
          setDuration(t.duree);
          setMarge(t.marge);
          const subTasks = await GetSubTasks(taskId);
          setSubTasks(subTasks);
          let updatedTasksToHide = [
            ...subTasks,
            t,

            ...(t?.precedentes || []),
            ...(t?.paralleles || []),
          ];
          if (t?.parent != null)
            updatedTasksToHide = [...updatedTasksToHide, t?.parent];
          setTasksToHide(updatedTasksToHide);
        });
      },
      (error: any) => {
        console.error("Projects WebSocket error:", error);
      }
    );

    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect(() => {
          console.log("WebSocket disconnected");
        });
        clientRef.current = null;
      }
    };
  }, [taskId, token]);
  const handleRemoveAssignee = async () => {
    if (!task) return;

    try {
      const res = await handleDeleteAssignee(task.id, assigneeToDelete?.id);
      if (res == true) {
        const updatedTask = {
          ...task,
          assignee: task.assignee.filter(
            (t: any) => t.id != assigneeToDelete?.id
          ),
        };
        setTask(updatedTask);
        setEditedTask(updatedTask);
        setAssigneeToDelete(null);
      }
    } catch (err) {
      console.error("Failed to remove assignee:", err);
    }
  };

  const handleTaskUpdate = (field: string, value: any) => {
    setEditedTask({
      ...editedTask,
      [field]: value,
    });
  };

  const saveChanges = async () => {
    setEditError("");
    try {
      const updatedTask = {
        ...editedTask,
        duree: duration,
        marge: marge,
      };
      if (task.statut !== updatedTask.statut) {
        await handleUpdateStatutTask(updatedTask.id, updatedTask.statut);
      }

      const res: any = await handleUpdateTask(updatedTask);
      setEditError(res.message);
      if (res.result != true) return;
      setTask(updatedTask);
      setEditedTask(updatedTask);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const cancelEditing = () => {
    setEditedTask(task);
    setDuration(task.duree);
    setMarge(task.marge);
    setIsEditing(false);
  };

  const deleteTask = async () => {
    try {
      await handleDeleteTask(task.id);
      navigate("/tasks");
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;

    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return null;
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return (
          <CheckCircle2 className="cursor-pointer h-4 w-4 text-green-500" />
        );
      case "PROGRESS":
        return <Clock className="cursor-pointer h-4 w-4 text-amber-500" />;
      case "REVIEW":
        return <Circle className="cursor-pointer h-4 w-4 text-gray-400" />;
      default:
        return <Circle className="cursor-pointer h-4 w-4 text-gray-400" />;
    }
  };

  const handleAddParent = async (Parent: any) => {
    if (task?.parent != null) handleDeleteParent();
    const result = await AddSubTask(Parent.id, task.id, "parent");
    if (result == true)
      setTask((task: any) => ({
        ...task,
        parent: Parent,
      }));
    else alert("there is a problem");
    resetTasksToHide("add", Parent);
  };

  const handleDeleteParent = async () => {
    await DeleteSubTask(task.parent.id, taskId, "parent");
    resetTasksToHide("delete", task.parent);
    setTask((task: any) => ({
      ...task,
      parent: null,
    }));
  };

  const handleAddSubTask = async (subTask: any) => {
    const result = await AddSubTask(task.id, subTask.id);
    if (result == true) setSubTasks([...subTasks, subTask]);
    else alert("there is a problem");
    resetTasksToHide("add", subTask);
  };

  const handleDeleteSubTask = async () => {
    await DeleteSubTask(taskId, subTaskToDelete.id);
    resetTasksToHide(
      "delete",
      subTasks.find((t: any) => t.id == subTaskToDelete.id)
    );
    setSubTasks(subTasks.filter((t: any) => t.id != subTaskToDelete.id));
    setSubTaskToDelete(null);
  };

  const handleDeletePrecTask = async () => {
    await DeletePrecTask(taskId, precTaskToDelete.id);
    resetTasksToHide(
      "delete",
      task.precedentes.find((t: any) => t.id == precTaskToDelete.id)
    );
    task.precedentes = task.precedentes.filter(
      (t: any) => t.id != precTaskToDelete.id
    );
    setPrecTaskToDelete(null);
  };

  const handleDeleteParallelTask = async () => {
    await DeleteParallelTask(taskId, parallelTaskToDelete.id);
    resetTasksToHide(
      "delete",
      task.paralleles.find((t: any) => t.id == parallelTaskToDelete.id)
    );
    task.paralleles = task.paralleles.filter(
      (t: any) => t.id != parallelTaskToDelete.id
    );
    setParallelTaskToDelete(null);
  };

  const handleAddPrecTask = async (precTask: any) => {
    const result = await AddPrecTask(task.id, precTask.id);
    if (result == true)
      setTask((task: any) => ({
        ...task,
        precedentes: [...(task.precedentes || []), precTask],
      }));
    else alert("there is a problem");
    resetTasksToHide("add", precTask);
  };

  const handleAddParallelTask = async (parallelTask: any) => {
    const result = await AddParallelTask(task.id, parallelTask.id);
    if (result == true)
      setTask((task: any) => ({
        ...task,
        paralleles: [...(task.paralleles || []), parallelTask],
      }));
    else alert("there is a problem");
    resetTasksToHide("add", parallelTask);
  };

  const handleGetAllTasks = async () => {
    const tasks = await getTasksByProjectID(task.project.id);
    return tasks;
  };
  const handlegetTasksCanBePrecedente = async () => {
    const tasks = await getTasksCanBePrecedente(task.id);
    return tasks;
  };

  const handlechangeStatut = async (taskID: any, statut: any) => {
    const res = await handleUpdateStatutTask(taskID, statut);
    if (res === true) {
      setTask({ ...task, statut });
    }
  };

  const resetTasksToHide = (action: any, task: any) => {
    switch (action) {
      case "add": {
        setTasksToHide([...tasksToHide, task]);
        break;
      }
      case "delete": {
        setTasksToHide(tasksToHide.filter((t: any) => t.id != task.id));
        break;
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48 ml-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error {status}</AlertTitle>
          <AlertDescription>
            {t(`tasks.specific.errors.status_${status}`)}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }
  const canEdit = checkIfCreatorOfProject(task.project);
  const canEditStatut =
    checkIfAssigneeTask(task) || checkIfCreatorOfProject(task.project);

  return (
    <div className="container mx-auto py-6">
      <SpecificTaskHeader
        key="spec-head"
        confirmDelete={confirmDelete}
        assigneeToDelete={assigneeToDelete}
        setAssigneeToDelete={setAssigneeToDelete}
        setConfirmDelete={setConfirmDelete}
        deleteTask={deleteTask}
        handleRemoveAssignee={handleRemoveAssignee}
        subTaskToDelete={subTaskToDelete}
        setSubTaskToDelete={setSubTaskToDelete}
        handleDeleteSubTask={handleDeleteSubTask}
        task={task}
        precTaskToDelete={precTaskToDelete}
        setPrecTaskToDelete={setPrecTaskToDelete}
        handleDeletePrecTask={handleDeletePrecTask}
        setParallelTaskToDelete={setParallelTaskToDelete}
        parallelTaskToDelete={parallelTaskToDelete}
        handleDeleteParallelTask={handleDeleteParallelTask}
        canEdit={canEdit}
        setIsEditing={setIsEditing}
        isEditing={isEditing}
        navigate={navigate}
      />
      <div className="w-full lg:mx-auto flex flex-col lg:flex-row gap-4 mb-4">
        <SpecificTaskDetails
          key="spec-details"
          isEditing={isEditing}
          editError={editError}
          editedTask={editedTask}
          handleTaskUpdate={handleTaskUpdate}
          duration={duration}
          setDuration={setDuration}
          marge={marge}
          setMarge={setMarge}
          formatDate={formatDate}
          task={task}
          handleDeleteParent={handleDeleteParent}
          canEdit={canEdit}
          tasksToHide={tasksToHide}
          handleGetAllTasks={handleGetAllTasks}
          handleAddParent={handleAddParent}
          handlechangeStatut={handlechangeStatut}
          canEditStatut={canEditStatut}
          saveChanges={saveChanges}
          cancelEditing={cancelEditing}
        />
        <SpecificTaskMainTabs
          key="spec-main"
          canEdit={canEdit}
          task={task}
          setTask={setTask}
          setAssigneeToAdd={setAssigneeToAdd}
          checkIfCreatorOfProject={checkIfCreatorOfProject}
          setAssigneeToDelete={setAssigneeToDelete}
          checkIfAssigneeTask={checkIfAssigneeTask}
        />
      </div>

      <SpecificRessourcesTask task={task} setTask={setTask} canEdit={canEdit} />

      <TaskDependecies
        key="spec-dependencies"
        task={task}
        canEdit={canEdit}
        handleAddSubTask={handleAddSubTask}
        handleGetAllTasks={handleGetAllTasks}
        tasksToHide={tasksToHide}
        subTasks={subTasks}
        formatDate={formatDate}
        setSubTaskToDelete={setSubTaskToDelete}
        handleAddPrecTask={handleAddPrecTask}
        handlegetTasksCanBePrecedente={handlegetTasksCanBePrecedente}
        getStatusIcon={getStatusIcon}
        setPrecTaskToDelete={setPrecTaskToDelete}
        handleAddParallelTask={handleAddParallelTask}
        setParallelTaskToDelete={setParallelTaskToDelete}
      />
    </div>
  );
}
