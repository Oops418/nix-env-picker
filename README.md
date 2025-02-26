<div align="center">
    <h1>Nix Env Picker</h1>
    <p>
        <b>Development environment switcher for Nix shells and flakes</b>
    </p>
    <p>
        <a href="https://code.visualstudio.com/api"><img src="https://img.shields.io/badge/VSCode-Developer-blue?logo=Safari" alt="Website"/></a>
    </p>
    <p>
        <a href="#Overview">Overview</a> •
        <a href="#Getting-Started">Getting Started</a> •
        <a href="#Acknowledgements">Acknowledgements</a>
    </p>
</div>

## Overview

Nix Env Picker is a VS Code extension that simplifies switching between different Nix-based development environments. It automatically applies environment variables from Nix shells and flakes directly into your VS Code.

## Features

- **Auto-load environments** on workspace startup
- **Seamless integration** of environment variables into VS Code
- **Easy selection** between multiple Nix environment files in your workspace
- **Status bar indicator** showing current environment status

## Getting Started

### Installation

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "Nix Env Picker"
4. Click Install

### Usage

1. Open your project in VS Code
2. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) or click the status bar indicator
![select env](resources/usage-select.png)
3. Run `Nix Env Picker: Select Env File`
4. Choose your Nix environment file from the list
5. Reload window when prompted

### Configuration

The settings to your `.vscode/settings.json`:

```json
{
  "nixEnvPicker.envFile": "${workspaceFolder}/path/to/nix-env-file"
}
```

#### Supported Path Variables

| Path Variable              | Description                              |
|----------------------------|------------------------------------------|
| ${workspaceFolder}         | The path of the workspace folder         |
| ${workspaceFolderBasename} | The name of the workspace folder         |
| ${userHome}               | The home directory of the current user   |
| ${pathSeparator} or ${/}   | The platform-specific path separator     |

## Important Notes

When using Nix Env Picker, please be aware of the following:

- **Nix File Requirements**:
  - Flake files must be named `flake.nix` and include proper outputs
  - Shell files must include `mkShell` in their definition

- **First-time Experience**:
  - Initial environment setup may take several minutes to download environment dependencies
  - **Tip**: Running `nix develop` or `nix-shell` directly in terminal first can pre-download dependencies

## Roadmap

- Support for custom command arguments
- Automatic terminal environment activation

## Acknowledgements

Special thanks to [nix-env-selector](https://github.com/arrterian/nix-env-selector) for the inspiration behind this project. This extension builds upon the ideas presented in nix-env-selector while offering an alternative implementation.
