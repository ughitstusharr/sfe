import { Button } from "@/components/ui/button";
import { CheckCircle, Download, LockOpen } from "lucide-react";
import { type DecryptedFileData } from "@/pages/Home";

interface DecryptResultPanelProps {
  result: DecryptedFileData;
  onDecryptNewFile: () => void;
  onBackToHome: () => void;
}

export default function DecryptResultPanel({ 
  result, 
  onDecryptNewFile, 
  onBackToHome 
}: DecryptResultPanelProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-500 rounded-full mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">File Decrypted Successfully</h3>
        <p className="text-gray-600">Your file has been decrypted and is ready to download.</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Original File</span>
          <a 
            href={result.downloadUrl} 
            download={result.fileName}
            className="text-primary hover:text-primary-700 text-sm font-medium flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </a>
        </div>
        <div className="flex items-center">
          <div className="p-1 bg-gray-200 rounded-md mr-2">
            <svg 
              className="h-5 w-5 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700 truncate flex-1">
            {result.fileName}
          </span>
          <span className="text-xs text-gray-500">
            {formatFileSize(result.fileSize)}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onDecryptNewFile}
        >
          <LockOpen className="h-4 w-4 mr-2" />
          Decrypt Another File
        </Button>
        <Button 
          type="button"
          className="flex-1"
          onClick={onBackToHome}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
