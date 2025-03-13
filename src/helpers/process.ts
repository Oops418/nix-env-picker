import { exec, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { workspace } from 'vscode';
import { EnvVar, EnvVariables } from '../helpers/interfaces';
import { CUSTOM_ENV_VARS_KEY } from '../vscode/configuration';
import { Logger, NixEnvironmentFile, NixFormat } from './interfaces';

export const execAsync = promisify(exec);

export async function executeCommand(cmd: string, logger: Logger): Promise<string> {
    logger.info(`Executing command: ${cmd}`);
    try {
        const { stdout } = await execAsync(cmd);
        return stdout;
    } catch (error) {
        logger.error(`Error executing command: ${cmd}`);
        logger.error(error instanceof Error ? error.message : String(error));
        throw error;
    }
}

export function executeCommandSync(cmd: string, logger: Logger): string {
    logger.info(`Executing command synchronously: ${cmd}`);
    try {
        const output = execSync(cmd).toString();
        return output;
    } catch (error) {
        logger.error(`Error executing command synchronously: ${cmd}`);
        logger.error(error instanceof Error ? error.message : String(error));
        throw error;
    }
}

export function loadEnvironmentSync(
    envPath: string,
    logger: Logger
): EnvVar[] {
    try {
        if (!envPath) {
            logger.info('No environment path provided, continuing with custom environment variables');
            return processCustomEnvVars([], logger);
        }

        const format = detectNixFormat(envPath, logger);
        const cmd = getNixCommand(envPath, format);

        const output = executeCommandSync(cmd, logger);
        const envVars = parseExportedVars(output, logger);
        return processCustomEnvVars(envVars, logger);
    } catch (error) {
        logger.error(`Failed to load environment synchronously from ${envPath}`);
        throw error;
    }
}

export async function findNixFiles(logger: Logger): Promise<NixEnvironmentFile[]> {
    try {
        if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
            logger.error('No workspace folder open');
            throw new Error('No workspace folder open');
        }

        const workspaceRoot = workspace.workspaceFolders[0].uri.fsPath;
        const nixFiles = await workspace.findFiles('*.nix', null);

        return nixFiles.map(file => ({
            name: path.relative(workspaceRoot, file.fsPath),
            path: file.fsPath,
            relativePath: "${workspaceFolder}${/}" + path.relative(workspaceRoot, file.fsPath)
        }));
    } catch (error) {
        logger.error('Error finding Nix files in workspace');
        logger.error(error instanceof Error ? error.message : String(error));
        throw error;
    }
}

export function detectNixFormat(filePath: string, logger: Logger): NixFormat {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');

        if (path.basename(filePath) === "flake.nix" && fileContent.includes('outputs')) {
            logger.info(`Detected Nix format: FLAKE for ${filePath}`);
            return NixFormat.FLAKE;
        }

        if (fileContent.includes('mkShell')) {
            logger.info(`Detected Nix format: PURE for ${filePath}`);
            return NixFormat.PURE;
        }

        logger.info(`No supported Nix format detected for ${filePath}`);
        return NixFormat.NONE;
    } catch (error) {
        logger.error(`Failed to detect Nix format for file at ${filePath}`);
        logger.error(error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to detect Nix format: ${error}`);
    }
}

export function getNixCommand(nixPath: string, format: NixFormat): string {
    if (!nixPath) {
        throw new Error('Nix environment file path is invalid');
    }

    switch (format) {
        case NixFormat.FLAKE:
            return `nix develop "${path.dirname(nixPath)}" --command bash -c "export"`;
        case NixFormat.PURE:
            return `nix-shell "${nixPath}" --run export`;
        case NixFormat.NONE:
        default:
            throw new Error('Unsupported Nix format');
    }
}

export function getTerminalAutoActivateCommand(nixPath: string, format: NixFormat): string {
    if (!nixPath) {
        throw new Error('Nix environment file path is invalid');
    }

    switch (format) {
        case NixFormat.FLAKE:
            return `nix develop "${path.dirname(nixPath)}"`;
        case NixFormat.PURE:
            return `nix-shell "${nixPath}"`;
        case NixFormat.NONE:
        default:
            return '';
    }
}

export function processCustomEnvVars(envVars: EnvVar[], logger: Logger): EnvVar[] {
    try {
        const config = workspace.getConfiguration();
        const customEnvVars = config.get(CUSTOM_ENV_VARS_KEY);

        if (!customEnvVars) {
            logger.info(`No custom environment variables found for ${CUSTOM_ENV_VARS_KEY}`);
            return envVars;
        }

        const { set, unset } = customEnvVars as EnvVariables;

        for (const [name, value] of Object.entries(set)) {
            const existingIndex = envVars.findIndex(env => env.name === name);
            existingIndex !== -1 ? envVars[existingIndex].value = value : envVars.push({ name, value });
        }

        if (unset && unset.length > 0) {
            const initialLength = envVars.length;
            const removedNames: string[] = [];
            const unsetSet = new Set(unset);

            envVars = envVars.filter(env => {
                if (unsetSet.has(env.name)) {
                    removedNames.push(env.name);
                    return false;
                }
                return true;
            });
            const removedCount = initialLength - envVars.length;

            if (removedCount > 0) {
                logger.info(`Removed environment variables: ${removedNames.join(', ')}`);
            }
        }

        return envVars;
    } catch (error) {
        logger.error(`Error processing custom environment variables: ${error instanceof Error ? error.message : String(error)}`);
        return envVars;
    }
}

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

