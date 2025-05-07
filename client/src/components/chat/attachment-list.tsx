
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

interface AttachmentListProps {
  attachments: any[]
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  const getFileIcon = (type : any) => {
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
  // const getFileIcon = (type: string) => {
  //   if (type.startsWith("image/")) {
  //     return <ImageIcon className="h-4 w-4" />
  //   } else if (type.includes("pdf") || type.includes("doc") || type.includes("txt")) {
  //     return <FileTextIcon className="h-4 w-4" />
  //   } else if (type.includes("zip") || type.includes("rar")) {
  //     return <FileArchiveIcon className="h-4 w-4" />
  //   } else {
  //     return <FileIcon className="h-4 w-4" />
  //   }
  // }

  

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-2 border rounded-md hover:bg-gray-50 transition-colors"
        >
          <div className="mr-2 text-gray-500">{getFileIcon(attachment.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{attachment.name}</div>
            <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
          </div>
        </a>
      ))}
    </div>
  )
}