import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { deployContract } from './commands/deploy';

const program = new Command();

program
    .name('StarkMate')
    .description(chalk.cyanBright('Bienvenido a StarkMate CLI - Tu compañero para interactuar con StarkNet'))
    .version('1.0.0');

program
    .command('init')
    .description('Inicializa un nuevo proyecto StarkNet')
    .action(() => {
        const baseDir = process.cwd();
        const contractsDir = path.join(baseDir, 'contracts');
        const scriptsDir = path.join(baseDir, 'scripts');
        try {
            if (!fs.existsSync(contractsDir)) fs.mkdirSync(contractsDir);
            if (!fs.existsSync(scriptsDir)) fs.mkdirSync(scriptsDir);
            // Copiar contrato Cairo
            fs.copyFileSync(
                path.join(__dirname, 'templates', 'contract.cairo'),
                path.join(contractsDir, 'contract.cairo')
            );
            // Copiar script de despliegue
            fs.copyFileSync(
                path.join(__dirname, 'templates', 'deploy.ts'),
                path.join(scriptsDir, 'deploy.ts')
            );
            console.log(chalk.green('Proyecto StarkNet inicializado con éxito. Archivos de ejemplo creados.'));
        } catch (err) {
            console.error(chalk.red('Error al inicializar el proyecto:'), err);
        }
    });

program
    .command('deploy <base-path>')
    .description('Despliega un contrato compilado (Sierra y Casm)')
    .action((basePath: string) => {
        const sierraPath = `${basePath}.sierra.json`;
        const casmPath = `${basePath}.casm.json`;
        deployContract(sierraPath, casmPath);
    });

program
    .command('faucet <address>')
    .description('Solicita fondos de prueba (faucet)')
    .action(async (address: string) => {
        const faucetUrl = 'https://faucet.goerli.starknet.io/';
        try {
            const response = await axios.post(faucetUrl, { address });
            if (response.status === 200) {
                console.log(chalk.green('Fondos solicitados exitosamente para la dirección:'), chalk.yellow(address));
            } else {
                console.log(chalk.red('No se pudo solicitar fondos. Respuesta del faucet:'), response.statusText);
            }
        } catch (err: any) {
            console.error(chalk.red('Error al solicitar fondos del faucet:'), err.response?.data || err.message);
        }
    });

program.parse(process.argv); 