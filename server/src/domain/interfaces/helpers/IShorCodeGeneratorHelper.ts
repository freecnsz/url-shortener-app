export interface IShortCodeGeneratorHelper {
    generateShortCode(date?: Date): Promise<string>;
    generateBulkShortCodes(count: number): Promise<string[]>;
    validateShortCode(code: string): boolean;
}