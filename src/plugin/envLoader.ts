import { EnvVar, Logger } from '../helpers/interfaces';
import { executeCommand, executeCommandSync } from '../helpers/process';
import { detectNixFormat, getNixCommand } from './envDetector';
import { parseExportedVars } from './envVariables';

export async function loadEnvironmentAsync(
    envPath: string,
    logger: Logger
): Promise<EnvVar[]> {
    try {
        const format = detectNixFormat(envPath, logger);
        const cmd = getNixCommand(envPath, format);

        const output = await executeCommand(cmd, logger);
        return parseExportedVars(output, logger);
    } catch (error) {
        logger.error(`Failed to load environment from ${envPath}`);
        throw error;
    }
}

export function loadEnvironmentSync(
    envPath: string,
    logger: Logger
): EnvVar[] {
    try {
        const format = detectNixFormat(envPath, logger);
        const cmd = getNixCommand(envPath, format);

        const output = executeCommandSync(cmd, logger);
        return parseExportedVars(output, logger);
    } catch (error) {
        logger.error(`Failed to load environment synchronously from ${envPath}`);
        throw error;
    }
}