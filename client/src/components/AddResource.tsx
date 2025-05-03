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

function AddResource({
  formData,
  isAddDialogOpen,
  setIsAddDialogOpen,
  handleAddResource,
  handleSelectChange,
  uniqueCategories,
  handleInputChange,
  t,
}: any) {
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("resource.add_resource_form.title")}</DialogTitle>
          <DialogDescription>
            {t("resource.add_resource_form.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2" htmlFor="categorie">
                {t("resource.add_resource_form.categorie")}
              </Label>
              <Select
                value={formData.categorie}
                onValueChange={(value) =>
                  handleSelectChange("categorie", value)
                }
              >
                <SelectTrigger id="categorie">
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
                      {t("resource.add_resource_form.add_new_categorie")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.categorie === "other" && (
              <div>
                <Label className="mb-2" htmlFor="newcategorie">
                  {t("resource.add_resource_form.new_categorie")}
                </Label>
                <Input
                  id="newcategorie"
                  name="newcategorie"
                  value={formData.newcategorie}
                  onChange={handleInputChange}
                  placeholder="Enter new category"
                />
              </div>
            )}
            <div className="col-span-2">
              <Label className="mb-2" htmlFor="nom">
                {t("resource.name")}
              </Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder={t("resource.add_resource_form.name_placeholder")}
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="type">
                {t("resource.type")}
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                disabled={
                  formData.categorie !== "other" && formData.categorie !== ""
                }
              >
                <SelectTrigger id="type">
                  <SelectValue
                    placeholder={t(
                      "resource.add_resource_form.type_placeholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Temporal">
                    {t("resource.temporal")}
                  </SelectItem>
                  <SelectItem value="Material">
                    {t("resource.material")}
                  </SelectItem>
                  <SelectItem value="Energetic">
                    {t("resource.energetic")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type !== "Energetic" && (
              <div>
                <Label className="mb-2" htmlFor="qte">
                  {t("resource.quantity")}
                </Label>
                <Input
                  id="qte"
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
              <div>
                <Label className="mb-2" htmlFor="consommationMax">
                  {t("resource.add_resource_form.maximum_consumption")}
                </Label>
                <Input
                  id="consommationMax"
                  name="consommationMax"
                  value={formData.consommationMax}
                  onChange={handleInputChange}
                  placeholder="e.g., 10, 20, 30"
                  type="number"
                  min="0"
                />
              </div>
            )}
            <div className="col-span-2">
              {(formData.type === "Temporal" ||
                formData.type === "Energetic") && (
                <>
                  <Label className="mb-2" htmlFor="unitMeasure">
                    {t("resource.add_resource_form.unit")}
                  </Label>
                  <Input
                    id="unitMeasure"
                    name="unitMeasure"
                    value={formData.unitMeasure}
                    onChange={handleInputChange}
                    placeholder="e.g., hours, licenses, kWh"
                  />
                </>
              )}
            </div>

            <div className={"col-span-2"}>
              <Label className="mb-2" htmlFor="coutUnitaire">
                {t("resource.cost_per_unit")} ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="coutUnitaire"
                  name="coutUnitaire"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-8"
                  value={formData.coutUnitaire}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-span-2">
              <Label className="mb-2" htmlFor="notes">
                {t("resource.add_resource_form.notes_optional")}
              </Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={t("resource.add_resource_form.notes_placeholder")}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddResource}>Add Resource</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddResource;
