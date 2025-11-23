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
}

export const openRouterService = new OpenRouterService();

