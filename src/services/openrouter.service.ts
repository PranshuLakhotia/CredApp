// OpenRouter API Service for AI Chat
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CertificateData {
  credential_name: string;
  issuer_name: string;
  learner_name: string;
  learner_id: string;
  issued_date: string;
  expiry_date: string;
  credential_type: string;
  skill_tags: string[];
  description: string;
  raw_text: string;
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1/chat/completions';
  private siteUrl: string;
  private siteName: string;

  constructor() {
    // You can set these via environment variables or config
    // Trim the API key to remove any whitespace or newlines
    this.apiKey = (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '').trim();
    this.siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    this.siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'CredApp - Digital Credential Platform';
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenRouter API error');
      }

      return await response.json();
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    systemContext?: string
  ): Promise<string> {
    const messages: ChatMessage[] = [];

    // Add system context if provided
    if (systemContext) {
      messages.push({
        role: 'system',
        content: systemContext,
      });
    }

    // Add conversation history
    messages.push(...conversationHistory);

    // Add user message
    messages.push({
      role: 'user',
      content: message,
    });

    const response = await this.chat({
      model: 'openai/gpt-oss-20b:free', // Changed to a more reliable model
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'No response from AI';
  }

  /**
   * Convert raw OCR extracted text to structured certificate data using AI
   * @param ocrText Raw text extracted from OCR service
   * @returns Structured certificate data
   */
  async convertOCRTextToCertificateData(ocrText: string): Promise<CertificateData> {
    try {
      const prompt = `Analyze this certificate/credential text and extract the following information in STRICT JSON format.
Do not include any additional text, explanations, or markdown formatting - ONLY return the JSON object.

Required JSON structure:
{
  "credential_name": "The name/title of the credential or course",
  "issuer_name": "The organization/institution that issued it",
  "learner_name": "The name of the person who received it",
  "learner_id": "Any ID number or code (certificate ID, learner ID, enrollment ID, etc.)",
  "issued_date": "The date of issuance (format: YYYY-MM-DD if possible)",
  "expiry_date": "The expiration date if mentioned (format: YYYY-MM-DD if possible, or empty string)",
  "credential_type": "Type (e.g., certificate, diploma, degree, badge)",
  "skill_tags": ["Array of relevant skills or topics covered"],
  "description": "Brief description of what this credential represents"
}

Important rules:
- Extract ALL visible information accurately
- If a field is not found, use empty string "" for text fields or [] for arrays
- For learner_id, look for any alphanumeric codes like enrollment IDs, certificate numbers, etc.
- Be precise and extract exactly what you see
- Return ONLY valid JSON, no markdown, no explanations, no additional text

Certificate Text:
${ocrText}`;

      const response = await this.chat({
        model: 'openai/gpt-oss-20b:free', // Using a more capable model for structured extraction
        messages: [
          {
            role: 'system',
            content: 'You are a precise data extraction assistant. You ONLY return valid JSON objects with no additional text or formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more deterministic output
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content || '{}';

      // Clean the response - remove markdown code blocks if present
      let jsonStr = content.trim();

      // Remove markdown code blocks
      if (jsonStr.includes('```json')) {
        const startIdx = jsonStr.indexOf('```json') + 7;
        const endIdx = jsonStr.indexOf('```', startIdx);
        jsonStr = jsonStr.substring(startIdx, endIdx).trim();
      } else if (jsonStr.includes('```')) {
        const startIdx = jsonStr.indexOf('```') + 3;
        const endIdx = jsonStr.indexOf('```', startIdx);
        jsonStr = jsonStr.substring(startIdx, endIdx).trim();
      }

      // Extract JSON object if there's extra text
      if (jsonStr.includes('{')) {
        const startIdx = jsonStr.indexOf('{');
        const endIdx = jsonStr.lastIndexOf('}') + 1;
        jsonStr = jsonStr.substring(startIdx, endIdx);
      }

      const extractedData: CertificateData = JSON.parse(jsonStr);

      // Add the raw text to the result
      extractedData.raw_text = ocrText;

      // Validate and provide defaults for missing fields
      return {
        credential_name: extractedData.credential_name || 'Unknown Certificate',
        issuer_name: extractedData.issuer_name || '',
        learner_name: extractedData.learner_name || '',
        learner_id: extractedData.learner_id || '',
        issued_date: extractedData.issued_date || '',
        expiry_date: extractedData.expiry_date || '',
        credential_type: extractedData.credential_type || 'certificate',
        skill_tags: extractedData.skill_tags || [],
        description: extractedData.description || 'Professional credential certificate',
        raw_text: ocrText
      };

    } catch (error) {
      console.error('Error converting OCR text to certificate data:', error);

      // Return fallback data structure
      return {
        credential_name: 'Certificate',
        issuer_name: '',
        learner_name: '',
        learner_id: '',
        issued_date: '',
        expiry_date: '',
        credential_type: 'certificate',
        skill_tags: [],
        description: 'OCR text conversion failed - manual review required',
        raw_text: ocrText
      };
    }
  }
}

export const openRouterService = new OpenRouterService();

