import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Info } from "lucide-react";

interface ErrorPanelProps {
  title: string;
  message: string;
  details?: string;
  onRetry: () => void;
}

export default function ErrorPanel({ 
  title, 
  message, 
  details, 
  onRetry 
}: ErrorPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-500 rounded-full mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        
        {details && (
          <div className={`bg-gray-50 p-4 rounded-lg mb-4 text-left ${!showDetails && 'hidden'}`}>
            <h4 className="font-medium text-gray-700 mb-2">Error Details</h4>
            <div className="bg-gray-100 rounded p-3 text-sm text-gray-700 font-mono overflow-auto max-h-32">
              {details}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {details && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={toggleDetails}
          >
            {showDetails ? (
              <>
                <Info className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <Info className="h-4 w-4 mr-2" />
                Show Details
              </>
            )}
          </Button>
        )}
        <Button 
          type="button"
          className="flex-1"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
