"use client";

import { useRef, useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, ExternalLink, Sparkles, Loader2 } from "lucide-react";

type Props = {
  file: File | null;
  setFile: (file: File | null) => void;
  existingResumeName?: string;
  existingResumeUrl?: string;
  onExtract?: () => void;
  isExtracting?: boolean;
};

export function ResumeUpload({ file, setFile, existingResumeName, existingResumeUrl, onExtract, isExtracting }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // Create / revoke object URL whenever a new local file is selected
  useEffect(() => {
    if (!file) {
      setLocalPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // The URL to open in a new tab: prefer local preview, fall back to existing storage URL
  const viewableUrl = localPreviewUrl ?? existingResumeUrl ?? null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayName = file ? file.name : existingResumeName;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Resume</h2>
        <p className="text-xs text-text-secondary mt-1">
          Upload an existing resume to auto-fill the profile, or generate a new tailored one from your details below.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 cursor-pointer transition-colors ${
          isDragOver
            ? "border-accent bg-accent-muted/10"
            : displayName
            ? "border-success bg-surface-secondary"
            : "border-border-muted bg-surface-secondary hover:bg-surface-secondary/75"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            displayName ? "bg-success/10 text-success" : "bg-accent-muted text-accent"
          }`}
        >
          {displayName ? <CheckCircle2 className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
        </div>
        <div className="flex flex-col gap-1">
          {displayName ? (
            <>
              <p className="text-sm font-semibold text-text-primary">
                Selected: {displayName}
              </p>
              <p className="text-xs text-text-muted">
                {file ? `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB` : "Uploaded previously"}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-text-primary">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-text-muted">
                PDF formatting only. Maximum file size 5MB.
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-border rounded-md text-sm font-medium text-text-secondary bg-surface hover:bg-surface-secondary transition-colors"
          >
            {displayName ? "Change Resume" : "Select Resume"}
          </button>
          {viewableUrl && (
            <a
              href={viewableUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-md text-sm font-medium text-text-secondary bg-surface hover:bg-surface-secondary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Resume
            </a>
          )}
        </div>
      </div>

      {/* Extract + Generate section */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border">
        {/* Extract from Resume — only shown when a resume is available */}
        {(file || existingResumeUrl) && onExtract && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-medium text-text-secondary">
              Auto-fill your profile from this resume using AI.
            </p>
            <button
              type="button"
              onClick={onExtract}
              disabled={isExtracting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Extract from Resume
                </>
              )}
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-text-secondary">
            Need a fresh document based on the fields below?
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-surface text-text-primary hover:bg-surface-secondary transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            Generate Resume from Profile
          </button>
        </div>
      </div>
    </div>
  );
}
