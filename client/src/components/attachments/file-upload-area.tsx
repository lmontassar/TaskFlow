"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadAreaProps {
  onFilesAdded: (files: File[]) => void;
  maxSize?: number; // in MB
  accept?: string;
  multiple?: boolean;
}

export function FileUploadArea({
  onFilesAdded,
  maxSize = 20,
  accept = "*/*",
  multiple = true,
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFiles = (files: File[]): File[] => {
    setError(null);
    const validFiles = Array.from(files).filter((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(
          `File "${file.name}" exceeds the maximum size of ${maxSize}MB`
        );
        return false;
      }

      // Check file type if accept is specified and not wildcard
      if (accept !== "*/*") {
        const acceptTypes = accept.split(",").map((type) => type.trim());
        const fileType = file.type;

        // Check if the file type matches any of the accepted types
        const isValidType = acceptTypes.some((type) => {
          if (type.endsWith("/*")) {
            // Handle wildcards like "image/*"
            const category = type.split("/")[0];
            return fileType.startsWith(`${category}/`);
          }
          return type === fileType;
        });

        if (!isValidType) {
          setError(`File "${file.name}" is not an accepted file type`);
          return false;
        }
      }

      return true;
    });

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(droppedFiles);

      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);

      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }

      // Reset the input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept={accept}
          multiple={multiple}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="rounded-full bg-background p-3 shadow-sm">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Drag files to upload</h3>
          <p className="text-sm text-muted-foreground">
            or{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={handleButtonClick}
            >
              browse your device
            </Button>
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum file size: {maxSize}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
