export const getStarknetConfig = () => ({
    privateKey: process.env.STARKNET_PRIVATE_KEY,
    network: process.env.STARKNET_NETWORK || 'testnet',
}); 