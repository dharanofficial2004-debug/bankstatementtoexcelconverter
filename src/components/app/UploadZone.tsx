"use client";

import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isCollapsed: boolean;
}

export default function UploadZone({ onFileSelect, isCollapsed }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("File too large. Maximum size is 20MB.");
        return false;
      }
      return true;
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect, validateFile]
  );

  if (isCollapsed) {
    return (
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 
          bg-slate-50 border border-slate-200 rounded-lg
          hover:bg-slate-100 hover:border-slate-300 transition-all"
      >
        <Upload size={16} />
        Upload another PDF
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
        />
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div
        className={cn("upload-zone w-full max-w-2xl", isDragOver && "upload-zone--active")}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
              isDragOver
                ? "bg-primary-100 scale-110"
                : "bg-primary-50"
            )}
          >
            {isDragOver ? (
              <FileText size={36} className="text-primary-600" />
            ) : (
              <Upload size={36} className="text-primary-500" />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              {isDragOver
                ? "Drop your PDF here"
                : "Drop your bank statement PDF here"}
            </h3>
            <p className="text-sm text-slate-500">or click to browse files</p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
            <span>Supports all banks</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Max 20MB</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>PDF only</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-error-50 text-error-600 rounded-lg text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
