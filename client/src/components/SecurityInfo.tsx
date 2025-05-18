import { Card, CardContent } from "@/components/ui/card";
import { Shield, HelpCircle } from "lucide-react";

export default function SecurityInfo() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-white rounded-xl shadow-md overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="h-5 w-5 text-primary mr-2" />
            Security Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-1">End-to-End Encryption</h3>
                <p className="text-gray-600 text-sm">
                  Your files are encrypted directly in your browser. The encryption key is derived from your password and never leaves your device.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">No Server Storage</h3>
                <p className="text-gray-600 text-sm">
                  We don't store your original files on our servers. Only the encrypted version is temporarily stored for sharing purposes.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Advanced Encryption</h3>
                <p className="text-gray-600 text-sm">
                  We use AES-256-GCM encryption, the industry standard for secure data protection used by governments and financial institutions.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Password Safety</h3>
                <p className="text-gray-600 text-sm">
                  Your password is never sent to our servers. We recommend using unique, strong passwords for each encrypted file.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-md overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <HelpCircle className="h-5 w-5 text-primary mr-2" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-1">What happens if I forget my password?</h3>
              <p className="text-gray-600 text-sm">
                Unfortunately, there is no way to recover your file if you forget the password. We don't store your password anywhere, so make sure to keep it safe.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">How long do encrypted files remain available?</h3>
              <p className="text-gray-600 text-sm">
                Encrypted files are stored on our servers for 7 days. After that, they are automatically deleted. For longer storage, please download the encrypted file.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Are there file size limitations?</h3>
              <p className="text-gray-600 text-sm">
                Yes, the maximum file size is 50MB for free accounts. This helps us maintain server performance and availability for all users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
