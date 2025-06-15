import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

function ResourceDetail({
  currentResource,
  isOpenDialog,
  setIsOpenDialog,
  t,
  getTypeIcon,
  getStatusBadge,
}: any) {
  return (
    <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl truncate max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
            {currentResource?.nom}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {getTypeIcon(currentResource?.type)}
              <span className="capitalize">{currentResource?.type}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            {getStatusBadge(currentResource?.status)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Resource ID
                </h4>
                <p
                  className="mt-1 truncate max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap"
                  title={currentResource?.id}
                >
                  {currentResource?.id}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Type
                </h4>
                <p className="mt-1 flex items-center gap-1 capitalize">
                  {getTypeIcon(currentResource?.type)}
                  {currentResource?.type}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Status
                </h4>
                <p className="mt-1">
                  {getStatusBadge(currentResource?.status)}
                </p>
              </div>
              {currentResource.type == "Material" && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {t("resource.allocated_quantity")}
                  </h4>
                  <p className="mt-1">
                    {currentResource?.qteDisponibilite}{" "}
                    {currentResource?.unitMeasure}
                  </p>
                </div>
              )}
              {currentResource.type == "Energetic" ? (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {t("resource.add_resource_form.maximum_consumption")}
                    </h4>
                    <p className="mt-1">
                      {currentResource?.consommationMax}{" "}
                      {currentResource?.unitMeasure}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {t("resource.add_resource_form.total_consumption")}
                    </h4>
                    <p className="mt-1">
                      {currentResource?.consommationTotale}{" "}
                      {currentResource?.unitMeasure}
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {t("resource.quantity")}
                  </h4>
                  <p className="mt-1">
                    {currentResource?.qte || currentResource?.consommationMax}{" "}
                    {currentResource?.unitMeasure}
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Cost Per Unit
                </h4>
                <p className="mt-1">
                  TND {currentResource?.coutUnitaire.toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Total Cost
                </h4>
                <p className="mt-1 font-medium">
                  TND{" "}
                  {(
                    (currentResource?.qte || currentResource?.consommationMax) *
                    currentResource?.coutUnitaire
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {currentResource.notes && (
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="break-words whitespace-pre-wrap text-sm max-w-[calc(var(--container-md)-5rem)]">
                {currentResource.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ResourceDetail;
