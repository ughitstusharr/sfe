import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nanoid } from 'nanoid';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';

// Set up multer for file uploads
const memStorage = multer.memoryStorage();
const upload = multer({
  storage: memStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

// Create a tmp directory for temporary file storage
const UPLOADS_DIR = path.join(process.cwd(), 'tmp');

async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error("Error creating uploads directory:", err);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  await ensureUploadsDir();

  // Add a health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Service is running' });
  });

  // API endpoints
  app.post('/api/encrypt', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Create a unique ID for this encrypted file
      const fileId = nanoid(10);
      const originalFileName = req.file.originalname;
      const fileSize = req.file.size;
      
      // Make sure uploads directory exists
      await ensureUploadsDir();
      
      // Store the file temporarily
      const filePath = path.join(UPLOADS_DIR, `${fileId}.encrypted`);
      await fs.writeFile(filePath, req.file.buffer);

      // Create metadata and store in database
      const fileEntity = await storage.createFile({
        id: fileId,
        originalFileName,
        originalFileSize: fileSize,
        encryptedFileName: `${path.parse(originalFileName).name}.encrypted`,
        encryptedFilePath: filePath,
        uploadedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
      });

      // Generate URLs for the client
      const host = req.headers.host || 'localhost:5000';
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      
      // For Replit domains, use environment variable if available
      let domain;
      if (process.env.REPLIT_DOMAINS) {
        domain = `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`;
      } else {
        domain = `${protocol}://${host}`;
      }
      
      const downloadUrl = `/api/files/${fileId}/download`;
      const decryptLink = `${domain}/decrypt/${fileId}`;

      console.log(`Created encrypted file: ${filePath}`);
      console.log(`Download URL: ${downloadUrl}`);
      console.log(`Decrypt link: ${decryptLink}`);

      res.status(201).json({
        id: fileId,
        fileName: `${path.parse(originalFileName).name}.encrypted`,
        originalFileName,
        originalSize: fileSize,
        downloadUrl,
        decryptLink,
      });
    } catch (error) {
      console.error('Error in file encryption:', error);
      res.status(500).json({ 
        message: 'Failed to encrypt file',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get('/api/files/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      res.json({
        id: file.id,
        originalFileName: file.originalFileName,
        encryptedFileName: file.encryptedFileName,
        originalFileSize: file.originalFileSize,
        uploadedAt: file.uploadedAt,
        expiresAt: file.expiresAt,
      });
    } catch (error) {
      console.error('Error retrieving file:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve file',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get('/api/files/:id/download', async (req, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Check if file exists
      try {
        await fs.access(file.encryptedFilePath);
      } catch (error) {
        console.error(`File not found at path: ${file.encryptedFilePath}`, error);
        return res.status(404).json({ message: 'File data not found' });
      }

      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${file.encryptedFileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Stream the file to the response
      const fileBuffer = await fs.readFile(file.encryptedFilePath);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ 
        message: 'Failed to download file',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post('/api/decrypt', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // In a real implementation, we wouldn't actually decrypt on the server
      // We'd just validate the file format for client-side decryption
      
      // Verify file looks like an encrypted file
      const buffer = req.file.buffer;
      if (buffer.length < 32) { // Minimum size for header
        return res.status(400).json({ message: 'Invalid encrypted file format - file too small' });
      }

      // Generate a temporary ID for the decrypted file response
      const fileId = nanoid(10);
      
      // Make sure uploads directory exists
      await ensureUploadsDir();
      
      const filePath = path.join(UPLOADS_DIR, `${fileId}.decrypting`);
      
      // Store the file temporarily for verification/processing
      await fs.writeFile(filePath, buffer);
      console.log(`Stored file for decryption at: ${filePath}`);

      // Extract metadata like original filename if present
      // This would be a basic validation check
      try {
        // Check first 16 bytes for salt
        const salt = buffer.slice(0, 16);
        // Check next 12 bytes for IV
        const iv = buffer.slice(16, 28);
        
        // Read the filename length (4 bytes)
        const fileNameLength = buffer.readUInt32LE(28);
        
        // Basic sanity check
        if (fileNameLength > 1000 || fileNameLength < 1) {
          throw new Error('Invalid filename length in encrypted file');
        }

        console.log(`Validated file for decryption, ID: ${fileId}, filename length: ${fileNameLength}`);
        
        // Return placeholder response since actual decryption happens client-side
        res.status(200).json({
          success: true,
          message: 'File validated for decryption',
          // Provide the file back to the client for decryption
          downloadUrl: `/api/temp/${fileId}/download`
        });
      } catch (error) {
        console.error('Error verifying encrypted file:', error);
        // Delete the invalid file
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.error('Error deleting invalid file:', unlinkError);
        }
        
        res.status(400).json({ 
          message: 'Invalid encrypted file format. Make sure you are uploading a correctly encrypted file.',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } catch (error) {
      console.error('Error in file decryption:', error);
      res.status(500).json({ 
        message: 'Failed to process encrypted file',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get('/api/temp/:id/download', async (req, res) => {
    try {
      const { id } = req.params;
      const filePath = path.join(UPLOADS_DIR, `${id}.decrypting`);
      
      console.log(`Attempting to download temporary file: ${filePath}`);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        console.error(`Temporary file not found at path: ${filePath}`, error);
        return res.status(404).json({ message: 'Temporary file not found' });
      }

      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="encrypted-file.bin"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Stream the file to the response
      const fileBuffer = await fs.readFile(filePath);
      
      if (!fileBuffer || fileBuffer.length === 0) {
        return res.status(404).json({ message: 'Empty temporary file' });
      }
      
      console.log(`Sending temporary file (${fileBuffer.length} bytes) to client`);
      res.send(fileBuffer);
      
      // Only delete the temp file after successful sending
      try {
        // In a production app, we might want to keep files for a short time
        // for debugging purposes or retries, but we'll delete here
        await fs.unlink(filePath);
        console.log(`Deleted temporary file: ${filePath}`);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }
    } catch (error) {
      console.error('Error downloading temporary file:', error);
      res.status(500).json({ 
        message: 'Failed to download file',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Clean up expired files - run periodically in a real implementation
  const cleanupExpiredFiles = async () => {
    try {
      const expiredFiles = await storage.getExpiredFiles();
      
      for (const file of expiredFiles) {
        try {
          // Delete the file from storage
          await fs.unlink(file.encryptedFilePath);
          // Remove from database
          await storage.deleteFile(file.id);
        } catch (error) {
          console.error(`Error deleting expired file ${file.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in expired files cleanup:', error);
    }
  };

  // Run cleanup on startup
  cleanupExpiredFiles();
  
  // Schedule cleanup every hour
  setInterval(cleanupExpiredFiles, 60 * 60 * 1000);

  const httpServer = createServer(app);
  return httpServer;
}
