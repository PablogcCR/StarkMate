declare namespace NodeJS {
    interface ProcessEnv {
        STARKNET_PRIVATE_KEY: string;
        STARKNET_NETWORK?: 'testnet' | 'mainnet';
    }
} 