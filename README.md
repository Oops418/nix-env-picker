<div align="center">
    <h1>Nix Env Picker</h1>
    <p>
        <b>Development environment switcher for Nix shells and flakes</b>
    </p>
    <p align="center">
        <a href="https://code.visualstudio.com/api"><img src="https://img.shields.io/badge/VSCode-Developer-blue?logo=Safari" alt="Website"/></a>
    </p>
    <p align="center">
    <a href="#About">About</a> •
    <a href="#Integration">Integration</a> •
    <a href="#Usage">Usage</a> •
    <a href="#Acknowledgements">Acknowledgements</a>
</p>  
</div>

## About

- Automatically loads saved environment configurations on workspace startup

- Switch between different development environments with a single click

## Features

- Automatically loads saved environment configurations on workspace startup
- Integrates environment variables from Nix configurations into VS Code

## Usage

1. Install the extension in VS Code
2. Open the command palette and run the `Nix Env Picker: Set Nix Environment` command
![select env](resources/usage-select.png)
3. Select the desired environment from the list and reload the workspace according to the prompt

> For Flakes: Please make sure the name of the flake is "flake.nix"
> 
> For Shells: Please make sure the content of the file is a valid Nix expression
> 
> For both: recommended to use the `nix develop` or `nix-shell` command to enter the environment in the terminal for the first time to test the environment file and download dependencies

## Extension Settings

- `nixEnvPicker.envFile`: Specifies the path to the Nix environment file
  - You can specify the path to the Nix environment file in the .vscode/settings.json file or reassign the value using command palette

```json
{
    "nixEnvPicker.envFile": "path/to/nix-env-file"
}
```

## Known Issues

- When using a Nix environment file for **the first time**, it may take several minutes to download dependencies. During this initial setup, VS Code might appear unresponsive until the download completes

## Release Notes

### 0.0.1

Initial release of Nix Env Picker

## TODO

1. add more log information for debugging or checking the status of the extension
2. support custom command arguments for entering the environment
3. auto detect the environment file in the workspace
4. enter the environment automatically in the terminal after selecting the environment
