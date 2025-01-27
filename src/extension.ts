import { commands, ExtensionContext } from 'vscode';
import { setupCore } from './utils';

export function activate(context: ExtensionContext) {

	const picker = setupCore(context);

	picker.autoLoadEnv(picker);

	context.subscriptions.push(
		commands.registerCommand('nix-env-picker.selectNixEnv',
			async () => await picker.selectEnvironment()
		)
	);
}


export function deactivate() { }
