"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Attachment } from "./attachment-item";
import { useEffect, useState } from "react";

interface AttachmentPreviewProps {
  attachment: Attachment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
}

function TextPreview({ url, token }: { url: string; token: string }) {
  const [text, setText] = useState<string>("Loading...");

  useEffect(() => {
    async function fetchText() {
      try {
        const response = await fetch("/api/attachments/file/" + url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch text file.");
        const data = await response.text();
        setText(data);
      } catch (error) {
        setText("Error loading text file.");
      }
    }

    fetchText();
  }, [url, token]);

  return (
    <div className="h-full w-full overflow-auto p-4 bg-background rounded-md">
      <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}

export function AttachmentPreview({
  attachment,
  open,
  onOpenChange,
  token,
}: AttachmentPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function openPdf() {
      try {
        const response = await fetch(
          "/api/attachments/file/" + attachment.url,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch PDF file.");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      } catch (error) {
        console.error("Failed to open PDF:", error);
      } finally {
        onOpenChange(false);
      }
    }
    if (open && attachment) {
      if (attachment.type.includes("pdf") && attachment.url) {
        openPdf();
      } else if (attachment.type.startsWith("image/") && attachment.url) {
        async function fetchImage() {
          try {
            const response = await fetch(
              "/api/attachments/file/" + attachment.url,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (!response.ok) throw new Error("Failed to fetch image.");
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            setImageUrl(blobUrl);
          } catch (error) {
            console.error(error);
          }
        }
        fetchImage();
      }
    }

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
      }
    };
  }, [open, attachment, token]);

  if (!attachment || attachment.type.includes("pdf")) return null;

  const isImage = attachment.type.startsWith("image/");
  const isText = attachment.type.includes("text");

  const handleDownload = async () => {
    if (!attachment?.url) return;

    try {
      const response = await fetch("/api/attachments/file/" + attachment.url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to download file.");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] max-h-[90vh] overflow-hidden overflow-y-scroll">
        <DialogHeader className="flex items-center justify-between px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between w-full">
            <span className="max-w-[80%] truncate text-lg font-semibold text-ellipsis overflow-hidden whitespace-nowrap">
              {attachment.name}
            </span>
            {attachment.url && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isImage && imageUrl && (
            <div className="flex h-full items-center justify-center bg-muted/10 p-2">
              <img
                src={imageUrl}
                alt={attachment.name}
                className="max-h-full max-w-full object-contain rounded-md shadow"
              />
            </div>
          )}

          {isText && attachment.url && (
            <div className="flex-1 overflow-auto p-4 bg-background">
              <TextPreview url={attachment.url} token={token} />
            </div>
          )}

          {!isImage && !isText && (
            <div className="flex flex-col h-full items-center justify-center text-center space-y-4">
              <p className="text-muted-foreground">
                Preview is not available for this file type.
              </p>
              {attachment.url && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download to view
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
