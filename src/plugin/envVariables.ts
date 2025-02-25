import { EnvVar, Logger } from '../helpers/interfaces';

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

export function applyEnvironmentVariables(envVars: EnvVar[], logger: Logger): void {
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