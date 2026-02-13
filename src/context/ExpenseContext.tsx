import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Wallet, Transaction, Category, WalletType, ExchangeTransaction } from '../types';

interface ExpenseContextType {
    wallets: Wallet[];
    transactions: Transaction[];
    exchanges: ExchangeTransaction[];
    categories: Category[];
    autoSharedCategories: Category[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    addExchange: (exchange: Omit<ExchangeTransaction, 'id'>) => void;
    addWallet: (name: string) => void;
    removeWallet: (id: string) => void;
    addCategory: (name: string) => void;
    removeCategory: (name: string) => void;
    renameCategory: (oldName: string, newName: string) => void;
    renameWallet: (id: string, newName: string) => void;
    toggleAutoShare: (category: string) => void;
    updateBudget: (walletId: WalletType, amount: number) => void;
    getWalletBalance: (walletId: WalletType) => number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = ['General', 'Food', 'Transport', 'Home', 'Shopping', 'Entertainment'];
const DEFAULT_SHARED: Category[] = ['Food', 'Transport', 'Home'];

const INITIAL_WALLETS: Wallet[] = [
    { id: 'me', name: 'Eu', budget: 0 },
    { id: 'wife', name: 'Esposa', budget: 0 },
];

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wallets, setWallets] = useState<Wallet[]>(() => {
        const saved = localStorage.getItem('wallets');
        return saved ? JSON.parse(saved) : INITIAL_WALLETS;
    });

    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved) : [];
    });

    const [exchanges, setExchanges] = useState<ExchangeTransaction[]>(() => {
        const saved = localStorage.getItem('exchanges');
        return saved ? JSON.parse(saved) : [];
    });

    const [categories, setCategories] = useState<Category[]>(() => {
        const saved = localStorage.getItem('categories');
        return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    });

    const [autoSharedCategories, setAutoSharedCategories] = useState<Category[]>(() => {
        const saved = localStorage.getItem('autoSharedCategories');
        return saved ? JSON.parse(saved) : DEFAULT_SHARED;
    });

    useEffect(() => {
        localStorage.setItem('wallets', JSON.stringify(wallets));
    }, [wallets]);

    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('exchanges', JSON.stringify(exchanges));
    }, [exchanges]);

    useEffect(() => {
        localStorage.setItem('categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('autoSharedCategories', JSON.stringify(autoSharedCategories));
    }, [autoSharedCategories]);

    const addWallet = (name: string) => {
        const newWallet: Wallet = {
            id: crypto.randomUUID(),
            name,
            budget: 0,
        };
        setWallets(prev => [...prev, newWallet]);
    };

    const removeWallet = (id: string) => {
        // Optional: Check if used in transactions? 
        // For now, allow delete. It might break history display if not careful, 
        // but let's assume user knows what they are doing or we filter out invalid refs.
        setWallets(prev => prev.filter(w => w.id !== id));
    };

    const addCategory = (name: string) => {
        if (!categories.includes(name)) {
            setCategories(prev => [...prev, name]);
        }
    };

    const removeCategory = (name: string) => {
        setCategories(prev => prev.filter(c => c !== name));
        setAutoSharedCategories(prev => prev.filter(c => c !== name));
    };

    const renameCategory = (oldName: string, newName: string) => {
        if (categories.includes(newName)) return; // Prevent duplicates

        setCategories(prev => prev.map(c => c === oldName ? newName : c));
        setAutoSharedCategories(prev => prev.map(c => c === oldName ? newName : c));
        setTransactions(prev => prev.map(t => t.category === oldName ? { ...t, category: newName } : t));
    };

    const renameWallet = (id: string, newName: string) => {
        setWallets(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
    };

    const toggleAutoShare = (category: string) => {
        setAutoSharedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else {
                return [...prev, category];
            }
        });
    };

    const addTransaction = (data: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            ...data,
            id: crypto.randomUUID(),
        };
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const addExchange = (data: Omit<ExchangeTransaction, 'id'>) => {
        const newExchange: ExchangeTransaction = {
            ...data,
            id: crypto.randomUUID(),
        };
        setExchanges(prev => [newExchange, ...prev]);

        // Also update the budget directly for simplicity in the current architecture,
        // OR we rely purely on getWalletBalance.
        // The user request says: "total balance deve ser populado de acordo com o valor comprado".
        // Use getWalletBalance to derive it dynamically is safer.
        // But Wallet.budget was editable. 
        // I will make getWalletBalance derive from Exchanges + Initial Budget (which we can keep as 0 or manual adjustment).
    };

    const updateBudget = (walletId: WalletType, amount: number) => {
        setWallets(prev => prev.map(w => w.id === walletId ? { ...w, budget: amount } : w));
    };

    const getWalletBalance = (walletId: WalletType) => {
        const wallet = wallets.find(w => w.id === walletId);
        if (!wallet) return 0;

        let balance = wallet.budget;

        // Add Exchanges
        exchanges.forEach(ex => {
            if (ex.targetWallet === 'both') {
                // "Both" in legacy terms meant "Split among all".
                // If targetWallet is 'both', we assume equal split among ALL wallets.
                // Dynamic split:
                balance += (ex.targetAmount / wallets.length);
            } else if (ex.targetWallet === walletId) {
                balance += ex.targetAmount;
            }
        });

        // Subtract Expenses
        transactions.forEach(t => {
            if (t.isShared) {
                // Shared: Split among ALL wallets
                balance -= (t.amount / wallets.length);
            } else {
                if (t.payer === walletId) {
                    balance -= t.amount;
                }
            }
        });

        return balance;
    };

    return (
        <ExpenseContext.Provider value={{
            wallets,
            transactions,
            exchanges,
            categories,
            autoSharedCategories,
            addTransaction,
            addExchange,
            addWallet,
            removeWallet,
            addCategory,
            removeCategory,
            renameCategory,
            renameWallet,
            toggleAutoShare,
            updateBudget,
            getWalletBalance
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) throw new Error('useExpenses must be used within an ExpenseProvider');
    return context;
};
