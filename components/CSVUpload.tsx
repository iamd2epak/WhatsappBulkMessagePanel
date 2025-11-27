"use client";

import { useCallback, useState } from "react";
import Papa from "papaparse";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CSVUploadProps {
    onDataParsed: (data: any[]) => void;
}

export default function CSVUpload({ onDataParsed }: CSVUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [recordCount, setRecordCount] = useState<number | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFile = (file: File) => {
        setFileName(file.name);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedData = results.data.map((row: any) => {
                    // Extract phone number logic
                    let phone = row.phone || row.Phone || row.PHONE || "";
                    // Remove non-digits
                    phone = phone.replace(/\D/g, "");
                    // Extract last 10 digits
                    if (phone.length > 10) {
                        phone = phone.slice(-10);
                    }
                    return {
                        ...row,
                        parsedPhone: phone,
                    };
                });
                setRecordCount(parsedData.length);
                onDataParsed(parsedData);
            },
        });
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type === "text/csv") {
                processFile(file);
            }
        },
        [onDataParsed]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const reset = () => {
        setFileName(null);
        setRecordCount(null);
        onDataParsed([]);
    };

    if (fileName) {
        return (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                            <FileText className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-white font-medium">{fileName}</p>
                            <p className="text-gray-400 text-sm flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                {recordCount} contacts parsed
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={reset}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
                isDragging
                    ? "border-green-500 bg-green-500/5"
                    : "border-gray-700 hover:border-gray-600 hover:bg-gray-900/50"
            )}
        >
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer w-full h-full block">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className={cn("w-8 h-8 transition-colors", isDragging ? "text-green-400" : "text-gray-400")} />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">Upload CSV File</h3>
                <p className="text-gray-400 text-sm mb-4">Drag & drop or click to browse</p>
                <p className="text-xs text-gray-500">
                    Required columns: <span className="text-gray-300 font-mono">phone</span>, <span className="text-gray-300 font-mono">name</span> (optional)
                </p>
            </label>
        </div>
    );
}
