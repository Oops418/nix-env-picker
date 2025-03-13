import { Range, Selection, window, workspace } from 'vscode';
import { EnvVar, Logger } from '../helpers/interfaces';
import { CUSTOM_ENV_VARS_KEY } from '../vscode/configuration';

export function parseExportedVars(output: string, logger: Logger): EnvVar[] {
    const regex = /declare -x ([A-Za-z0-9_]+)="((?:\\.|[^"\\])*)"/g;
    const vars: EnvVar[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(output)) !== null) {
        vars.push({ name: match[1], value: match[2] });
    }

    logger.info(`Parsed ${vars.length} environment variables`);
    return vars;
}



export function applyEnvVars(envVars: EnvVar[], logger: Logger): void {
    try {
        envVars.forEach(({ name, value }) => {
            process.env[name] = value;
        });
        logger.info(`Applied ${envVars.length} environment variables`);
    } catch (error) {
        logger.error('Failed to apply environment variables');
        logger.error(error instanceof Error ? error.message : String(error));
        throw error;
    }
}

export async function promptCustomEnvVars(workspaceSettingsUri: string, logger: Logger): Promise<void> {
    const settingsDoc = await workspace.openTextDocument(workspaceSettingsUri);

    if (!settingsDoc.fileName) {
        throw new Error('Failed to open settings.json file');
    }

    logger.info(`Settings document: ${settingsDoc.uri.fsPath}`);
    const settingsText = settingsDoc.getText();

    const editor = await window.showTextDocument(settingsDoc);

    const keyPattern = new RegExp(`"${CUSTOM_ENV_VARS_KEY}"\\s*:`);
    const match = keyPattern.exec(settingsText);

    if (match) {
        const pos = settingsDoc.positionAt(match.index);
        editor.selection = new Selection(pos, pos);
        editor.revealRange(new Range(pos, pos));
    }
}