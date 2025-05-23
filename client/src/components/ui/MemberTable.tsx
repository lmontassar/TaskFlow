import { Edit, Eye, PlusIcon, Trash, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import useProject from "../../hooks/useProject";
import { EditDialog } from "./EditDialog";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Input } from "./input";

function MemberTable({
  filteredMembers,
  t,
  getRoleBadge,
  setDeleteTrigger,
  setCurrentMember,
  deleteTrigger,
  currentMember,
  handleDelete,
  handleAddSkill,
  handleRemoveSkill,
}: any) {
  const [editTrigger, setEditTrigger] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(1);
  const [showNewSkillInput, setShowNewSkillInput] = useState(false);
  const [currentSkillId, setCurrentSkillId] = useState("");
  const handleSelectChange = (field: any, value: any) => {
    // Assume all selected values default to level 1 unless managed separately
    const updatedSkills = new Set(currentMember.competances || []);
    updatedSkills.add({ titre: value, niveau: 1 });
    setCurrentMember({
      ...currentMember,
      competances: Array.from(updatedSkills),
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("member.name")}</TableHead>
              <TableHead>{t("member.lastname")}</TableHead>
              <TableHead>{t("member.email")}</TableHead>
              <TableHead>{t("member.role.title")}</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member: any) => (
                <TableRow key={member.user.id}>
                  <TableCell>{member.user.nom}</TableCell>

                  <TableCell>{member.user.prenom}</TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Edit
                        className="mr-2 h-4 w-4 text-blue-600 cursor-pointer"
                        onClick={() => {
                          setEditTrigger(true);
                          setCurrentMember(member);
                        }}
                      />
                      <Trash2
                        className="mr-2 h-4 w-4 text-red-600 cursor-pointer"
                        onClick={() => {
                          setDeleteTrigger(true);
                          setCurrentMember(member.user);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {t("member.no_members")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTrigger} onOpenChange={setDeleteTrigger}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("member.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("member.delete.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentMember && (
              <div className="rounded-md border p-4">
                <div className="font-medium">{currentMember.nom}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTrigger(false)}>
              {t("member.delete.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("member.delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Confirmation Dialog */}
      <Dialog open={editTrigger} onOpenChange={setEditTrigger}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("member.editForm.edit_title")}</DialogTitle>
            <DialogDescription>
              {t("member.editForm.edit_description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label className="mb-2" htmlFor="edit-skills">
                {t("member.editForm.skills")}
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  value={newSkill || ""}
                  onValueChange={(value) => {
                    if (value === "other") {
                      setNewSkill("");
                      setCurrentSkillId("");
                      setNewSkillLevel(1);
                      setShowNewSkillInput(true);
                    } else {
                      const existingSkill = currentMember?.competances?.find(
                        (s: any) => s.titre === value
                      );
                      setNewSkill(value);
                      setCurrentSkillId(existingSkill?.id || "");
                      setNewSkillLevel(existingSkill?.niveau || 1);
                      setShowNewSkillInput(true);
                    }
                  }}
                >
                  <SelectTrigger id="edit-skills">
                    <SelectValue placeholder="Select Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentMember?.competances?.map(
                      (skill: any, index: number) => (
                        <>
                          <SelectItem
                            key={index}
                            value={skill.titre}
                            className="flex items-center justify-between gap-5"
                          >
                            <div>
                              {" "}
                              {`${skill.titre} (Level: ${skill.niveau})`}
                            </div>
                          </SelectItem>
                        </>
                      )
                    )}
                    <SelectItem value="other">
                      <div className="flex items-center">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        {t("member.editForm.new_skill")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {currentSkillId && (
                  <Trash2
                    className="text-red-500 cursor-pointer z-9999"
                    onClick={() => {
                      if (!newSkill.trim()) return;
                      handleRemoveSkill(currentSkillId);
                      setNewSkill("");
                      setCurrentSkillId("");
                      setNewSkillLevel(1);
                      setShowNewSkillInput(false);
                    }}
                  />
                )}
              </div>
            </div>

            {showNewSkillInput && (
              <div className="grid gap-2">
                <Input
                  placeholder={t("member.editForm.skill_title_placeholder")}
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <Input
                  type="number"
                  min={0}
                  max={5}
                  value={newSkillLevel}
                  onChange={(e) => {
                    if (
                      Number(e.target.value) >= 0 &&
                      Number(e.target.value) <= 5
                    ) {
                      setNewSkillLevel(Number(e.target.value));
                    }
                  }}
                  placeholder={t("member.editForm.skill_level_placeholder")}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!newSkill.trim()) return;
                    handleAddSkill(newSkill, newSkillLevel, currentSkillId);
                    setNewSkill("");
                    setCurrentSkillId("");
                    setNewSkillLevel(1);
                    setShowNewSkillInput(false);
                  }}
                >
                  {currentSkillId
                    ? t("member.editForm.update_skill")
                    : t("member.editForm.add_skill")}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MemberTable;
