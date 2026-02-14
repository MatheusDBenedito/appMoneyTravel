import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Wallet, Transaction, Category, WalletType, ExchangeTransaction, PaymentMethod } from '../types';
import { supabase } from '../lib/supabase';

interface ExpenseContextType {
    wallets: Wallet[];
    transactions: Transaction[];
    exchanges: ExchangeTransaction[];
    categories: Category[];
    autoSharedCategories: Category[];
    paymentMethods: PaymentMethod[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<{ error: any }>;
    updateTransaction: (transaction: Transaction) => Promise<{ error: any }>;
    removeTransaction: (id: string) => Promise<void>;
    addExchange: (exchange: Omit<ExchangeTransaction, 'id'>) => Promise<void>;
    updateExchange: (exchange: ExchangeTransaction) => Promise<void>;
    removeExchange: (id: string) => Promise<void>;
    addWallet: (name: string, avatarUrl?: string, includedInDivision?: boolean) => Promise<void>;
    removeWallet: (id: string) => Promise<void>;
    updateWalletAvatar: (id: string, avatarUrl: string) => Promise<{ error: any }>;
    updateWalletDivision: (id: string, includedInDivision: boolean) => Promise<{ error: any }>;
    uploadAvatar: (file: File) => Promise<string | null>;
    addCategory: (name: string) => Promise<void>;
    removeCategory: (name: string) => Promise<void>;
    renameCategory: (oldName: string, newName: string) => Promise<void>;
    renameWallet: (id: string, newName: string) => Promise<void>;
    toggleAutoShare: (category: string) => Promise<void>;
    updateBudget: (walletId: WalletType, amount: number) => Promise<void>;
    getWalletBalance: (walletId: WalletType) => number;
    addPaymentMethod: (name: string) => Promise<void>;
    removePaymentMethod: (name: string) => Promise<void>;
    renamePaymentMethod: (oldName: string, newName: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [exchanges, setExchanges] = useState<ExchangeTransaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [autoSharedCategories, setAutoSharedCategories] = useState<Category[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data: walletsData } = await supabase.from('wallets').select('*').order('created_at', { ascending: true });
            if (walletsData) {
                setWallets(walletsData.map((w: any) => ({
                    ...w,
                    includedInDivision: w.included_in_division !== false // Handle null/undefined as true
                })));
            }

            const { data: transactionsData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
            if (transactionsData) {
                const mappedTransactions = transactionsData.map((t: any) => ({
                    ...t,
                    isShared: t.is_shared,
                    paymentMethod: t.payment_method
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
                    targetWallet: e.target_wallet,
                    location: e.location
                }));
                setExchanges(mappedExchanges);
            }

            const { data: categoriesData } = await supabase.from('categories').select('name');
            if (categoriesData) setCategories(categoriesData.map((c: any) => c.name));

            const { data: sharedData } = await supabase.from('auto_shared_categories').select('category_name');
            if (sharedData) setAutoSharedCategories(sharedData.map((s: any) => s.category_name));

            const { data: paymentMethodsData } = await supabase.from('payment_methods').select('name').order('created_at', { ascending: true });
            if (paymentMethodsData) setPaymentMethods(paymentMethodsData.map((p: any) => p.name));

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const addWallet = async (name: string, avatarUrl?: string, includedInDivision: boolean = true) => {
        const { data, error } = await supabase.from('wallets').insert([{
            name,
            budget: 0,
            avatar_url: avatarUrl,
            included_in_division: includedInDivision
        }]).select().single();

        if (data && !error) {
            setWallets(prev => [...prev, {
                ...data,
                includedInDivision: data.included_in_division
            }]);
        }
    };

    const updateWalletAvatar = async (id: string, avatarUrl: string) => {
        const { error } = await supabase.from('wallets').update({ avatar_url: avatarUrl }).eq('id', id);
        if (!error) {
            setWallets(prev => prev.map(w => w.id === id ? { ...w, avatar_url: avatarUrl } : w));
        } else {
            console.error('Error updating wallet avatar:', error);
        }
        return { error };
    };

    const updateWalletDivision = async (id: string, includedInDivision: boolean) => {
        const { error } = await supabase.from('wallets').update({ included_in_division: includedInDivision }).eq('id', id);
        if (!error) {
            setWallets(prev => prev.map(w => w.id === id ? { ...w, includedInDivision: includedInDivision } : w));
        } else {
            console.error('Error updating wallet division:', error);
        }
        return { error };
    };

    const uploadAvatar = async (file: File) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading avatar:', uploadError);
                return null;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Error in uploadAvatar:', error);
            return null;
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

    const addPaymentMethod = async (name: string) => {
        if (paymentMethods.includes(name)) return;
        const { error } = await supabase.from('payment_methods').insert([{ name }]);
        if (!error) {
            setPaymentMethods(prev => [...prev, name]);
        }
    };

    const removePaymentMethod = async (name: string) => {
        const { error } = await supabase.from('payment_methods').delete().eq('name', name);
        if (!error) {
            setPaymentMethods(prev => prev.filter(p => p !== name));
        }
    };

    const renamePaymentMethod = async (oldName: string, newName: string) => {
        if (paymentMethods.includes(newName)) return;

        // 1. Create new method
        const { error: createError } = await supabase.from('payment_methods').insert([{ name: newName }]);
        if (createError) return;

        // 2. Update transactions
        await supabase.from('transactions').update({ payment_method: newName }).eq('payment_method', oldName);

        // 3. Delete old method
        await supabase.from('payment_methods').delete().eq('name', oldName);

        // Update local state
        setPaymentMethods(prev => prev.map(p => p === oldName ? newName : p));
        setTransactions(prev => prev.map(t => t.paymentMethod === oldName ? { ...t, paymentMethod: newName } : t));
    };

    const addTransaction = async (data: Omit<Transaction, 'id'>) => {
        const dbTransaction = {
            description: data.description,
            amount: data.amount,
            date: data.date,
            category: data.category,
            payer: data.payer,
            is_shared: data.isShared,
            payment_method: data.paymentMethod
        };

        const { data: result, error } = await supabase.from('transactions').insert([dbTransaction]).select().single();

        if (result && !error) {
            const newTransaction: Transaction = {
                ...result,
                isShared: result.is_shared,
                paymentMethod: result.payment_method
            };
            setTransactions(prev => [newTransaction, ...prev]);
        }
        return { error };
    };

    const addExchange = async (data: Omit<ExchangeTransaction, 'id'>) => {
        const dbExchange = {
            origin_currency: data.originCurrency,
            origin_amount: data.originAmount,
            target_amount: data.targetAmount,
            rate: data.rate,
            target_wallet: data.targetWallet,
            date: data.date,
            location: data.location
        };

        const { data: result, error } = await supabase.from('exchanges').insert([dbExchange]).select().single();

        if (result && !error) {
            const newExchange: ExchangeTransaction = {
                ...result,
                originCurrency: result.origin_currency,
                originAmount: result.origin_amount,
                targetAmount: result.target_amount,
                targetWallet: result.target_wallet,
                location: result.location
            };
            setExchanges(prev => [newExchange, ...prev]);
        }
    };

    const updateExchange = async (exchange: ExchangeTransaction) => {
        const dbExchange = {
            origin_currency: exchange.originCurrency,
            origin_amount: exchange.originAmount,
            target_amount: exchange.targetAmount,
            rate: exchange.rate,
            target_wallet: exchange.targetWallet,
            date: exchange.date,
            location: exchange.location
        };

        const { error } = await supabase.from('exchanges').update(dbExchange).eq('id', exchange.id);

        if (!error) {
            setExchanges(prev => prev.map(e => e.id === exchange.id ? exchange : e));
        }
    };

    const removeExchange = async (id: string) => {
        const { error } = await supabase.from('exchanges').delete().eq('id', id);
        if (!error) {
            setExchanges(prev => prev.filter(e => e.id !== id));
        }
    };

    // ... (updateBudget, getWalletBalance remain same - skipped in replacement block for brevity/focus, handled by surrounding context if I replace correctly. Better to replace whole function blocks if I can, or targeted.)
    // Wait, I am replacing a huge chunk. Let me be careful about `updateBudget` and `getWalletBalance`. 
    // They are in the `TargetContent` range if I am not careful.
    // The `EndLine` is 248. `updateBudget` starts at 198. `getWalletBalance` starts at 205.
    // I need to include them in the replacement content unchanged if I'm overwriting them.
    // Let me construct the replacement content to include them properly.

    // Actually, I can just replace the specific functions `addTransaction`, `addExchange`, `updateTransaction` and `fetchInitialData`.
    // But `replace_file_content` is "SINGLE CONTIGUOUS block".
    // `fetchInitialData` is at top. `addTransaction` is middle. `updateTransaction` is bottom.
    // I should use `multi_replace_file_content` or split this up.
    // Since I cannot use `multi_replace` because the instructions say "Do NOT make multiple parallel calls to this tool or the replace_file_content tool for the same file", I will use `replace_file_content` multiple times sequentially OR use `multi_replace_file_content` once.
    // The instructions say: "To edit multiple, non-adjacent lines of code in the same file, make a single call to the multi_replace_file_content".
    // So `multi_replace_file_content` is the correct tool.

    // RE-EVALUATING TOOL CHOICE:
    // I will use `multi_replace_file_content` on `src/context/ExpenseContext.tsx`.

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

        // Helper to check if a wallet existed at a specific date
        // If created_at is missing, assume it always existed (legacy compatibility)
        const walletExistedAt = (w: Wallet, date: string | Date) => {
            if (!w.created_at) return true;
            // Compare timestamps. 
            // We use simple comparison: creation time must be BEFORE or EQUAL to transaction time.
            // Using a small buffer (e.g. same day) might be tricky, but strict timestamp is safest for "history".
            return new Date(w.created_at) <= new Date(date);
        };

        // Add Exchanges
        exchanges.forEach(ex => {
            if (ex.targetWallet === 'both') {
                // Calculate divider based on who existed at the time of exchange
                const participants = wallets.filter(w =>
                    w.includedInDivision && walletExistedAt(w, ex.date)
                );
                const divider = participants.length > 0 ? participants.length : 1;

                // Only receive share if this wallet existed and is included
                if (wallet.includedInDivision && walletExistedAt(wallet, ex.date)) {
                    balance += (ex.targetAmount / divider);
                }
            } else if (ex.targetWallet === walletId) {
                balance += ex.targetAmount;
            }
        });

        // Subtract Expenses
        transactions.forEach(t => {
            if (t.isShared) {
                // Calculate divider based on who existed at the time of transaction
                const participants = wallets.filter(w =>
                    w.includedInDivision && walletExistedAt(w, t.date)
                );
                const divider = participants.length > 0 ? participants.length : 1;

                // Only subtract if this wallet is included in division AND existed
                if (wallet.includedInDivision && walletExistedAt(wallet, t.date)) {
                    balance -= (t.amount / divider);
                }
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
            is_shared: transaction.isShared,
            payment_method: transaction.paymentMethod
        };

        const { error } = await supabase.from('transactions').update(dbTransaction).eq('id', transaction.id);

        if (!error) {
            setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
        } else {
            console.error('Error updating transaction:', error);
        }
        return { error };
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
            updateExchange,
            removeExchange,
            addWallet,
            removeWallet,
            updateWalletAvatar,
            updateWalletDivision,
            uploadAvatar,
            addCategory,
            removeCategory,
            renameCategory,
            renameWallet,
            toggleAutoShare,
            updateBudget,
            getWalletBalance,
            paymentMethods,
            addPaymentMethod,
            removePaymentMethod,
            renamePaymentMethod
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
