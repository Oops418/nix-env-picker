import * as vscode from 'vscode';

export function initStatusBar(context: vscode.ExtensionContext) {
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(beaker) Nix Env";
    statusBarItem.tooltip = "Click to select Nix environment";
    statusBarItem.command = 'nix-env-picker.selectNixEnv';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    return statusBarItem;
}

export function setStatusBar(statusBarItem: vscode.StatusBarItem, text: string) {
    statusBarItem.text = text;
}