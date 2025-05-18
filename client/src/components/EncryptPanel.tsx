import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/FileDropzone";
import { validatePassword, checkPasswordStrength } from "@/lib/validation";
import type { FileData } from "@/pages/Home";

interface EncryptPanelProps {
  onSubmit: (data: FileData) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const formSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size > 0, "Please select a file")
    .refine(file => file.size <= MAX_FILE_SIZE, `File size should be less than 50MB`),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .refine(validatePassword, "Password should include uppercase, lowercase, number, and special character"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function EncryptPanel({ onSubmit }: EncryptPanelProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const watchPassword = form.watch("password");

  useEffect(() => {
    if (watchPassword) {
      setPasswordStrength(checkPasswordStrength(watchPassword));
    } else {
      setPasswordStrength({ score: 0, label: "" });
    }
  }, [watchPassword]);

  const onFormSubmit = (data: FormValues) => {
    onSubmit({
      file: data.file,
      password: data.password
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
                  Select a file to encrypt
                </FormLabel>
                <FormControl>
                  <FileDropzone
                    onFileSelected={(file) => field.onChange(file)}
                    value={field.value}
                    maxSize={MAX_FILE_SIZE}
                    icon={<Shield className="h-10 w-10 text-gray-400" />}
                    accept="*/*"
                    dropzoneText="Drag and drop a file here or click to browse"
                    fileTypeText="Any file type up to 50MB"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a strong password"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-gray-700 font-medium mb-2">
                    Confirm Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? (
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

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Password Strength</h4>
              <div className="flex mb-2">
                <div className={`h-2 w-1/4 rounded-l-full ${
                  passwordStrength.score >= 1 
                    ? passwordStrength.score <= 2 
                      ? "bg-red-500" 
                      : passwordStrength.score === 3 
                        ? "bg-yellow-500" 
                        : "bg-green-500"
                    : "bg-gray-200"
                }`}></div>
                <div className={`h-2 w-1/4 ${
                  passwordStrength.score >= 2 
                    ? passwordStrength.score <= 2 
                      ? "bg-red-500" 
                      : passwordStrength.score === 3 
                        ? "bg-yellow-500" 
                        : "bg-green-500"
                    : "bg-gray-200"
                }`}></div>
                <div className={`h-2 w-1/4 ${
                  passwordStrength.score >= 3 
                    ? passwordStrength.score === 3 
                      ? "bg-yellow-500" 
                      : "bg-green-500"
                    : "bg-gray-200"
                }`}></div>
                <div className={`h-2 w-1/4 rounded-r-full ${
                  passwordStrength.score >= 4 
                    ? "bg-green-500" 
                    : "bg-gray-200"
                }`}></div>
              </div>
              <p className="text-xs text-gray-500">
                {watchPassword
                  ? `Password strength: ${passwordStrength.label}`
                  : "Enter a password to see its strength"}
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full font-medium py-3"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            <Shield className="mr-2 h-5 w-5" />
            Encrypt File
          </Button>
        </form>
      </Form>
    </div>
  );
}
