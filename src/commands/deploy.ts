import { getStarknetConfig } from '../utils/env';
import { Account, RpcProvider, json, Contract } from 'starknet';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const NETWORK_URLS: Record<string, string> = {
    testnet: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8',
    mainnet: 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8',
};

export async function deployContract(contractSierraPath: string, contractCasmPath: string) {
    try {
        // 1. Cargar configuración desde .env
        const { privateKey, network } = getStarknetConfig();
        const accountAddress = process.env.STARKNET_ACCOUNT_ADDRESS;
        if (!privateKey) {
            throw new Error(chalk.red('❌ Clave privada no encontrada en .env'));
        }
        if (!accountAddress) {
            throw new Error(chalk.red('❌ Dirección de cuenta no encontrada en .env (STARKNET_ACCOUNT_ADDRESS)'));
        }
        const nodeUrl = NETWORK_URLS[network || 'testnet'];
        if (!nodeUrl) {
            throw new Error(chalk.red(`❌ Red no soportada: ${network}`));
        }

        // 2. Configurar proveedor y cuenta
        const provider = new RpcProvider({ nodeUrl });
        const account = new Account(provider, accountAddress, privateKey);

        console.log(chalk.blue(`🔗 Conectado a ${network} con cuenta: ${account.address}`));

        // 3. Leer y parsear contratos compilados
        const compiledSierra = json.parse(fs.readFileSync(path.resolve(contractSierraPath), 'utf-8'));
        const compiledCasm = json.parse(fs.readFileSync(path.resolve(contractCasmPath), 'utf-8'));

        // 4. Declarar y desplegar contrato
        const deployResponse = await account.declareAndDeploy({
            contract: compiledSierra,
            casm: compiledCasm,
        });

        const contractAddress = deployResponse.deploy.contract_address;
        const classHash = deployResponse.declare.class_hash;
        const txHash = deployResponse.deploy.transaction_hash;

        // 5. Conectar contrato
        const contract = new Contract(compiledSierra.abi, contractAddress, provider);

        console.log(chalk.green(`✅ Contrato desplegado en: ${contractAddress}`));
        console.log(chalk.yellow(`📜 TX Hash: ${txHash}`));
        console.log(chalk.cyan(`🔑 Class Hash: ${classHash}`));
        console.log(chalk.magenta(`ABI cargada: ${!!contract.abi}`));

    } catch (error: any) {
        console.error(chalk.red(`❌ Error en despliegue: ${error.message}`));
        process.exit(1);
    }
} 