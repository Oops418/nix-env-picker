import { Uri, commands, window } from 'vscode';
import { Logger, NixEnvironmentFile, UserInterface } from '../helpers/interfaces';

export class VSCodeUI implements UserInterface {
    constructor(private logger: Logger) { }

    public async showEnvFileSelector(files: NixEnvironmentFile[]): Promise<NixEnvironmentFile | undefined> {
        const quickPickItems = files.map(file => ({
            label: file.relativePath,
            file
        }));

        quickPickItems.push({
            label: "Browse...",
            file: { path: "", relativePath: "" }
        });

        const selected = await window.showQuickPick(quickPickItems, {
            placeHolder: 'Select a Nix environment file'
        });

        if (!selected) {
            return undefined;
        }

        if (selected.label === "Browse...") {
            const uri = await this.browsePath();
            if (!uri) {
                return undefined;
            }

            return {
                path: uri.fsPath,
                relativePath: uri.fsPath
            };
        }

        return selected.file;
    }

    public async showErrorMessage(message: string): Promise<void> {
        const selection = await window.showErrorMessage(
            message,
            'Show Details'
        );

        if (selection === 'Show Details') {
            this.logger.show();
        }
    }

    public async showInformationMessage(message: string, ...actions: string[]): Promise<string | undefined> {
        return window.showInformationMessage(message, ...actions);
    }

    public async requestReload(): Promise<void> {
        await commands.executeCommand('workbench.action.reloadWindow');
    }

    public async browsePath(): Promise<Uri | undefined> {
        const result = await window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'Nix Files': ['nix']
            }
        });

        return result?.[0];
    }
}