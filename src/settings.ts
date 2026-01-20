import { App, PluginSettingTab, Setting } from "obsidian";
import AutoTitlePlugin from "./main";

export interface AutoTitleSettings {
	apiKey: string;
	apiUrl: string;
	model: string;
	prompt: string;
}

export const DEFAULT_SETTINGS: AutoTitleSettings = {
	apiKey: '',
	apiUrl: 'https://api.openai.com/v1',
	model: 'gpt-3.5-turbo',
	prompt: 'Summarize the following text into a short, concise filename (no extension). The filename should be safe for file systems. Provide only the filename.'
}

export class AutoTitleSettingTab extends PluginSettingTab {
	plugin: AutoTitlePlugin;

	constructor(app: App, plugin: AutoTitlePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Your OpenAI API Key (or compatible provider)')
			.addText(text => text
				.setPlaceholder('sk-...')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('API URL')
			.setDesc('Base URL for the API (default: https://api.openai.com/v1)')
			.addText(text => text
				.setPlaceholder('https://api.openai.com/v1')
				.setValue(this.plugin.settings.apiUrl)
				.onChange(async (value) => {
					this.plugin.settings.apiUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Model')
			.setDesc('Model to use (e.g., gpt-3.5-turbo, gpt-4)')
			.addText(text => text
				.setPlaceholder('gpt-3.5-turbo')
				.setValue(this.plugin.settings.model)
				.onChange(async (value) => {
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Prompt')
			.setDesc('The system prompt used to generate the title.')
			.addTextArea(text => text
				.setPlaceholder('Enter prompt...')
				.setValue(this.plugin.settings.prompt)
				.onChange(async (value) => {
					this.plugin.settings.prompt = value;
					await this.plugin.saveSettings();
				}));
	}
}
