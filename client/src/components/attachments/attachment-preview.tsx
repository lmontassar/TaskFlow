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
import { useEffect } from "react";

interface AttachmentPreviewProps {
  attachment: Attachment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttachmentPreview({
  attachment,
  open,
  onOpenChange,
}: AttachmentPreviewProps) {
  useEffect(() => {
    if (open && attachment?.type.includes("pdf") && attachment.url) {
      window.open(attachment.url, "_blank");
      onOpenChange(false); // Close the dialog automatically after opening
    }
  }, [open, attachment, onOpenChange]);

  if (!attachment || attachment.type.includes("pdf")) return null;

  const isImage = attachment.type.startsWith("image/");
  const isText = attachment.type.includes("text");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex items-center justify-between px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between w-full">
            <span className="max-w-[80%] truncate text-lg font-semibold text-ellipsis overflow-hidden whitespace-nowrap">
              {attachment.name}
            </span>
            {attachment.url && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={attachment.url}
                  download={attachment.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isImage && attachment.url && (
            <div className="flex h-full items-center justify-center bg-muted/10 p-2">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-full max-w-full object-contain rounded-md shadow"
              />
            </div>
          )}

          {isText && attachment.url && (
            <div className="p-4 overflow-auto h-full bg-background">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                {/* Ideally, fetch and show real text */}
                Text preview would be displayed here.
              </pre>
            </div>
          )}

          {!isImage && !isText && (
            <div className="flex flex-col h-full items-center justify-center text-center space-y-4">
              <p className="text-muted-foreground">
                Preview is not available for this file type.
              </p>
              {attachment.url && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={attachment.url}
                    download={attachment.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download to view
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
