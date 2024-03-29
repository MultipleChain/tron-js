import { Adapter, AdapterState, WalletReadyState } from '@tronweb3/tronwallet-abstract-adapter';
import type { Transaction, SignedTransaction, AdapterName } from '@tronweb3/tronwallet-abstract-adapter';
import { ChainNetwork } from '@tronweb3/tronwallet-abstract-adapter';
import type { WalletConnectWeb3ModalConfig } from '@tronweb3/walletconnect-tron';
import type { SignClientTypes } from '@walletconnect/types';
export declare const WalletConnectWalletName: AdapterName<"WalletConnect">;
export interface WalletConnectAdapterConfig {
    /**
     * Network to use, one of Mainnet,Shasta,Nile
     */
    network: `${ChainNetwork}`;
    /**
     * Options to WalletConnect
     */
    options: SignClientTypes.Options;
    /**
     * QRCodeModalOptions to WalletConnect
     */
    web3ModalConfig?: WalletConnectWeb3ModalConfig;
}
export declare class WalletConnectAdapter extends Adapter {
    name: AdapterName<"WalletConnect">;
    url: string;
    icon: string;
    private _readyState;
    private _state;
    private _connecting;
    private _wallet;
    private _config;
    private _address;
    constructor(config: WalletConnectAdapterConfig);
    get address(): string | null;
    get readyState(): WalletReadyState;
    get state(): AdapterState;
    get connecting(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    signTransaction(transaction: Transaction): Promise<SignedTransaction>;
    signMessage(message: string): Promise<string>;
    private _disconnected;
}
//# sourceMappingURL=adapter.d.ts.map