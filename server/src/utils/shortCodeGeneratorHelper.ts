import { createHash } from "crypto";
import { IShortCodeGeneratorHelper } from "../domain/interfaces/helpers/IShorCodeGeneratorHelper";

export class shortCodeGeneratorHelper implements IShortCodeGeneratorHelper {
  private sequenceNumber: number = 0;
  private readonly secret: string;

  // Base58 alphabet (excludes confusing characters: 0, O, I, l)
  private readonly BASE58_ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  constructor() {
    this.secret = process.env.SHORT_CODE_SECRET || "default-secret-change-this";

    if (!process.env.SHORT_CODE_SECRET) {
      console.warn("SHORT_CODE_SECRET not found in environment variables");
    }
  }

  /**
   * Generate secure short code using hash-based approach
   */
  generateShortCode(date: Date = new Date()): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Increment sequence for uniqueness
        this.sequenceNumber = (this.sequenceNumber + 1) % 1000000;

        // Create hash input with sequence + timestamp + secret
        const timestamp = date.getTime();
        const hashInput = `${this.sequenceNumber}-${timestamp}-${this.secret}`;

        // Generate SHA-256 hash
        const hash = createHash("sha256").update(hashInput).digest();

        // Convert to Base58 and take first 6 characters
        const shortCode = this.toBase58(hash).substring(0, 6);

        resolve(shortCode);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        reject(new Error(`Short code generation failed: ${errorMessage}`));
      }
    });
  }

  /**
   * Generate multiple codes for Redis pool
   */
  async generateBulkShortCodes(count: number): Promise<string[]> {
    const promises: Promise<string>[] = [];

    for (let i = 0; i < count; i++) {
      // Use slightly different timestamp for each code
      const date = new Date(Date.now() + i);
      promises.push(this.generateShortCode(date));
    }

    return Promise.all(promises);
  }

  /**
   * Convert buffer to Base58 string
   */
  private toBase58(buffer: Buffer): string {
    let result = "";
    let num = BigInt("0x" + buffer.toString("hex"));

    const base = BigInt(58);
    while (num > 0n) {
      const remainder = Number(num % base);
      result = this.BASE58_ALPHABET[remainder] + result;
      num = num / base;
    }

    return result || this.BASE58_ALPHABET[0];
  }

  /**
   * Validate short code format
   */
  validateShortCode(code: string): boolean {
    if (!code || code.length !== 6) {
      return false;
    }

    return code.split("").every((char) => this.BASE58_ALPHABET.includes(char));
  }
}
