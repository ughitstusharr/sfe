import { useState, useRef, ReactNode } from "react";
import { UploadCloud, X, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  value?: File;
  maxSize: number;
  icon?: ReactNode;
  accept?: string;
  dropzoneText?: string;
  fileTypeText?: string;
  isLoading?: boolean;
}

export default function FileDropzone({
  onFileSelected,
  value,
  maxSize,
  icon,
  accept = "*/*",
  dropzoneText = "Drag and drop a file here or click to browse",
  fileTypeText = "Any file type",
  isLoading = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    if (file.size > maxSize) {
      alert(`File size exceeds the limit of ${formatFileSize(maxSize)}`);
      return;
    }
    onFileSelected(file);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelected(new File([], "")); // Empty file to clear
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Loading file information...</p>
          </div>
        </div>
      ) : value && value.size > 0 ? (
        <div 
          className="p-3 bg-gray-50 rounded-lg flex items-center"
          onClick={handleClick}
        >
          <div className="p-2 bg-gray-200 rounded-md mr-2">
            <FileText className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{value.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(value.size)}</p>
          </div>
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
            onClick={handleRemoveFile}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors ${
            isDragging ? "border-primary bg-primary-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInputChange}
            accept={accept}
          />
          <div className="space-y-2">
            {icon || <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />}
            <p className="text-sm text-gray-500">{dropzoneText}</p>
            <p className="text-xs text-gray-400">{fileTypeText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
