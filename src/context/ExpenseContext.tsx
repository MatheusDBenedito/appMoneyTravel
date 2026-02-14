import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Wallet, Transaction, Category, WalletType, ExchangeTransaction } from '../types';
import { supabase } from '../lib/supabase';

interface ExpenseContextType {
    wallets: Wallet[];
    transactions: Transaction[];
    exchanges: ExchangeTransaction[];
    categories: Category[];
    autoSharedCategories: Category[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    removeTransaction: (id: string) => Promise<void>;
    addExchange: (exchange: Omit<ExchangeTransaction, 'id'>) => Promise<void>;
    addWallet: (name: string) => Promise<void>;
    removeWallet: (id: string) => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    removeCategory: (name: string) => Promise<void>;
    renameCategory: (oldName: string, newName: string) => Promise<void>;
    renameWallet: (id: string, newName: string) => Promise<void>;
    toggleAutoShare: (category: string) => Promise<void>;
    updateBudget: (walletId: WalletType, amount: number) => Promise<void>;
    getWalletBalance: (walletId: WalletType) => number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [exchanges, setExchanges] = useState<ExchangeTransaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [autoSharedCategories, setAutoSharedCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data: walletsData } = await supabase.from('wallets').select('*').order('created_at', { ascending: true });
            if (walletsData) setWallets(walletsData);

            const { data: transactionsData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
            if (transactionsData) {
                const mappedTransactions = transactionsData.map((t: any) => ({
                    ...t,
                    isShared: t.is_shared
                }));
                setTransactions(mappedTransactions);
            }

            const { data: exchangesData } = await supabase.from('exchanges').select('*').order('date', { ascending: false });
            if (exchangesData) {
                const mappedExchanges = exchangesData.map((e: any) => ({
                    ...e,
                    originCurrency: e.origin_currency,
                    originAmount: e.origin_amount,
                    targetAmount: e.target_amount,
                    targetWallet: e.target_wallet
                }));
                setExchanges(mappedExchanges);
            }

            const { data: categoriesData } = await supabase.from('categories').select('name');
            if (categoriesData) setCategories(categoriesData.map((c: any) => c.name));

            const { data: sharedData } = await supabase.from('auto_shared_categories').select('category_name');
            if (sharedData) setAutoSharedCategories(sharedData.map((s: any) => s.category_name));

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const addWallet = async (name: string) => {
        const { data, error } = await supabase.from('wallets').insert([{ name, budget: 0 }]).select().single();
        if (data && !error) {
            setWallets(prev => [...prev, data]);
        }
    };

    const removeWallet = async (id: string) => {
        const { error } = await supabase.from('wallets').delete().eq('id', id);
        if (!error) {
            setWallets(prev => prev.filter(w => w.id !== id));
        }
    };

    const renameWallet = async (id: string, newName: string) => {
        const { error } = await supabase.from('wallets').update({ name: newName }).eq('id', id);
        if (!error) {
            setWallets(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
        }
    };

    const addCategory = async (name: string) => {
        if (categories.includes(name)) return;
        const { error } = await supabase.from('categories').insert([{ name }]);
        if (!error) {
            setCategories(prev => [...prev, name]);
        }
    };

    const removeCategory = async (name: string) => {
        const { error } = await supabase.from('categories').delete().eq('name', name);
        if (!error) {
            setCategories(prev => prev.filter(c => c !== name));
            setAutoSharedCategories(prev => prev.filter(c => c !== name));
        }
    };

    const renameCategory = async (oldName: string, newName: string) => {
        if (categories.includes(newName)) return;

        // 1. Create new category
        const { error: createError } = await supabase.from('categories').insert([{ name: newName }]);
        if (createError) return;

        // 2. Update transactions
        await supabase.from('transactions').update({ category: newName }).eq('category', oldName);

        // 3. Update Auto Shared
        if (autoSharedCategories.includes(oldName)) {
            await supabase.from('auto_shared_categories').insert([{ category_name: newName }]);
        }

        // 4. Delete old category (Cascades delete to auto_shared, and transactions set null if missed, but we updated them)
        await supabase.from('categories').delete().eq('name', oldName);

        // Refresh local state fully to be safe, or manually map
        setCategories(prev => prev.map(c => c === oldName ? newName : c));
        setAutoSharedCategories(prev => prev.map(c => c === oldName ? newName : c));
        setTransactions(prev => prev.map(t => t.category === oldName ? { ...t, category: newName } : t));
    };

    const toggleAutoShare = async (category: string) => {
        if (autoSharedCategories.includes(category)) {
            // Remove
            const { error } = await supabase.from('auto_shared_categories').delete().eq('category_name', category);
            if (!error) {
                setAutoSharedCategories(prev => prev.filter(c => c !== category));
            }
        } else {
            // Add
            const { error } = await supabase.from('auto_shared_categories').insert([{ category_name: category }]);
            if (!error) {
                setAutoSharedCategories(prev => [...prev, category]);
            }
        }
    };

    const addTransaction = async (data: Omit<Transaction, 'id'>) => {
        const dbTransaction = {
            description: data.description,
            amount: data.amount,
            date: data.date,
            category: data.category,
            payer: data.payer,
            is_shared: data.isShared
        };

        const { data: result, error } = await supabase.from('transactions').insert([dbTransaction]).select().single();

        if (result && !error) {
            const newTransaction: Transaction = {
                ...result,
                isShared: result.is_shared
            };
            setTransactions(prev => [newTransaction, ...prev]);
        }
    };

    const addExchange = async (data: Omit<ExchangeTransaction, 'id'>) => {
        const dbExchange = {
            origin_currency: data.originCurrency,
            origin_amount: data.originAmount,
            target_amount: data.targetAmount,
            rate: data.rate,
            target_wallet: data.targetWallet,
            date: data.date
        };

        const { data: result, error } = await supabase.from('exchanges').insert([dbExchange]).select().single();

        if (result && !error) {
            const newExchange: ExchangeTransaction = {
                ...result,
                originCurrency: result.origin_currency,
                originAmount: result.origin_amount,
                targetAmount: result.target_amount,
                targetWallet: result.target_wallet
            };
            setExchanges(prev => [newExchange, ...prev]);
        }
    };

    const updateBudget = async (walletId: WalletType, amount: number) => {
        const { error } = await supabase.from('wallets').update({ budget: amount }).eq('id', walletId);
        if (!error) {
            setWallets(prev => prev.map(w => w.id === walletId ? { ...w, budget: amount } : w));
        }
    };

    const getWalletBalance = (walletId: WalletType) => {
        const wallet = wallets.find(w => w.id === walletId);
        if (!wallet) return 0;

        let balance = wallet.budget;

        // Add Exchanges
        exchanges.forEach(ex => {
            if (ex.targetWallet === 'both') {
                balance += (ex.targetAmount / wallets.length);
            } else if (ex.targetWallet === walletId) {
                balance += ex.targetAmount;
            }
        });

        // Subtract Expenses
        transactions.forEach(t => {
            if (t.isShared) {
                balance -= (t.amount / wallets.length);
            } else {
                if (t.payer === walletId) {
                    balance -= t.amount;
                }
            }
        });

        return balance;
    };

    const updateTransaction = async (transaction: Transaction) => {
        const dbTransaction = {
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date,
            category: transaction.category,
            payer: transaction.payer,
            is_shared: transaction.isShared
        };

        const { error } = await supabase.from('transactions').update(dbTransaction).eq('id', transaction.id);

        if (!error) {
            setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
        }
    };

    const removeTransaction = async (id: string) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);

        if (!error) {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    };

    return (
        <ExpenseContext.Provider value={{
            wallets,
            transactions,
            exchanges,
            categories,
            autoSharedCategories,
            addTransaction,
            updateTransaction,
            removeTransaction,
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
