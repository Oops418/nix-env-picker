import {Uri, StatusBarItem, ExtensionContext, LogOutputChannel, workspace, window, commands} from 'vscode';
import * as path from 'path';
import { setStatusBar } from './StatusBar';
import { loadEnv, loadEnvWarpper } from './EnvHelper';
import { info } from 'console';

export async function selectNixEnv(workspaceRoot: Uri, statusBar: StatusBarItem, context: ExtensionContext, log: LogOutputChannel): Promise<void> {
    try {
        const nixFiles = await workspace.findFiles('*.nix', null);
        const nixFileItems = nixFiles.map(file => ({
            label: path.relative(workspaceRoot.fsPath, file.fsPath),
            fullPath: file.fsPath
        }));
        nixFileItems.push({
            label: "Browse...",
            fullPath: ""
        });
        log.info(`Found ${nixFileItems.length} .nix files`);
            
        const selected = await window.showQuickPick(nixFileItems, {
            placeHolder: 'Select a env file'
        });

        if (selected) {
            if (selected.label === "Browse...") {
                info('Browse selected');
                const result = await window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                });
                if (result && result[0]) {
                    await loadEnvWarpper(result[0].fsPath, context, statusBar, log);
                } else {
                    window.showInformationMessage('No file selected');
					setStatusBar(statusBar, "$(beaker) Nix Env");
                }
            } else {
                log.info(`Selected ${selected.label}`);
                await loadEnvWarpper(selected.fullPath, context, statusBar, log);
            }
        } else {
            setStatusBar(statusBar, "$(beaker) Nix Env");
        }
    } catch (error) {
        window.showErrorMessage('Error : ' + error);
        log.error('Error : ' + error);
        setStatusBar(statusBar, "$(error) Nix Env");
    }
}