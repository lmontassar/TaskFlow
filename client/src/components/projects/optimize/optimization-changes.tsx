"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  Package,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Resource {
  name: string;
  quantity: number;
}

interface TaskData {
  id: number;
  name: string;
  collaborator: string;
  resources: Resource[];
  startDate: string;
  endDate: string;
}

interface TaskComparison {
  id: number;
  name: string;
  oldData: TaskData;
  newData: TaskData;
  hasChanges: boolean;
}

interface OptimizationChangesProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  optimizationResult: any;
}

export function OptimizationChanges({
  isOpen,
  onClose,
  onSave,
  optimizationResult,
}: OptimizationChangesProps) {
  // Sample task comparison data
  const taskComparisons: TaskComparison[] = optimizationResult;
  // State to track which tasks are expanded
  const [expandedTasks, setExpandedTasks] = useState<number[]>([1]);

  const toggleTaskExpansion = (taskId: number) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to determine if a specific field has changed
  const hasFieldChanged = (oldValue: any, newValue: any) => {
    return JSON.stringify(oldValue) !== JSON.stringify(newValue);
  };

  // Count total changes
  const totalChanges = taskComparisons?.filter(
    (task) => task.hasChanges
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            TASKS CHANGES
          </DialogTitle>
          <div className="flex items-center mt-2">
            <p className="text-sm text-muted-foreground">
              The optimization process has suggested changes to {totalChanges}{" "}
              of {taskComparisons.length} tasks. Review the changes below and
              save them if you agree with the optimized schedule.
            </p>
            <Badge
              variant="outline"
              className="ml-2 bg-amber-50 text-amber-700 border-amber-200"
            >
              {totalChanges} changes
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {taskComparisons.map((task) => (
            <div
              key={task.id}
              className={`border rounded-md ${
                task.hasChanges ? "border-l-4 border-l-blue-500" : ""
              }`}
            >
              <div
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => toggleTaskExpansion(task.id)}
              >
                <div className="flex items-center">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  <span className="font-medium">{task.name}</span>
                  {task.hasChanges && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs"
                    >
                      Modified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="text-sm text-muted-foreground mr-4">
                    <span>{formatDate(task.oldData.startDate)}</span>
                    <span className="mx-2">→</span>
                    <span>{formatDate(task.oldData.endDate)}</span>
                  </div>
                  {expandedTasks.includes(task.id) ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>

              {expandedTasks.includes(task.id) && (
                <div className="p-4 pt-0 border-t">
                  {/* Comparison view */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Old data */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Current Schedule
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs text-gray-500">
                              Start Date
                            </div>
                            <div
                              className={
                                hasFieldChanged(
                                  task.oldData.startDate,
                                  task.newData.startDate
                                )
                                  ? "line-through text-gray-500"
                                  : ""
                              }
                            >
                              {formatDate(task.oldData.startDate)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Clock className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs text-gray-500">
                              End Date
                            </div>
                            <div
                              className={
                                hasFieldChanged(
                                  task.oldData.endDate,
                                  task.newData.endDate
                                )
                                  ? "line-through text-gray-500"
                                  : ""
                              }
                            >
                              {formatDate(task.oldData.endDate)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Users className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs text-gray-500">
                              Collaborator
                            </div>
                            <div
                              className={
                                hasFieldChanged(
                                  task.oldData.collaborator,
                                  task.newData.collaborator
                                )
                                  ? "line-through text-gray-500"
                                  : ""
                              }
                            >
                              {task.oldData.collaborator}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Package className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs text-gray-500">
                              Resources
                            </div>
                            {task.oldData.resources.map((resource, index) => {
                              const newResource = task.newData.resources.find(
                                (r) => r.name === resource.name
                              );
                              const hasChanged =
                                !newResource ||
                                newResource.quantity !== resource.quantity;

                              return (
                                <div
                                  key={index}
                                  className={
                                    hasChanged
                                      ? "line-through text-gray-500"
                                      : ""
                                  }
                                >
                                  {resource.name} - Qte: {resource.quantity}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* New data */}
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Optimized Schedule
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 mr-2 text-blue-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs text-blue-500">
                              Start Date
                            </div>
                            <div
                              className={
                                hasFieldChanged(
                                  task.oldData.startDate,
                                  task.newData.startDate
                                )
                                  ? "font-medium text-blue-700"
                                  : ""
                              }
                            >
                              {formatDate(task.newData.startDate)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Clock className="h-4 w-4 mr-2 text-blue-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs text-blue-500">
                              End Date
                            </div>
                            <div
                              className={
                                hasFieldChanged(
                                  task.oldData.endDate,
                                  task.newData.endDate
                                )
                                  ? "font-medium text-blue-700"
                                  : ""
                              }
                            >
                              {formatDate(task.newData.endDate)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Users className="h-4 w-4 mr-2 text-blue-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs text-blue-500">
                              Collaborator
                            </div>
                            <div
                              className={
                                hasFieldChanged(
                                  task.oldData.collaborator,
                                  task.newData.collaborator
                                )
                                  ? "font-medium text-blue-700"
                                  : ""
                              }
                            >
                              {task.newData.collaborator}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Package className="h-4 w-4 mr-2 text-blue-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs text-blue-500">
                              Resources
                            </div>
                            {task.newData.resources.map((resource, index) => {
                              const oldResource = task.oldData.resources.find(
                                (r) => r.name === resource.name
                              );
                              const isNew = !oldResource;
                              const hasChanged =
                                isNew ||
                                oldResource.quantity !== resource.quantity;

                              return (
                                <div
                                  key={index}
                                  className={
                                    hasChanged
                                      ? "font-medium text-blue-700"
                                      : ""
                                  }
                                >
                                  {resource.name} - Qte: {resource.quantity}
                                  {isNew && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs"
                                    >
                                      New
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" className="w-full" onClick={onClose}>
              CANCEL
            </Button>
            <Button className="w-full" onClick={onSave}>
              Save changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
