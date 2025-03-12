import path from 'path';
import { TextDocument, Uri, commands, window, workspace } from 'vscode';
import { Logger, NixEnvironmentFile, UserInterface } from '../helpers/interfaces';

export class VSCodeUI implements UserInterface {
    constructor(private logger: Logger) { }

    public async showEnvFileSelector(files: NixEnvironmentFile[]): Promise<NixEnvironmentFile | undefined> {
        const quickPickItems = files.map(file => ({
            label: file.name,
            file
        }));

        quickPickItems.push({
            label: "Browse...",
            file: { name: "", path: "", relativePath: "" }
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

            const workspaceFolder = workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder open');
            }

            return {
                name: path.relative(workspaceFolder.uri.fsPath, uri.fsPath),
                path: uri.fsPath,
                relativePath: "${workspaceFolder}${/}" + path.relative(workspaceFolder.uri.fsPath, uri.fsPath)
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

    public async saveListener(filePath: string): Promise<void> {
        const saveListener = workspace.onDidSaveTextDocument(async (document: TextDocument) => {
            if (document.uri.fsPath === filePath) {
                const selection = await this.showInformationMessage(
                    'Settings saved. You need to reload VSCode for the changes to take effect.',
                    'Reload Window'
                );

                if (selection === 'Reload Window') {
                    await this.requestReload();
                }

                if (saveListener) {
                    saveListener.dispose();
                }
            }
        });
    }
}