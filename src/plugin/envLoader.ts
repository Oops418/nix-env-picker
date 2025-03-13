import { workspace } from 'vscode';
import { EnvVar, EnvVariables, Logger } from '../helpers/interfaces';
import { executeCommandSync } from '../helpers/process';
import { CUSTOM_ENV_VARS_KEY } from '../vscode/configuration';
import { detectNixFormat, getNixCommand } from './envDetector';
import { parseExportedVars } from './envVariables';

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

