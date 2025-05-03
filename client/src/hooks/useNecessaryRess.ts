import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';


const useNessasaryRess = () => {
    let [isLoading, setIsLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>("");
    const { t } = useTranslation();

    const AddNecessaryRessource = async (task: any, ressource: any) => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                alert("Authentication token missing!");
                return null;
            }
            const data = new FormData();
            data.append("TaskID", task.id);
            data.append("type", ressource.type);
            data.append("name", ressource.name);
            data.append("categorie", ressource.categorie);
            const quantity = parseFloat( ressource.qte );
            data.append("qte", isNaN(quantity) ? "0" : String(quantity));
            const res = await fetch("/api/necessaryressource/add", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: data,
            });

            if (res.ok) {
                toast.success(t("task.necessary_ressource.crud.addSuccess"));
                setIsLoading(false);
                const result = await res.json();
                console.log(result)
                return result;
            } else {
                switch (res.status) {
                    case 403: {
                        setAddError(t("task.necessary_ressource.crud.error403")); // for 403
                        break;
                    }
                    case 416: {
                        setAddError(t("task.necessary_ressource.crud.error416")); // for 416
                        break;
                    }
                    case 400: {
                        setAddError(t("task.necessary_ressource.crud.error400")); // for 400
                        break;
                    }
                }
            }
        } catch (error) {
            setAddError(t("task.necessary_ressource.crud.addFail"));
        }
        return null;
    };

    const EdiNecessaryRessource = async (ressource: any) => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                alert("Authentication token missing!");
                return;
            }
            console.log(ressource)
            const data = new FormData();
            data.append("RessourceID", ressource.id);
            data.append("type", ressource.type);
            data.append("name", ressource.name);
            data.append("categorie", ressource.categorie);
            const quantity = parseFloat( ressource.qte );
            data.append("qte", isNaN(quantity) ? "0" : String(quantity));

            const res = await fetch("/api/necessaryressource/edit", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: data,
            });
            
            if (res.ok) {
                toast.success(t("task.necessary_ressource.crud.editSuccess"));
                setIsLoading(false);
                return true;
            } else {
                switch (res.status) {
                    case 403: {
                        setAddError(t("task.necessary_ressource.crud.error403"));
                        break;
                    }
                    case 416: {
                        setAddError(t("task.necessary_ressource.crud.error416"));
                        break;
                    }
                    case 400: {
                        setAddError(t("task.necessary_ressource.crud.error400"));
                        break;
                    }
                }
            }
        } catch (error) {
            setAddError(t("task.necessary_ressource.crud.editFail"));
        }
        return false;
    };


    const deleteNecessaryRessource = async (ressourceID: any,TaskID : any) => {
        const toastId = toast.loading(t("task.necessary_ressource.crud.deleting"));
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                alert("Authentication token missing!");
                return;
            }
            const data = new FormData();
            data.append("RessourceID", ressourceID);
            data.append("TaskID", TaskID);
            const res = await fetch("/api/necessaryressource/delete", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: data,
            });
            if (res.ok) {
                toast.success(t("task.necessary_ressource.crud.deleteSuccess"), { id: toastId });
                return true;
            } else {
                toast.error(t("",`error`), { id: toastId });
                switch (res.status) {
                    case 403: {
                        toast.error(t("task.necessary_ressource.crud.error403"), { id: toastId });
                        break;
                    }
                    case 400: {
                        toast.error(t("task.necessary_ressource.crud.error400"), { id: toastId });
                        break;
                    }
                }
            }
        } catch (error) {
            toast.error(t("task.necessary_ressource.crud.deleteFail"), { id: toastId });
        }
        return false;
    };
    return { AddNecessaryRessource ,EdiNecessaryRessource ,deleteNecessaryRessource }
}

export default useNessasaryRess;