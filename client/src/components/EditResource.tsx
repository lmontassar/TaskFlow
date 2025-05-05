import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DollarSign, PlusIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
function EditResource({
  formData,
  isEditDialogOpen,
  setIsEditDialogOpen,
  handleEditResource,
  handleSelectChange,
  uniqueCategories,
  handleInputChange,
  t,
}: any) {
  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("resource.add_resource_form.edit_title")}
          </DialogTitle>
          <DialogDescription>
            {t("resource.add_resource_form.edit_description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2" htmlFor="edit-categorie">
                {t("resource.add_resource_form.categorie")}
              </Label>
              <Select
                value={formData.categorie}
                onValueChange={(value) =>
                  handleSelectChange("categorie", value)
                }
              >
                <SelectTrigger id="edit-categorie">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCategories.map((category: any) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">
                    <div className="flex items-center">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {t("resource.add_resource_form.new_categorie")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.categorie === "other" && (
              <div>
                <Label className="mb-2" htmlFor="edit-newcategorie">
                  {t("resource.add_resource_form.new_categorie")}
                </Label>
                <Input
                  id="edit-newcategorie"
                  name="newcategorie"
                  value={formData.newcategorie}
                  onChange={handleInputChange}
                  placeholder={t(
                    "resource.add_resource_form.new_categorie_placeholder"
                  )}
                />
              </div>
            )}
            <div className="col-span-2">
              <Label className="mb-2" htmlFor="edit-nom">
                {t("resource.name")}
              </Label>
              <Input
                id="edit-nom"
                name="nom"
                className={formData.nom ? "" : "border-destructive"}
                value={formData.nom}
                onChange={handleInputChange}
                placeholder={t("resource.add_resource_form.name_placeholder")}
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="edit-status">
                {t("resource.status")}
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">
                    {t("resource.available")}
                  </SelectItem>
                  <SelectItem value="ALLOCATED">
                    {t("resource.allocated")}
                  </SelectItem>
                  <SelectItem value="PENDING">
                    {t("resource.pending")}
                  </SelectItem>
                  <SelectItem value="UNAVAILABLE">
                    {t("resource.unavailable")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type !== "Energetic" && (
              <div>
                <Label className="mb-2" htmlFor="edit-qte">
                  {t("resource.quantity")}
                </Label>
                <Input
                  id="edit-qte"
                  className={formData.qte ? "" : "border-destructive"}
                  name="qte"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.qte}
                  onChange={handleInputChange}
                />
              </div>
            )}
            {formData.type === "Energetic" && (
              <>
                <div>
                  <Label className="mb-2" htmlFor="edit-consommationMax">
                    {t("resource.add_resource_form.maximum_consumption")}
                  </Label>
                  <Input
                    id="edit-consommationMax"
                    name="consommationMax"
                    value={formData.consommationMax}
                    className={
                      formData.consommationMax ? "" : "border-destructive"
                    }
                    onChange={handleInputChange}
                    placeholder="e.g., 10, 20, 30"
                    type="number"
                    min="0"
                  />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="edit-consommationTotale">
                    {t("resource.add_resource_form.total_consumption")}
                  </Label>
                  <Input
                    id="edit-consommationTotale"
                    name="consommationTotale"
                    value={formData.consommationTotale}
                    className={
                      formData.consommationTotale ? "" : "border-destructive"
                    }
                    onChange={handleInputChange}
                    placeholder="e.g., 10, 20, 30"
                    type="number"
                    min="0"
                  />
                </div>
              </>
            )}
            <div>
              {formData.type === "Temporary" ||
              formData.type === "Energetic" ? (
                <>
                  <Label className="mb-2" htmlFor="edit-unitMeasure">
                    {t("resource.add_resource_form.unit")}
                  </Label>
                  <Input
                    id="edit-unitMeasure"
                    className={formData.unitMeasure ? "" : "border-destructive"}
                    name="unitMeasure"
                    value={formData.unitMeasure}
                    onChange={handleInputChange}
                    placeholder="e.g., hours, licenses, units"
                  />
                </>
              ) : (
                <>
                  <Label className="mb-2" htmlFor="edit-qteDisponibilite">
                    {t("resource.add_resource_form.available_quantity")}
                  </Label>
                  <Input
                    id="edit-qteDisponibilite"
                    name="qteDisponibilite"
                    className={
                      formData.qteDisponibilite ? "" : "border-destructive"
                    }
                    value={formData.qteDisponibilite}
                    onChange={handleInputChange}
                    placeholder="e.g., 100, 50, 25"
                    type="number"
                    min="0"
                  />
                </>
              )}
            </div>
            <div
              className={
                formData.type === "Material" ? "col-span-1" : "col-span-2"
              }
            >
              <Label className="mb-2" htmlFor="edit-coutUnitaire">
                {t("resource.cost_per_unit")} ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-coutUnitaire"
                  name="coutUnitaire"
                  className={`pl-8  ${
                    formData.coutUnitaire ? "" : "border-destructive"
                  }`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.coutUnitaire}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-span-2">
              <Label className="mb-2" htmlFor="edit-notes">
                {t("resource.add_resource_form.notes_optional")}
              </Label>
              <Input
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={t("resource.add_resource_form.notes_placeholder")}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditResource}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditResource;
