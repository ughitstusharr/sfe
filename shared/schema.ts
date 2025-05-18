import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for encrypted files
export const files = pgTable("files", {
  id: text("id").primaryKey(), // Using nanoid for file IDs
  originalFileName: text("original_file_name").notNull(),
  originalFileSize: integer("original_file_size").notNull(),
  encryptedFileName: text("encrypted_file_name").notNull(),
  encryptedFilePath: text("encrypted_file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Schema for inserting new files
export const insertFileSchema = createInsertSchema(files);

// Types
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

// Export validation schemas for client-side use
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size > 0, "Please select a file")
    .refine(file => file.size <= 50 * 1024 * 1024, "File size should be less than 50MB"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .refine(
      password => {
        // At least 3 of: uppercase, lowercase, number, special character
        const checks = [
          /[A-Z]/.test(password), // uppercase
          /[a-z]/.test(password), // lowercase
          /[0-9]/.test(password), // number
          /[^A-Za-z0-9]/.test(password) // special character
        ];
        return checks.filter(Boolean).length >= 3;
      },
      "Password should include a mix of uppercase, lowercase, numbers, and special characters"
    ),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
