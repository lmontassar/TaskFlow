"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import { OptimizationChanges } from "./optimization-changes";
import useOptimise from "../../../hooks/useOptimise";

interface OptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function OptimizeDialog({
  isOpen,
  onClose,
  projectId,
}: OptimizeDialogProps) {
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [collaboratorsAffectation, setCollaboratorsAffectation] =
    useState(false);
  const [resourceAffectation, setResourceAffectation] = useState(false);
  const [optimisationResult, setOptimizationResult] = useState<any>(null);
  // Optimization progress states
  const [currentStep, setCurrentStep] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const { optimise, step } = useOptimise(projectId);
  const steps = [
    "Request sended",
    "Tasks required skills and resources identification",
    "Preparing Data",
    "Start optimising",
    "Done",
  ];
  useEffect(() => {
    // Simulate the optimization process
    if (step < steps.length - 1) {
      setCurrentStep(step);
    } else {
      setIsOptimizing(false);
    }
  }, [step, projectId]);
  const handleConfirm = async () => {
    setShowConfirmation(false);
    setIsOptimizing(true);
    const opt: any = await optimise(
      projectId,
      collaboratorsAffectation,
      resourceAffectation
    );
    if (opt) {
      setOptimizationResult(opt);
      setIsOptimizing(false);
      setCurrentStep(steps.length - 1);
    }
  };

  const handleCancel = () => {
    onClose();
    // Reset states after dialog is closed
    setTimeout(() => {
      setShowConfirmation(true);
      setCurrentStep(0);
      setIsOptimizing(false);
      setShowChanges(false);
    }, 300);
  };

  const handleShowResults = () => {
    setShowChanges(true);
  };

  const handleSaveChanges = () => {
    // Here you would implement the logic to save the optimization changes
    setShowChanges(false);
    onClose();
    // Reset states after dialog is closed
    setTimeout(() => {
      setShowConfirmation(true);
      setCurrentStep(0);
      setIsOptimizing(false);
    }, 300);
  };

  if (showChanges) {
    return (
      <OptimizationChanges
        isOpen={true}
        onClose={handleCancel}
        optimizationResult={optimisationResult}
        onSave={handleSaveChanges}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      {showConfirmation ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              OPTIMIZE YOUR PLANIFICATION
            </DialogTitle>
            <DialogDescription className="text-center">
              This may take time but it will be safe and we will not change
              anything if you don&apos;t accept changes before verification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-t border-b py-4">
              <h3 className="mb-4 font-medium">Schedule Options</h3>
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="collaborators">
                    Collaborators affectations
                  </Label>
                </div>
                <Switch
                  id="collaborators"
                  checked={collaboratorsAffectation}
                  onCheckedChange={setCollaboratorsAffectation}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="resources">Resource affectations</Label>
                </div>
                <Switch
                  id="resources"
                  checked={resourceAffectation}
                  onCheckedChange={setResourceAffectation}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Optimization Loading
            </DialogTitle>
            <DialogDescription className="text-center">
              Please wait, this may take a few minutes...
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      index < currentStep
                        ? "bg-green-100 text-green-600"
                        : index === currentStep
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : index === currentStep && isOptimizing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : index === currentStep && !isOptimizing ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  <div
                    className={`ml-4 ${
                      index <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            {currentStep === steps.length - 1 && (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleShowResults}>Show the results</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
