import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";

interface Props {
    confirmDelete : any,
    setConfirmDelete: any,
    FunctionToDO:any,
    Title : any,
    Description : any,
    CancelText: any
    ConfirmText: any
}

export default function ConfirmAlert( { 
    confirmDelete,
    setConfirmDelete,
    FunctionToDO,
    Title,
    Description,
    CancelText,
    ConfirmText
 }: Props ){
    return (
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>
                    {Title}
                </DialogTitle>
                <DialogDescription>
                    {Description}
                </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                    {CancelText}
                </Button>
                <Button variant="destructive" onClick={FunctionToDO}>
                    {ConfirmText}
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}