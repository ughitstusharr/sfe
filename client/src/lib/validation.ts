/**
 * Validates a password for security requirements
 * @param password - The password to validate
 * @returns Boolean indicating if the password meets requirements
 */
export function validatePassword(password: string): boolean {
  // Check for minimum length
  if (password.length < 8) {
    return false;
  }
  
  // Check for at least one of each requirement
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  // Require at least 3 of the 4 requirements
  const requirementsCount = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  return requirementsCount >= 3;
}

/**
 * Checks password strength and returns a score and label
 * @param password - The password to check
 * @returns Object with score (0-4) and label describing strength
 */
export function checkPasswordStrength(password: string): { score: number; label: string } {
  // Return early if no password
  if (!password) {
    return { score: 0, label: "" };
  }
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Cap at 4
  score = Math.min(score, 4);
  
  // Determine label based on score
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  
  return {
    score,
    label: labels[score],
  };
}

/**
 * Validates a file size is within the allowed limit
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns Boolean indicating if file size is valid
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Formats file size into human-readable string
 * @param bytes - Size in bytes
 * @returns Formatted file size string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
