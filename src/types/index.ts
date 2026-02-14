export type WalletType = string;

export interface Wallet {
    id: WalletType;
    name: string;
    budget: number;
    avatar_url?: string;
    includedInDivision: boolean;
    created_at?: string;
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
    paymentMethod?: string; // e.g., 'Credit', 'Debit', 'Cash', 'Pix'
}

export interface ExchangeTransaction {
    id: string;
    date: Date;
    originCurrency: string;
    originAmount: number;
    targetAmount: number;
    rate: number;
    targetWallet: WalletType | 'both';
    location?: string; // e.g., 'Wise', 'Western Union', 'Exchange Office'
}

export type PaymentMethod = string;

export interface AppState {
    wallets: Wallet[];
    transactions: Transaction[];
    exchanges: ExchangeTransaction[];
    paymentMethods: PaymentMethod[];
}
