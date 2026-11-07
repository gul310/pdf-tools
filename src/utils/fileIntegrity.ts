/**
 * Original File Integrity & Immutability Vault
 * Enforces zero-mutation guarantees and cryptographic SHA-256 validation.
 */

export interface FileIntegrityRecord {
  fileName: string;
  fileSize: number;
  mimeType: string;
  sha256: string;
  shortHash: string;
  timestamp: number;
}

/**
 * Calculates SHA-256 hash of a File, Blob, or Buffer using the Web Crypto API.
 */
export async function calculateSHA256(
  data: File | Blob | ArrayBuffer | Uint8Array
): Promise<string> {
  let arrayBuffer: ArrayBuffer;

  if (data instanceof ArrayBuffer) {
    arrayBuffer = data.slice(0); // slice to avoid detaching or locking
  } else if (data instanceof Uint8Array) {
    const copy = new Uint8Array(data.byteLength);
    copy.set(data);
    arrayBuffer = copy.buffer as ArrayBuffer;
  } else {
    // File or Blob
    arrayBuffer = await data.arrayBuffer();
  }

  // Universal Web Crypto API (Browser & Node.js globalThis)
  const subtleCrypto = globalThis.crypto?.subtle;
  if (!subtleCrypto) {
    throw new Error('Web Crypto API (crypto.subtle) is not supported in this runtime environment.');
  }

  const hashBuffer = await subtleCrypto.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates an immutable integrity record for an uploaded file.
 */
export async function createIntegrityRecord(file: File): Promise<FileIntegrityRecord> {
  const hash = await calculateSHA256(file);
  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    sha256: hash,
    shortHash: `${hash.slice(0, 8)}...${hash.slice(-6)}`,
    timestamp: Date.now()
  };
}

/**
 * Creates an isolated, deep-cloned ArrayBuffer working copy.
 * This prevents WASM libraries or Web Workers from transferring/detaching
 * or mutating the original File's memory space.
 */
export async function createWorkingBuffer(
  source: File | ArrayBuffer | Uint8Array
): Promise<ArrayBuffer> {
  if (source instanceof ArrayBuffer) {
    return source.slice(0);
  }
  if (source instanceof Uint8Array) {
    const clone = new Uint8Array(source.byteLength);
    clone.set(source);
    return clone.buffer as ArrayBuffer;
  }
  // Source is File/Blob: read fresh bytes
  const buf = await source.arrayBuffer();
  return buf.slice(0);
}

/**
 * Creates an isolated, deep-cloned Uint8Array working copy.
 */
export async function createWorkingUint8Array(
  source: File | ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  const buf = await createWorkingBuffer(source);
  return new Uint8Array(buf);
}

/**
 * Mathematically verifies that the original File object remains 100% intact
 * and uncorrupted by recalculating its SHA-256 checksum and comparing against the initial baseline.
 */
export async function verifyOriginalIntegrity(
  originalFile: File,
  baselineHash: string
): Promise<{ intact: boolean; currentHash: string }> {
  const currentHash = await calculateSHA256(originalFile);
  return {
    intact: currentHash === baselineHash,
    currentHash
  };
}

/**
 * Triggers a safe browser download of the verified original file.
 */
export function downloadOriginalFile(file: File, customName?: string): void {
  const blob = new Blob([file], { type: file.type || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = customName || file.name;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Safe Object URL manager for clean memory release.
 */
export class SafeUrlManager {
  private activeUrls: Set<string> = new Set();

  create(blob: Blob | Uint8Array, mimeType?: string): string {
    const finalBlob =
      blob instanceof Blob
        ? blob
        : new Blob([blob as unknown as BlobPart], { type: mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(finalBlob);
    this.activeUrls.add(url);
    return url;
  }

  revoke(url: string): void {
    if (this.activeUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.activeUrls.delete(url);
    }
  }

  revokeAll(): void {
    for (const url of this.activeUrls) {
      URL.revokeObjectURL(url);
    }
    this.activeUrls.clear();
  }
}
