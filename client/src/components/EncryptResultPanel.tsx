import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Copy, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type EncryptedFileData } from "@/pages/Home";

interface EncryptResultPanelProps {
  result: EncryptedFileData;
  onEncryptNewFile: () => void;
  onBackToHome: () => void;
}

export default function EncryptResultPanel({ 
  result, 
  onEncryptNewFile, 
  onBackToHome 
}: EncryptResultPanelProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.decryptLink);
      setCopied(true);
      toast({
        title: "Link copied to clipboard",
        variant: "success",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-500 rounded-full mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">File Encrypted Successfully</h3>
        <p className="text-gray-600 mb-4">Your file has been securely encrypted and is ready to share.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Encrypted File</span>
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
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Decryption Link</label>
        <div className="flex">
          <Input
            type="text"
            readOnly
            value={result.decryptLink}
            className="rounded-r-none bg-gray-50"
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-l-none border-l-0"
            onClick={copyToClipboard}
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Share this link with the recipient. They will need the password to decrypt the file.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onEncryptNewFile}
        >
          <Plus className="h-4 w-4 mr-2" />
          Encrypt Another File
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
