"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
var http_1 = require("http");
var storage_1 = require("./storage");
var nanoid_1 = require("nanoid");
var multer_1 = require("multer");
var path_1 = require("path");
var promises_1 = require("fs/promises");
// Set up multer for file uploads
var memStorage = multer_1.default.memoryStorage();
var upload = (0, multer_1.default)({
    storage: memStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
    },
});
// Create a tmp directory for temporary file storage
var UPLOADS_DIR = path_1.default.join(process.cwd(), 'tmp');
function ensureUploadsDir() {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promises_1.default.mkdir(UPLOADS_DIR, { recursive: true })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error("Error creating uploads directory:", err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var cleanupExpiredFiles, httpServer;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Ensure uploads directory exists
                return [4 /*yield*/, ensureUploadsDir()];
                case 1:
                    // Ensure uploads directory exists
                    _a.sent();
                    // Add a health check endpoint
                    app.get('/api/health', function (req, res) {
                        res.status(200).json({ status: 'ok', message: 'Service is running' });
                    });
                    // API endpoints
                    app.post('/api/encrypt', upload.single('file'), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var fileId, originalFileName, fileSize, filePath, fileEntity, host, protocol, domain, downloadUrl, decryptLink, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    if (!req.file) {
                                        return [2 /*return*/, res.status(400).json({ message: 'No file uploaded' })];
                                    }
                                    fileId = (0, nanoid_1.nanoid)(10);
                                    originalFileName = req.file.originalname;
                                    fileSize = req.file.size;
                                    // Make sure uploads directory exists
                                    return [4 /*yield*/, ensureUploadsDir()];
                                case 1:
                                    // Make sure uploads directory exists
                                    _a.sent();
                                    filePath = path_1.default.join(UPLOADS_DIR, "".concat(fileId, ".encrypted"));
                                    return [4 /*yield*/, promises_1.default.writeFile(filePath, req.file.buffer)];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, storage_1.storage.createFile({
                                            id: fileId,
                                            originalFileName: originalFileName,
                                            originalFileSize: fileSize,
                                            encryptedFileName: "".concat(path_1.default.parse(originalFileName).name, ".encrypted"),
                                            encryptedFilePath: filePath,
                                            uploadedAt: new Date(),
                                            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
                                        })];
                                case 3:
                                    fileEntity = _a.sent();
                                    host = req.headers.host || 'localhost:5000';
                                    protocol = req.headers['x-forwarded-proto'] || 'http';
                                    domain = void 0;
                                    if (process.env.REPLIT_DOMAINS) {
                                        domain = "https://".concat(process.env.REPLIT_DOMAINS.split(',')[0]);
                                    }
                                    else {
                                        domain = "".concat(protocol, "://").concat(host);
                                    }
                                    downloadUrl = "/api/files/".concat(fileId, "/download");
                                    decryptLink = "".concat(domain, "/decrypt/").concat(fileId);
                                    console.log("Created encrypted file: ".concat(filePath));
                                    console.log("Download URL: ".concat(downloadUrl));
                                    console.log("Decrypt link: ".concat(decryptLink));
                                    res.status(201).json({
                                        id: fileId,
                                        fileName: "".concat(path_1.default.parse(originalFileName).name, ".encrypted"),
                                        originalFileName: originalFileName,
                                        originalSize: fileSize,
                                        downloadUrl: downloadUrl,
                                        decryptLink: decryptLink,
                                    });
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_1 = _a.sent();
                                    console.error('Error in file encryption:', error_1);
                                    res.status(500).json({
                                        message: 'Failed to encrypt file',
                                        error: error_1 instanceof Error ? error_1.message : String(error_1)
                                    });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get('/api/files/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, file, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    return [4 /*yield*/, storage_1.storage.getFileById(id)];
                                case 1:
                                    file = _a.sent();
                                    if (!file) {
                                        return [2 /*return*/, res.status(404).json({ message: 'File not found' })];
                                    }
                                    res.json({
                                        id: file.id,
                                        originalFileName: file.originalFileName,
                                        encryptedFileName: file.encryptedFileName,
                                        originalFileSize: file.originalFileSize,
                                        uploadedAt: file.uploadedAt,
                                        expiresAt: file.expiresAt,
                                    });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _a.sent();
                                    console.error('Error retrieving file:', error_2);
                                    res.status(500).json({
                                        message: 'Failed to retrieve file',
                                        error: error_2 instanceof Error ? error_2.message : String(error_2)
                                    });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get('/api/files/:id/download', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, file, error_3, fileBuffer, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 7, , 8]);
                                    id = req.params.id;
                                    return [4 /*yield*/, storage_1.storage.getFileById(id)];
                                case 1:
                                    file = _a.sent();
                                    if (!file) {
                                        return [2 /*return*/, res.status(404).json({ message: 'File not found' })];
                                    }
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, promises_1.default.access(file.encryptedFilePath)];
                                case 3:
                                    _a.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_3 = _a.sent();
                                    console.error("File not found at path: ".concat(file.encryptedFilePath), error_3);
                                    return [2 /*return*/, res.status(404).json({ message: 'File data not found' })];
                                case 5:
                                    // Set appropriate headers
                                    res.setHeader('Content-Disposition', "attachment; filename=\"".concat(file.encryptedFileName, "\""));
                                    res.setHeader('Content-Type', 'application/octet-stream');
                                    return [4 /*yield*/, promises_1.default.readFile(file.encryptedFilePath)];
                                case 6:
                                    fileBuffer = _a.sent();
                                    res.send(fileBuffer);
                                    return [3 /*break*/, 8];
                                case 7:
                                    error_4 = _a.sent();
                                    console.error('Error downloading file:', error_4);
                                    res.status(500).json({
                                        message: 'Failed to download file',
                                        error: error_4 instanceof Error ? error_4.message : String(error_4)
                                    });
                                    return [3 /*break*/, 8];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/api/decrypt', upload.single('file'), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var buffer, fileId, filePath, salt, iv, fileNameLength, error_5, unlinkError_1, error_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 10, , 11]);
                                    if (!req.file) {
                                        return [2 /*return*/, res.status(400).json({ message: 'No file uploaded' })];
                                    }
                                    buffer = req.file.buffer;
                                    if (buffer.length < 32) { // Minimum size for header
                                        return [2 /*return*/, res.status(400).json({ message: 'Invalid encrypted file format - file too small' })];
                                    }
                                    fileId = (0, nanoid_1.nanoid)(10);
                                    // Make sure uploads directory exists
                                    return [4 /*yield*/, ensureUploadsDir()];
                                case 1:
                                    // Make sure uploads directory exists
                                    _a.sent();
                                    filePath = path_1.default.join(UPLOADS_DIR, "".concat(fileId, ".decrypting"));
                                    // Store the file temporarily for verification/processing
                                    return [4 /*yield*/, promises_1.default.writeFile(filePath, buffer)];
                                case 2:
                                    // Store the file temporarily for verification/processing
                                    _a.sent();
                                    console.log("Stored file for decryption at: ".concat(filePath));
                                    _a.label = 3;
                                case 3:
                                    _a.trys.push([3, 4, , 9]);
                                    salt = buffer.slice(0, 16);
                                    iv = buffer.slice(16, 28);
                                    fileNameLength = buffer.readUInt32LE(28);
                                    // Basic sanity check
                                    if (fileNameLength > 1000 || fileNameLength < 1) {
                                        throw new Error('Invalid filename length in encrypted file');
                                    }
                                    console.log("Validated file for decryption, ID: ".concat(fileId, ", filename length: ").concat(fileNameLength));
                                    // Return placeholder response since actual decryption happens client-side
                                    res.status(200).json({
                                        success: true,
                                        message: 'File validated for decryption',
                                        // Provide the file back to the client for decryption
                                        downloadUrl: "/api/temp/".concat(fileId, "/download")
                                    });
                                    return [3 /*break*/, 9];
                                case 4:
                                    error_5 = _a.sent();
                                    console.error('Error verifying encrypted file:', error_5);
                                    _a.label = 5;
                                case 5:
                                    _a.trys.push([5, 7, , 8]);
                                    return [4 /*yield*/, promises_1.default.unlink(filePath)];
                                case 6:
                                    _a.sent();
                                    return [3 /*break*/, 8];
                                case 7:
                                    unlinkError_1 = _a.sent();
                                    console.error('Error deleting invalid file:', unlinkError_1);
                                    return [3 /*break*/, 8];
                                case 8:
                                    res.status(400).json({
                                        message: 'Invalid encrypted file format. Make sure you are uploading a correctly encrypted file.',
                                        error: error_5 instanceof Error ? error_5.message : String(error_5)
                                    });
                                    return [3 /*break*/, 9];
                                case 9: return [3 /*break*/, 11];
                                case 10:
                                    error_6 = _a.sent();
                                    console.error('Error in file decryption:', error_6);
                                    res.status(500).json({
                                        message: 'Failed to process encrypted file',
                                        error: error_6 instanceof Error ? error_6.message : String(error_6)
                                    });
                                    return [3 /*break*/, 11];
                                case 11: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get('/api/temp/:id/download', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, filePath, error_7, fileBuffer, error_8, error_9;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 10, , 11]);
                                    id = req.params.id;
                                    filePath = path_1.default.join(UPLOADS_DIR, "".concat(id, ".decrypting"));
                                    console.log("Attempting to download temporary file: ".concat(filePath));
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, promises_1.default.access(filePath)];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_7 = _a.sent();
                                    console.error("Temporary file not found at path: ".concat(filePath), error_7);
                                    return [2 /*return*/, res.status(404).json({ message: 'Temporary file not found' })];
                                case 4:
                                    // Set appropriate headers
                                    res.setHeader('Content-Disposition', "attachment; filename=\"encrypted-file.bin\"");
                                    res.setHeader('Content-Type', 'application/octet-stream');
                                    return [4 /*yield*/, promises_1.default.readFile(filePath)];
                                case 5:
                                    fileBuffer = _a.sent();
                                    if (!fileBuffer || fileBuffer.length === 0) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Empty temporary file' })];
                                    }
                                    console.log("Sending temporary file (".concat(fileBuffer.length, " bytes) to client"));
                                    res.send(fileBuffer);
                                    _a.label = 6;
                                case 6:
                                    _a.trys.push([6, 8, , 9]);
                                    // In a production app, we might want to keep files for a short time
                                    // for debugging purposes or retries, but we'll delete here
                                    return [4 /*yield*/, promises_1.default.unlink(filePath)];
                                case 7:
                                    // In a production app, we might want to keep files for a short time
                                    // for debugging purposes or retries, but we'll delete here
                                    _a.sent();
                                    console.log("Deleted temporary file: ".concat(filePath));
                                    return [3 /*break*/, 9];
                                case 8:
                                    error_8 = _a.sent();
                                    console.error('Error deleting temporary file:', error_8);
                                    return [3 /*break*/, 9];
                                case 9: return [3 /*break*/, 11];
                                case 10:
                                    error_9 = _a.sent();
                                    console.error('Error downloading temporary file:', error_9);
                                    res.status(500).json({
                                        message: 'Failed to download file',
                                        error: error_9 instanceof Error ? error_9.message : String(error_9)
                                    });
                                    return [3 /*break*/, 11];
                                case 11: return [2 /*return*/];
                            }
                        });
                    }); });
                    cleanupExpiredFiles = function () { return __awaiter(_this, void 0, void 0, function () {
                        var expiredFiles, _i, expiredFiles_1, file, error_10, error_11;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 9, , 10]);
                                    return [4 /*yield*/, storage_1.storage.getExpiredFiles()];
                                case 1:
                                    expiredFiles = _a.sent();
                                    _i = 0, expiredFiles_1 = expiredFiles;
                                    _a.label = 2;
                                case 2:
                                    if (!(_i < expiredFiles_1.length)) return [3 /*break*/, 8];
                                    file = expiredFiles_1[_i];
                                    _a.label = 3;
                                case 3:
                                    _a.trys.push([3, 6, , 7]);
                                    // Delete the file from storage
                                    return [4 /*yield*/, promises_1.default.unlink(file.encryptedFilePath)];
                                case 4:
                                    // Delete the file from storage
                                    _a.sent();
                                    // Remove from database
                                    return [4 /*yield*/, storage_1.storage.deleteFile(file.id)];
                                case 5:
                                    // Remove from database
                                    _a.sent();
                                    return [3 /*break*/, 7];
                                case 6:
                                    error_10 = _a.sent();
                                    console.error("Error deleting expired file ".concat(file.id, ":"), error_10);
                                    return [3 /*break*/, 7];
                                case 7:
                                    _i++;
                                    return [3 /*break*/, 2];
                                case 8: return [3 /*break*/, 10];
                                case 9:
                                    error_11 = _a.sent();
                                    console.error('Error in expired files cleanup:', error_11);
                                    return [3 /*break*/, 10];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); };
                    // Run cleanup on startup
                    cleanupExpiredFiles();
                    // Schedule cleanup every hour
                    setInterval(cleanupExpiredFiles, 60 * 60 * 1000);
                    httpServer = (0, http_1.createServer)(app);
                    return [2 /*return*/, httpServer];
            }
        });
    });
}
