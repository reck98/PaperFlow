import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (filename: string, content: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateAndReadFile = (file: File) => {
    setError(null);
    const validExtensions = ['.md', '.markdown', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      setError(`Unsupported file type. Please upload a Markdown (.md, .markdown) or plain text (.txt) file.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Limit is 10MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSelectedFile({
        name: file.name,
        size: file.size,
        content,
      });
    };
    reader.onerror = () => {
      setError('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndReadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndReadFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      onUploadSuccess(selectedFile.name, selectedFile.content);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#faf9f6] dark:bg-[#141719] border border-gray-300 dark:border-gray-800 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden text-gray-900 dark:text-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Upload className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold">Upload Markdown Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-white/50 dark:bg-gray-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            <Upload className="w-8 h-8 mx-auto text-amber-700 dark:text-amber-500 mb-3" />
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Drag & drop your Markdown file here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Supports .md, .markdown, and .txt up to 10MB
            </p>
          </div>

          {selectedFile && (
            <div className="mt-4 p-3 rounded bg-gray-100/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 truncate pr-2">
                <FileText className="w-4 h-4 text-emerald-600 flex-none" />
                <span className="font-medium truncate">{selectedFile.name}</span>
                <span className="text-gray-400 text-[11px]">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-[#f5f3ef]/50 dark:bg-[#111315]/50 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile}
            className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-medium transition-colors disabled:opacity-40"
          >
            Import Document
          </button>
        </div>
      </div>
    </div>
  );
};
