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
import { Check, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { OptimizationChanges } from "./optimization-changes";
import useOptimise from "../../../hooks/useOptimise";
import { useTranslation } from "react-i18next";

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
  const { optimise, step, saveChanges } = useOptimise(projectId);
  const [showError, setShowError] = useState(false);
  const [errorStep, setErrorStep] = useState<number | null>(null);
  // Save flow states
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showSaving, setShowSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const { t } = useTranslation();
  const steps = [
    t("optimise.steps.1"),
    t("optimise.steps.2"),
    t("optimise.steps.3"),
    t("optimise.steps.4"),
    t("optimise.steps.5"),
    t("optimise.steps.6"),
  ];

  useEffect(() => {
    // Simulate the optimization process
    if (step < steps.length - 1 && !showError) {
      setCurrentStep(step);
    } else if (step === steps.length - 1 && !showError) {
      setIsOptimizing(false);
      setCurrentStep(step);
    }
  }, [step, projectId, showError]);

  const handleConfirm = async () => {
    setShowConfirmation(false);
    setIsOptimizing(true);
    setShowError(false);
    setErrorStep(null);
    setCurrentStep(0);

    try {
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
    } catch (error) {
      setShowError(true);
      setErrorStep(currentStep);
      setIsOptimizing(false);
    }
  };

  const handleReOptimize = () => {
    setShowError(false);
    setErrorStep(null);
    setCurrentStep(0);
    setIsOptimizing(true);

    // Retry the optimization
    handleConfirm();
  };

  const handleCancel = () => {
    onClose();
    // Reset states after dialog is closed
    setTimeout(() => {
      setShowConfirmation(true);
      setCurrentStep(0);
      setIsOptimizing(false);
      setShowChanges(false);
      setShowError(false);
      setErrorStep(null);
      setShowSaveConfirmation(false);
      setShowSaving(false);
      setShowSaveSuccess(false);
    }, 300);
  };

  const handleShowResults = () => {
    setShowChanges(true);
  };

  const handleSaveChanges = () => {
    setShowSaveConfirmation(true);
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirmation(false);
    setShowSaving(true);

    try {
      await saveChanges(
        optimisationResult,
        collaboratorsAffectation,
        resourceAffectation
      );
      setShowSaving(false);
      setShowSaveSuccess(true);
    } catch (error) {
      setShowSaving(false);
      // Handle save error if needed
      console.error("Save failed:", error);
    }
  };

  const handleSaveComplete = () => {
    setShowSaveSuccess(false);
    onClose();
    // Reset all states after dialog is closed
    setTimeout(() => {
      setShowConfirmation(true);
      setCurrentStep(0);
      setIsOptimizing(false);
      setShowChanges(false);
      setShowError(false);
      setErrorStep(null);
      setShowSaveConfirmation(false);
      setShowSaving(false);
      setShowSaveSuccess(false);
    }, 300);
  };

  const getStepIcon = (index: number) => {
    if (showError && index === errorStep) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }

    if (
      index < currentStep ||
      (index === currentStep && !isOptimizing && !showError)
    ) {
      return <Check className="h-5 w-5" />;
    }

    if (index === currentStep && isOptimizing) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }

    return <div className="h-2 w-2 rounded-full bg-gray-400" />;
  };

  const getStepStyle = (index: number) => {
    if (showError && index === errorStep) {
      return "bg-red-100 text-red-600";
    }

    if (index < currentStep) {
      return "bg-green-100 text-green-600";
    }

    if (index === currentStep) {
      return "bg-blue-100 text-blue-600";
    }

    return "bg-gray-100 text-gray-400";
  };

  // Save Success Dialog
  if (showSaveSuccess) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-green-600">
              {t("optimise.dialog.success.title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("optimise.dialog.success.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleSaveComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              {t("optimise.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Saving Animation Dialog
  if (showSaving) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {t("optimise.dialog.save-changes.title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("optimise.dialog.save-changes.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Save Confirmation Dialog
  if (showSaveConfirmation) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {t("optimise.confirm_save_changes.title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("optimise.confirm_save_changes.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowSaveConfirmation(false)}
            >
              {t("optimise.cancel")}
            </Button>
            <Button onClick={handleConfirmSave}>
              {" "}
              {t("optimise.confirm_save_changes.title")}{" "}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

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
              {t("optimise.title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("optimise.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-t border-b py-4">
              <h3 className="mb-4 font-medium">
                {t("optimise.schedule.title")}
              </h3>
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="collaborators">
                    {t("optimise.schedule.collaborators_affectations")}
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
                  <Label htmlFor="resources">
                    {t("optimise.schedule.resources_affectations")}
                  </Label>
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
              {t("optimise.cancel")}
            </Button>
            <Button onClick={handleConfirm}>{t("optimise.confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {showError
                ? t("optimise.optimization-failed.title")
                : t("optimise.steps.title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {showError
                ? t("optimise.optimization-failed.description")
                : t("optimise.steps.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${getStepStyle(
                      index
                    )}`}
                  >
                    {getStepIcon(index)}
                  </div>
                  <div
                    className={`ml-4 ${
                      index <= currentStep || (showError && index === errorStep)
                        ? "text-foreground"
                        : "text-muted-foreground"
                    } ${
                      showError && index === errorStep
                        ? "text-red-600 font-medium"
                        : ""
                    }`}
                  >
                    {step}
                    {showError && index === errorStep && (
                      <span className="ml-2 text-sm text-red-500">
                        - {t("optimise.error-occurred")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            {showError ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  {t("optimise.cancel")}
                </Button>
                <Button
                  onClick={handleReOptimize}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {t("optimise.re-optimise")}
                </Button>
              </>
            ) : currentStep === steps.length - 1 &&
              optimisationResult != null ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  {t("optimise.cancel")}
                </Button>
                <Button onClick={handleShowResults}>Show the results</Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
