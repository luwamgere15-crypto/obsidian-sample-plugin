import { Notice, TFile } from 'obsidian';
import AutoTitlePlugin from '../main';
import { AIService } from '../services/ai';

export async function renameFileCommand(plugin: AutoTitlePlugin, file: TFile) {
    new Notice('Generating title...');

    try {
        const content = await plugin.app.vault.read(file);

        if (!content || content.trim().length === 0) {
            new Notice('File is empty. Cannot generate title.');
            return;
        }

        const aiService = new AIService(plugin.settings);
        const newTitle = await aiService.generateTitle(content);

        if (newTitle) {
            let newPath = '';
            // If parent is not root, include parent path.
            // Note: app.vault.getRoot().path is '/'
            if (file.parent && file.parent.path !== '/') {
                newPath = `${file.parent.path}/${newTitle}.md`;
            } else {
                newPath = `${newTitle}.md`;
            }

            // Check if file exists
            const existingFile = plugin.app.vault.getAbstractFileByPath(newPath);
            if (existingFile) {
                 new Notice(`File '${newTitle}.md' already exists.`);
                 return;
            }

            await plugin.app.fileManager.renameFile(file, newPath);
            new Notice(`Renamed to: ${newTitle}`);
        } else {
            new Notice('Could not generate a title.');
        }

    } catch (error) {
        new Notice('Error generating title. Check console.');
        console.error(error);
    }
}
