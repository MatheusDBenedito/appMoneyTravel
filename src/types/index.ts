export type WalletType = string;

export interface Wallet {
    id: WalletType;
    name: string;
    budget: number;
    avatar_url?: string;
    includedInDivision: boolean;
    created_at?: string;
    trip_id?: string;
}

export interface Trip {
    id: string;
    name: string;
    created_at: string;
    user_id?: string;
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
    tax?: number;
    type: 'expense' | 'income';
    trip_id?: string;
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
    trip_id?: string;
}

export type PaymentMethod = string;

export interface AppState {
    wallets: Wallet[];
    transactions: Transaction[];
    exchanges: ExchangeTransaction[];
    paymentMethods: PaymentMethod[];
    trips: Trip[];
    currentTripId: string | null;
}
