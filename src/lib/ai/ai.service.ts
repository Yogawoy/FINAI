/**
 * FinAI Gemini AI Service
 * Foundation structure prepared. Full implementation in next milestone.
 */
export class AIService {
  private static apiKey = process.env.GEMINI_API_KEY || '';

  public static isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }
}
