import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LockOpen, Eye, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/FileDropzone";
import type { FileData } from "@/pages/Home";
import { apiRequest } from "@/lib/queryClient";

interface DecryptPanelProps {
  onSubmit: (data: FileData) => void;
  initialFileId?: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB to accommodate encryption overhead

const formSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size > 0, "Please select a file")
    .refine(file => file.size <= MAX_FILE_SIZE, `File size should be less than 100MB`),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function DecryptPanel({ onSubmit, initialFileId }: DecryptPanelProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  // Query for file info if initialFileId is provided (for direct link decryption)
  const { data: fileInfo, isLoading: fileInfoLoading } = useQuery({
    queryKey: [`/api/files/${initialFileId}`],
    enabled: !!initialFileId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  // Fetch the actual file from the server when initialFileId is provided
  useEffect(() => {
    if (initialFileId && !fileInfoLoading && fileInfo) {
      const fetchEncryptedFile = async () => {
        try {
          const response = await fetch(`/api/files/${initialFileId}/download`);
          
          if (!response.ok) {
            toast({
              title: "Error",
              description: "Could not download the encrypted file",
              variant: "destructive"
            });
            return;
          }
          
          const blob = await response.blob();
          const filename = fileInfo.encryptedFileName || "encrypted-file.bin";
          
          // Create a File object from the downloaded blob
          const file = new File([blob], filename, { type: 'application/octet-stream' });
          
          // Set the file in the form
          form.setValue('file', file);
          
          toast({
            title: "File Ready",
            description: "Enter your password to decrypt the file",
          });
        } catch (error) {
          console.error("Error fetching file:", error);
          toast({
            title: "Error",
            description: "Could not download the encrypted file",
            variant: "destructive"
          });
        }
      };
      
      fetchEncryptedFile();
    }
  }, [fileInfo, fileInfoLoading, initialFileId, form, toast]);

  const onFormSubmit = (data: FormValues) => {
    onSubmit({
      file: data.file,
      password: data.password
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-gray-700 font-medium mb-2">
                  Select encrypted file to decrypt
                </FormLabel>
                <FormControl>
                  <FileDropzone
                    onFileSelected={(file) => field.onChange(file)}
                    value={field.value}
                    maxSize={MAX_FILE_SIZE}
                    icon={<LockOpen className="h-10 w-10 text-gray-400" />}
                    accept=".encrypted,application/octet-stream"
                    dropzoneText="Drag and drop an encrypted file here or click to browse"
                    fileTypeText="Only encrypted files can be decrypted"
                    isLoading={fileInfoLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-gray-700 font-medium mb-2">
                  Decryption Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter the password to decrypt this file"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full font-medium py-3"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            <LockOpen className="mr-2 h-5 w-5" />
            Decrypt File
          </Button>
        </form>
      </Form>
    </div>
  );
}
