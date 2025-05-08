"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  File,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  FileCode,
  FileIcon as FilePdf,
  FileArchive,
  FileAudio,
  FileVideo,
  Trash2,
  Download,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  createdAt: Date;
  uploading?: boolean;
}

interface AttachmentItemProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
  onPreview?: (attachment: Attachment) => void;
  hideRemove?: boolean
}

export function AttachmentItem({
  attachment,
  onRemove,
  onPreview,
  hideRemove = false
}: AttachmentItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getFileIcon = () => {
    const type = attachment.type.toLowerCase();

    if (type.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else if (
      type.includes("spreadsheet") ||
      type.includes("excel") ||
      type.includes("csv")
    ) {
      return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
    } else if (type.includes("pdf")) {
      return <FilePdf className="h-6 w-6 text-red-500" />;
    } else if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("tar") ||
      type.includes("archive")
    ) {
      return <FileArchive className="h-6 w-6 text-yellow-600" />;
    } else if (type.includes("audio")) {
      return <FileAudio className="h-6 w-6 text-purple-500" />;
    } else if (type.includes("video")) {
      return <FileVideo className="h-6 w-6 text-pink-500" />;
    } else if (
      type.includes("html") ||
      type.includes("javascript") ||
      type.includes("css") ||
      type.includes("json")
    ) {
      return <FileCode className="h-6 w-6 text-cyan-500" />;
    } else if (
      type.includes("text") ||
      type.includes("document") ||
      type.includes("word")
    ) {
      return <FileText className="h-6 w-6 text-blue-400" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "Unknown date";

    let validDate: Date;
    if (typeof date === "string") {
      validDate = new Date(date);
    } else {
      validDate = date;
    }

    if (isNaN(validDate.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(validDate);
  };

  const isPreviewable = (): boolean => {
    const type = attachment.type.toLowerCase();
    return (
      type.startsWith("image/") || type.includes("pdf") || type.includes("text")
    );
  };

  const handleDownload = async () => {
    if (!attachment.url) return;

    try {
      const token = localStorage.getItem("authToken") || "";

      const response = await fetch(`/api/attachments/file/${attachment.url}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download the file.");
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between rounded-md border p-3 transition-all",
        attachment.uploading ? "bg-muted/50" : "hover:bg-accent"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background">
          {getFileIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap text-sm font-medium"
            title={attachment.name}
          >
            {attachment.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(attachment.size)}</span>
            <span>•</span>
            <span>{formatDate(attachment.createdAt)}</span>
          </div>

          {attachment.uploading && (
            <div className="mt-1">
              <Progress value={attachment.uploadProgress} className="h-1" />
              <p className="mt-1 text-xs text-muted-foreground">
                Uploading... {attachment.uploadProgress}%
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 transition-opacity",
          isHovered || attachment.uploading ? "opacity-100" : "opacity-0"
        )}
      >
        {!attachment.uploading && (
          <>
            {attachment.url && (
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            )}

            {isPreviewable() && onPreview && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPreview(attachment)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {hideRemove == false &&
              (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(attachment.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

          </>
        )}
      </div>
    </div>
  );
}
