import { homedir } from 'os';
import * as path from 'path';
import { sep } from 'path';
import { workspace } from 'vscode';
import { Logger } from './interfaces';

export function expandVariables(value: string, logger: Logger): string {
    if (!value) {
        return '';
    }

    let result = value;

    if (result.includes('${userHome}')) {
        result = result.replace(/\${userHome}/g, homedir());
    }

    if (result.includes('${workspaceFolder}')) {
        const workspaceFolder = workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            result = result.replace(/\${workspaceFolder}/g, workspaceFolder.uri.fsPath);
        }
    }

    if (result.includes('${workspaceFolderBasename}')) {
        const workspaceFolder = workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            result = result.replace(/\${workspaceFolderBasename}/g, workspaceFolder.name);
        }
    }

    if (result.includes('${pathSeparator}') || result.includes('${/}')) {
        result = result.replace(/\${pathSeparator}/g, sep);
        result = result.replace(/\${\/}/g, sep);
    }

    logger.info(`Expanded path: ${result}`);
    return result;
}

export function getRelativePath(filePath: string, basePath: string): string {
    return path.relative(basePath, filePath);
}