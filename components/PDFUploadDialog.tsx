// components/PDFUploadDialog.tsx
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PDFUploadDialogProps {
    onUpload: (file: File) => void;
    onClose: () => void;
}

export default function PDFUploadDialog({
    onUpload,
    onClose,
}: PDFUploadDialogProps) {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (file) {
            onUpload(file);
        }
    };

    return (
        <Dialog
            open={true}
            onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 text-slate-200 border-slate-800 w-[90%] max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle>Upload PDF</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="pdf-file">Select PDF</Label>
                        <Input
                            id="pdf-file"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="bg-slate-800 text-slate-200 border-slate-700 file:bg-slate-700 file:text-slate-200 file:border-0"
                        />
                    </div>
                </div>
                <DialogFooter className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file}
                        className="w-full sm:w-auto">
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
