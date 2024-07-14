import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PDFUploaderProps {
    onUpload: (file: File) => void;
}

export default function PDFUploader({ onUpload }: PDFUploaderProps) {
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
        <div className="mb-4 p-4 border rounded border-slate-800 bg-slate-900 text-slate-200">
            <h2 className="text-lg font-semibold mb-2">Upload PDF</h2>
            <div className="flex items-center space-x-2">
                <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="bg-slate-800 text-slate-200 border-slate-700 file:bg-slate-700 file:text-slate-200 file:border-0"
                />
                <Button
                    onClick={handleUpload}
                    disabled={!file}>
                    Upload
                </Button>
            </div>
        </div>
    );
}