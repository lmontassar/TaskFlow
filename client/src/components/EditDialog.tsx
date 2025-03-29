import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type EditDialogProps = {
  trigger: React.ReactNode;
  title: string;
  button: string;
  onClick: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  disabled: boolean;
  description: string;
};

export function EditDialog({
  trigger,
  title,
  button,
  onClick,
  children,
  description,
  disabled,
}: EditDialogProps) {
  return (
    <Dialog>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onClick}>
          {children}
          <DialogFooter>
            <Button type="submit" className="mt-3" disabled={disabled}>
              {button}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
