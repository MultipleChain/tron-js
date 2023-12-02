import { Web3ModalConfig } from '@web3modal/standalone';
import WalletConnectClient from '@walletconnect/sign-client';
import type { SignClientTypes } from '@walletconnect/types';
export type WalletConnectWeb3ModalConfig = Omit<Web3ModalConfig, 'walletConnectVersion' | 'projectId'>;
export interface WalletConnectWalletAdapterConfig {
    network: WalletConnectChainID;
    options: SignClientTypes.Options;
    /**
     * Config for web3Modal constructor.
     * Detailed documentation can be found in WalletConnect page: https://docs.walletconnect.com/2.0/web3modal/options.
     * - `walletConnectVersion` will be ignored and will be set to 2.
     * - `projectId` will be ignored and will be set with `options.projectId`.
     */
    web3ModalConfig?: WalletConnectWeb3ModalConfig;
}
export declare enum WalletConnectChainID {
    Mainnet = "tron:0x2b6653dc",
    Shasta = "tron:0x94a9059e",
    Nile = "tron:0xcd8690dc"
}
export declare enum WalletConnectMethods {
    signTransaction = "tron_signTransaction",
    signMessage = "tron_signMessage"
}
interface WalletConnectWalletInit {
    address: string;
}
export declare class WalletConnectWallet {
    private _client;
    private _session;
    private readonly _network;
    private readonly _options;
    private readonly _web3ModalConfig;
    private web3Modal;
    private address;
    constructor(config: WalletConnectWalletAdapterConfig);
    connect(): Promise<WalletConnectWalletInit>;
    disconnect(): Promise<void>;
    get client(): WalletConnectClient;
    checkConnectStatus(): Promise<WalletConnectWalletInit>;
    signTransaction(transaction: any): Promise<any>;
    signMessage(message: string): Promise<any>;
}
export {};
//# sourceMappingURL=adapter.d.ts.map