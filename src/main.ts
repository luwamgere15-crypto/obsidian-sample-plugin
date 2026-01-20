import { Editor, MarkdownView, Plugin } from 'obsidian';
import { AutoTitleSettings, DEFAULT_SETTINGS, AutoTitleSettingTab } from "./settings";
import { renameFileCommand } from "./commands/rename";

export default class AutoTitlePlugin extends Plugin {
	settings: AutoTitleSettings;

	async onload() {
		await this.loadSettings();

		// Add command
		this.addCommand({
			id: 'auto-rename',
			name: 'Auto Rename Current File',
            // Using editorCheckCallback to ensure we are in a markdown view and have a file
			editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
				if (view.file) {
                    if (!checking) {
				        renameFileCommand(this, view.file);
                    }
                    return true;
                }
                return false;
			}
		});

		// Add settings tab
		this.addSettingTab(new AutoTitleSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
