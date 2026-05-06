import { requestUrl } from 'obsidian';
import { AutoTitleSettings } from '../settings';

export class AIService {
    private settings: AutoTitleSettings;

    constructor(settings: AutoTitleSettings) {
        this.settings = settings;
    }

    async generateTitle(content: string): Promise<string> {
        if (!this.settings.apiKey) {
            throw new Error('API Key is missing. Please check your settings.');
        }

        const url = this.getApiUrl();
        const body = {
            model: this.settings.model,
            messages: [
                {
                    role: 'system',
                    content: this.settings.prompt
                },
                {
                    role: 'user',
                    content: content.substring(0, 5000) // Truncate content to avoid token limits
                }
            ],
            max_tokens: 1024,
            temperature: 0.7
        };

        console.log('[AutoTitle] Request URL:', url);
        console.log('[AutoTitle] Request body:', JSON.stringify(body, null, 2));

        try {
            const response = await requestUrl({
                url: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.apiKey}`
                },
                body: JSON.stringify(body)
            });

            console.log('[AutoTitle] Response status:', response.status);
            console.log('[AutoTitle] Response headers:', JSON.stringify(response.headers, null, 2));
            console.log('[AutoTitle] Response body:', JSON.stringify(response.json, null, 2));

            if (response.status >= 200 && response.status < 300) {
                const data = response.json;
                if (data.choices && data.choices.length > 0) {
                     const message = data.choices[0].message;
                     let title = (message.content || '').trim();
                     console.log('[AutoTitle] Raw title from AI:', title);
                     if (!title && message.reasoning_content) {
                         console.warn('[AutoTitle] Model returned empty content with reasoning_content. finish_reason:', data.choices[0].finish_reason);
                         throw new Error('Model used all tokens for reasoning. Try increasing max_tokens or use a non-reasoning model.');
                     }
                     if (!title) {
                         throw new Error('AI returned empty content.');
                     }
                     // Basic cleanup - remove quotes if present
                     title = title.replace(/^["']|["']$/g, '');
                     // Remove characters that are illegal in file names
                     title = title.replace(/[\\/:*?"<>|]/g, '');
                     console.log('[AutoTitle] Cleaned title:', title);
                     return title;
                } else {
                     console.error('[AutoTitle] No choices in response. Full response:', JSON.stringify(data, null, 2));
                     throw new Error('No choice returned from AI.');
                }
            } else {
                throw new Error(`API Error: ${response.status}`);
            }

        } catch (error) {
            console.error('[AutoTitle] AI Service Error', error);
            throw error;
        }
    }

    async testConnection(): Promise<boolean> {
        if (!this.settings.apiKey) {
            throw new Error('API Key is missing.');
        }

        const url = this.getApiUrl();
        const body = {
            model: this.settings.model,
            messages: [
                {
                    role: 'user',
                    content: 'Hello, are you there? Reply with "Yes".'
                }
            ],
            max_tokens: 100,
        };

        try {
            const response = await requestUrl({
                url: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.apiKey}`
                },
                body: JSON.stringify(body)
            });

            if (response.status >= 200 && response.status < 300) {
                return true;
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        } catch (error) {
            console.error('AutoTitle: Connection Test Error', error);
            throw error;
        }
    }

    private getApiUrl(): string {
        // Handle trailing slash in apiUrl
        const baseUrl = this.settings.apiUrl.endsWith('/')
            ? this.settings.apiUrl.slice(0, -1)
            : this.settings.apiUrl;

        return `${baseUrl}/chat/completions`;
    }
}
