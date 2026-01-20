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
            max_tokens: 50,
            temperature: 0.7
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
                const data = response.json;
                if (data.choices && data.choices.length > 0) {
                     let title = data.choices[0].message.content.trim();
                     // Basic cleanup - remove quotes if present
                     title = title.replace(/^["']|["']$/g, '');
                     // Remove characters that are illegal in file names
                     title = title.replace(/[\\/:*?"<>|]/g, '');
                     return title;
                } else {
                     throw new Error('No choice returned from AI.');
                }
            } else {
                throw new Error(`API Error: ${response.status}`);
            }

        } catch (error) {
            console.error('AutoTitle: AI Service Error', error);
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
            max_tokens: 5,
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
