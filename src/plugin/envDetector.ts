import * as fs from 'fs';
import * as path from 'path';
import { Logger, NixFormat } from '../helpers/interfaces';

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

