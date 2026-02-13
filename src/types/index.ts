export type WalletType = string;

export interface Wallet {
    id: WalletType;
    name: string;
    budget: number;
}

export type Category = string;

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: Date;
    category: Category;
    payer: WalletType;
    isShared: boolean;
}

export interface ExchangeTransaction {
    id: string;
    date: Date;
    originCurrency: string;
    originAmount: number;
    targetAmount: number;
    rate: number;
    targetWallet: WalletType | 'both';
}

export interface AppState {
    wallets: Wallet[];
    transactions: Transaction[];
    exchanges: ExchangeTransaction[];
}
