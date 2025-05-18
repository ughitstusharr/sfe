import { files, type File, type InsertFile } from "@shared/schema";

// Interface for file storage operations
export interface IStorage {
  createFile(file: InsertFile): Promise<File>;
  getFileById(id: string): Promise<File | undefined>;
  getExpiredFiles(): Promise<File[]>;
  deleteFile(id: string): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private files: Map<string, File>;

  constructor() {
    this.files = new Map();
  }

  async createFile(file: InsertFile): Promise<File> {
    const newFile: File = {
      ...file,
    };
    this.files.set(file.id, newFile);
    return newFile;
  }

  async getFileById(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getExpiredFiles(): Promise<File[]> {
    const now = new Date();
    return Array.from(this.files.values()).filter(
      (file) => file.expiresAt < now
    );
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }
}

export const storage = new MemStorage();
