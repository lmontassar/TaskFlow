"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { FileUploadArea } from "./file-upload-area";
import { AttachmentItem, type Attachment } from "./attachment-item";
import { AttachmentPreview } from "./attachment-preview";
import { PaperclipIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface AttachmentsTabProps {
  task: any;
}

export function AttachmentsTab({ task }: AttachmentsTabProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(
    null
  );
  const { t } = useTranslation();
  const token = localStorage.getItem("authToken");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch existing attachments
  useEffect(() => {
    const fetchAttachments = async () => {
      setAttachments(task?.attachments || []);
    };

    fetchAttachments();
  }, [task?.id]);

  // Upload a single file
  const uploadFile = async (file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/attachments/add/" + task?.id, {
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
    toast.success(t("tasks.attachments.upload_success"));
    return {
      id: data.id,
      name: data.name,
      size: data.size,
      type: data.type,
      url: data.url,
      createdAt: new Date(data.createdAt),
    };
  };

  const handleFilesAdded = async (files: File[]) => {
    const tempUploadingFiles = files.map((file) => ({
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      createdAt: new Date(),
      uploading: true,
      uploadProgress: 0,
    }));

    setUploadingFiles((prev) => [...prev, ...tempUploadingFiles]);

    try {
      const uploadedFiles: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const tempId = tempUploadingFiles[i].id;
        try {
          const uploadedFile = await uploadFile(files[i]);
          uploadedFiles.push(uploadedFile);
          setUploadingFiles((prev) =>
            prev.filter((file) => file.id !== tempId)
          );
        } catch (uploadError) {
          setError(`Failed to upload file: ${files[i].name}`);
          setUploadingFiles((prev) =>
            prev.filter((file) => file.id !== tempId)
          );
        }
      }

      setAttachments((prev) => [...prev, ...uploadedFiles]);
    } catch (err) {
      setError("An error occurred during file upload.");
    }
  };

  const handleRemoveAttachment = async (id: string) => {
    // Remove from UI (client-side)
    const tacheId = task?.id;
    try {
      // Call the backend API to delete the attachment
      const response = await fetch(`/api/attachments/file/${tacheId}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Include token if needed
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete attachment on the server.");
      }
      setAttachments((prev) =>
        prev.filter((attachment) => attachment.id !== id)
      );
      toast.success(t("tasks.attachments.delete_success"));
      console.log("Attachment deleted successfully.");
    } catch (error) {
      console.error("Error removing attachment:", error);
    }
  };

  const handlePreviewAttachment = (attachment: Attachment) => {
    setPreviewAttachment(attachment);
    setIsPreviewOpen(true);
  };

  const allFiles = [...uploadingFiles, ...attachments];

  return (
    <>
      <Card className="w-full max-h-full border-none bg-background shadow-sm dark:bg-slate-800 overflow-y-scroll">
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <FileUploadArea
              onFilesAdded={handleFilesAdded}
              maxSize={20}
              multiple
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Attachments ({allFiles.length})
                </h3>
              </div>

              {allFiles.length > 0 ? (
                <div className="space-y-2">
                  {allFiles.map((attachment) => (
                    <AttachmentItem
                      key={attachment.id}
                      attachment={attachment}
                      onRemove={handleRemoveAttachment}
                      onPreview={handlePreviewAttachment}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <PaperclipIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium">
                    No attachments yet
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload files to attach them to this item
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AttachmentPreview
        attachment={previewAttachment}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        token={token || ""}
      />
    </>
  );
}
