import { Eye, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import useProject from "../hooks/useProject";

function MemberTable({
  filteredMembers,
  t,
  getRoleBadge,
  setDeleteTrigger,
  setCurrentMember,
  deleteTrigger,
  currentMember,
  handleDelete,
}: any) {
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
    </>
  );
}

export default MemberTable;
