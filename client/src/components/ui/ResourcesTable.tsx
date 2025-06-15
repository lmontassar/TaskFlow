import { Edit, Eye, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

function ResourcesTable({
  permession,
  filteredResources,
  t,
  openDialog,
  openEditDialog,
  openDeleteDialog,
  getTypeIcon,
  getStatusBadge,
}: any) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("resource.resource")}</TableHead>
            <TableHead>{t("resource.type")}</TableHead>

            <TableHead>{t("resource.cost_per_unit")}</TableHead>
            <TableHead>{t("resource.total_cost")}</TableHead>
            <TableHead>{t("resource.status")}</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredResources.length > 0 ? (
            filteredResources.map((resource: any) => (
              <TableRow
                key={resource.id}
                onDoubleClick={() => openDialog(resource)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium truncate max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
                      {resource.nom}
                    </div>
                    {resource.notes && (
                      <div className="text-xs text-muted-foreground truncate max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
                        {resource.notes}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(resource.type)}
                    <span className="capitalize">{resource.type}</span>
                  </div>
                </TableCell>

                <TableCell>
                  TND {resource.coutUnitaire.toLocaleString()}
                </TableCell>
                <TableCell>
                  TND{" "}
                  {(
                    resource.qte * resource.coutUnitaire ||
                    resource?.consommationMax * resource.coutUnitaire
                  ).toLocaleString()}
                </TableCell>
                <TableCell>{getStatusBadge(resource.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Eye
                      className="mr-2 h-4 w-4 "
                      onClick={() => openDialog(resource)}
                    />
                    {permession && (
                      <>
                        <Edit
                          className="mr-2 h-4 w-4 text-green-600"
                          onClick={() => openEditDialog(resource)}
                        />
                        <Trash2
                          className="mr-2 h-4 w-4 text-red-600"
                          onClick={() => openDeleteDialog(resource)}
                        />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {t("resource.no_resources")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default ResourcesTable;
