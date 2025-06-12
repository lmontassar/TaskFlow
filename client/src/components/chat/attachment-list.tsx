import { AttachmentItem } from "../attachments/attachment-item";
import { AttachmentPreview } from "../attachments/attachment-preview";
import { useState } from "react";

interface AttachmentListProps {
  attachments: any[];
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  const onRemove = () => {};
  const handlePreviewAttachment = (attachment: Attachment) => {
    setPreviewAttachment(attachment);
    setIsPreviewOpen(true);
  };
  const token = localStorage.getItem("authToken");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any>();

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <AttachmentItem
          attachment={attachment}
          onRemove={onRemove}
          onPreview={handlePreviewAttachment}
          hideRemove={true}
        />
      ))}
      <AttachmentPreview
        attachment={previewAttachment}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        token={token || ""}
      />
    </div>
  );
}
