import { ExtensionContext } from 'vscode';
import { activate as activateExtension } from './vscode/activation';

export function activate(context: ExtensionContext) {
	activateExtension(context);
}

export function deactivate() { }