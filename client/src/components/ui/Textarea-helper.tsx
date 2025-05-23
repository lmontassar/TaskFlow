import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Textarea03Props {
  label?: string;
  placeholder: string;
  helperText: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function Textarea03({
  label,
  placeholder,
  helperText,
  value,
  onChange,
}: Textarea03Props) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor="textarea-03">{label}</Label>}
      <Textarea
        id="textarea-03"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <p
        className="mt-2 text-xs text-muted-foreground"
        role="region"
        aria-live="polite"
      >
        {helperText}
      </p>
    </div>
  );
}
