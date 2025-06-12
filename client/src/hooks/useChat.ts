import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const useChat = () => {
    const { t } = useTranslation();

    const getToken = () => {
        const token = localStorage.getItem("authToken");
        return token;
    }

    const addMessage = async (message: any) => {
        const toastId = toast.loading(t("", "Message Loading"));
        try {
            const token = getToken()
            if (!token) {
                alert("Authentication token missing!");
                return;
            }
            const response = await fetch("/api/chat/add",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(message)
                }
            )
            if (response.ok) {
                toast.success(t("", "Message Sent"), { id: toastId })
                const NewMessage = await response.json();
                return NewMessage;
            }
            toast.error(t("", "Message Failed"), { id: toastId })


        } catch (error) {
            toast.error(t("", "Message Failed"), { id: toastId })
        }
        return null;
    }

    const EditMessage = async (message: any) => {
        const toastId = toast.loading(t("", "Message Loading"));
        try {
            const token = getToken()
            if (!token) {
                alert("Authentication token missing!");
                return;
            }
            const response = await fetch("/api/chat/edit",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(message)
                }
            )
            if (response.ok) {
                toast.success(t("", "Message Edited"), { id: toastId })
                const NewMessage = await response.json();
                return NewMessage;
            }
            toast.error(t("", "Message Failed"), { id: toastId })


        } catch (error) {
            toast.error(t("", "Message Failed"), { id: toastId })
        }
        return null;
    }

    const uploadFile = async (file: File, message: any): Promise<any> => {
        const formData = new FormData();
        formData.append("file", file);
        const token = getToken()
        if (!token) {
            alert("Authentication token missing!");
            return;
        }
        const response = await fetch("/api/attachments/add/message/" + message?.id, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
        }
        const data = await response.json();
        return {
            id: data.id,
            name: data.name,
            size: data.size,
            type: data.type,
            url: data.url,
            createdAt: new Date(data.createdAt),
        };
    };

    const DeleteFile = async (files: any, messageID: any): Promise<any> => {
        const token = getToken()
        if (!token) {
            alert("Authentication token missing!");
            return;
        }
        const response = await fetch(`/api/attachments/message/${messageID}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(files)
        });
        if (!response.ok) {
            throw new Error(`Failed to delete`);
        }
    };

    const DeleteMessage = async (messageID: any): Promise<any> => {
        const toastId = toast.loading(t("", "Message Deleting"));
        const token = getToken()
        if (!token) {
            alert("Authentication token missing!");
            return;
        }
        try {
            const response = await fetch(`/api/chat/delete/${messageID}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                toast.error(t("", "Message Failed"), { id: toastId })
            } else {
                toast.success(t("", "Message Deleted"), { id: toastId })
            }

        } catch (err) {
            toast.error(t("", "Message Failed"), { id: toastId })
        }

    };
    
    return {
        DeleteMessage,
        DeleteFile,
        EditMessage,
        uploadFile,
        addMessage
    }
}
export default useChat