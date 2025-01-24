import * as vscode from 'vscode';
import * as path from 'path';
import { selectNixEnv } from './core/EnvPicker';
import { initStatusBar, setStatusBar } from './core/StatusBar';
import { autoLoadEnv } from './core/EnvHelper';

let statusBar: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {

	statusBar = initStatusBar(context);
	const log = vscode.window.createOutputChannel("Nix Env Picker", { log: true });

	autoLoadEnv(context, log).then((envPath) => {
		if (envPath !== undefined) {
			setStatusBar(statusBar, `$(beaker) Nix: ${path.basename(envPath)}`);
			log.info(`Auto loaded env: ${envPath}`);
		}else{
			log.info("No env file selected");
		}
	});

	const disposable = vscode.commands.registerCommand('nix-env-picker.selectNixEnv', async () => {
		if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

		statusBar.text = "$(sync~spin) Selecting Nix Env...";
		const workspaceRoot = vscode.workspace.workspaceFolders[0].uri;

		selectNixEnv(workspaceRoot, statusBar, context, log).catch((err) => {
			log.error(err);
			vscode.window.showErrorMessage('Failed to select Nix Env, see output for details');
			statusBar.text = "$(error) Nix Env";
		});
	});

	context.subscriptions.push(disposable);
}


export function deactivate() {
	if (statusBar) {
        statusBar.dispose();
    }
}
