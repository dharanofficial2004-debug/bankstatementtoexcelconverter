"use client";

import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, AlertCircle } from "lucide-react";

export interface UploadZoneHandle {
  openPicker: () => void;
}

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isCollapsed: boolean;
  onAreaClick?: () => void;
}

const UploadZone = forwardRef<UploadZoneHandle, UploadZoneProps>(
  function UploadZone({ onFileSelect, isCollapsed, onAreaClick }: UploadZoneProps, ref) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      openPicker: () => inputRef.current?.click(),
    }));

    const validateFile = useCallback(
      (file: File): boolean => {
        setError(null);
        const isPdf = file.type === "application/pdf";
        const isImage = file.type.startsWith("image/");
        
        if (!isPdf && !isImage) {
          setError("Please upload a PDF or an image file.");
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

    const handleAreaClick = useCallback(() => {
      if (onAreaClick) {
        onAreaClick();
      } else {
        inputRef.current?.click();
      }
    }, [onAreaClick]);

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
          onClick={handleAreaClick}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 
            bg-slate-50 border border-slate-200 rounded-lg
            hover:bg-slate-100 hover:border-slate-300 transition-all"
        >
          <Upload size={16} />
          Upload another PDF
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
            className="hidden"
          />
        </button>
      );
    }

    return (
      <div className="w-full">
        <div
          className={cn(
            "relative w-full border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer group",
            isDragOver
              ? "border-primary-400 bg-primary-50"
              : "border-slate-300 bg-white hover:border-primary-300 hover:bg-primary-25"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={handleAreaClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-6">
            <div
              className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300",
                isDragOver
                  ? "bg-primary-200 scale-110"
                  : "bg-primary-100"
              )}
            >
              {isDragOver ? (
                <FileText size={28} className="text-primary-700" />
              ) : (
                <Upload size={28} className="text-primary-600" />
              )}
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isDragOver
                  ? "Drop your PDF here"
                  : "Upload your bank statement"}
              </h3>
              <p className="text-slate-600 mb-4">
                Drag & drop your PDF file here, or click to browse
              </p>
              
              <div className="inline-flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  All major banks supported
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Up to 20MB
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  PDF & Image files
                </div>
              </div>
            </div>
          </div>

          {/* no decorative overlay */}
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-4 px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    );
  }
);

export default UploadZone;