
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Wallet, Transaction, ExchangeTransaction, WalletType, Trip } from '../types';
import { supabase } from '../lib/supabase';

interface ExpenseContextType {
    wallets: Wallet[];
    transactions: Transaction[];
    exchanges: ExchangeTransaction[];
    categories: string[];
    autoSharedCategories: string[];
    paymentMethods: string[];
    trips: Trip[];
    currentTripId: string | null;
    isLoading: boolean;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<{ data?: any; error?: any }>;
    updateTransaction: (transaction: Transaction) => Promise<{ error: any }>;
    removeTransaction: (id: string) => Promise<void>;
    addExchange: (exchange: Omit<ExchangeTransaction, 'id'>) => Promise<void>;
    updateExchange: (exchange: ExchangeTransaction) => Promise<void>;
    removeExchange: (id: string) => Promise<void>;
    addWallet: (name: string, avatarUrl?: string, includedInDivision?: boolean) => Promise<{ data?: Wallet, error?: any }>;
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
    createTrip: (name: string) => Promise<string | null>;
    updateTrip: (id: string, name: string) => Promise<{ error: any }>;
    deleteTrip: (id: string) => Promise<{ error: any }>;
    switchTrip: (tripId: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [exchanges, setExchanges] = useState<ExchangeTransaction[]>([]);

    // Trip State
    const [trips, setTrips] = useState<Trip[]>([]);
    const [currentTripId, setCurrentTripId] = useState<string | null>(() => localStorage.getItem('moneytravel_trip_id'));

    // Loading state to prevent premature rendering
    const [isLoading, setIsLoading] = useState(true);

    const [categories, setCategories] = useState<string[]>([]);
    const [autoSharedCategories, setAutoSharedCategories] = useState<string[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<string[]>([]);

    useEffect(() => {
        if (currentTripId) {
            localStorage.setItem('moneytravel_trip_id', currentTripId);
        }
        fetchInitialData();
    }, [currentTripId]); // Refetch when trip changes

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Trips
            const { data: tripsData, error: tripsError } = await supabase
                .from('trips')
                .select('*')
                .order('created_at', { ascending: false });

            if (tripsError) throw tripsError;

            const loadedTrips = tripsData || [];
            setTrips(loadedTrips);

            // Determine Active Trip
            let activeTripId = currentTripId;
            if (!activeTripId && loadedTrips.length > 0) {
                // Default to most recent or first
                activeTripId = loadedTrips[0].id;
                setCurrentTripId(activeTripId);
            }

            // If still no trip (e.g. no trips exist, creating first one handled elsewhere or empty state), stop here?
            // Actually, migration creates a default one.

            if (activeTripId) {
                // Fetch Data for Active Trip
                const { data: walletsData } = await supabase.from('wallets').select('*').eq('trip_id', activeTripId).order('created_at');
                const { data: transactionsData } = await supabase.from('transactions').select('*').eq('trip_id', activeTripId).order('date', { ascending: false });
                const { data: exchangesData } = await supabase.from('exchanges').select('*').eq('trip_id', activeTripId).order('date', { ascending: false });
                const { data: categoriesData } = await supabase.from('categories').select('name').eq('trip_id', activeTripId);
                const { data: autoSharedData } = await supabase.from('auto_shared_categories').select('category_name').eq('trip_id', activeTripId);
                const { data: paymentMethodsData } = await supabase.from('payment_methods').select('name').eq('trip_id', activeTripId);

                if (walletsData) {
                    setWallets(walletsData.map((w: any) => ({
                        ...w,
                        includedInDivision: w.included_in_division !== false // Handle null/undefined as true
                    })));
                }
                if (transactionsData) {
                    const mappedTransactions = transactionsData.map((t: any) => ({
                        ...t,
                        isShared: t.is_shared,
                        paymentMethod: t.payment_method
                    }));
                    setTransactions(mappedTransactions);
                }
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
                if (categoriesData) setCategories(categoriesData.map((c: any) => c.name));
                if (autoSharedData) setAutoSharedCategories(autoSharedData.map((s: any) => s.category_name));
                if (paymentMethodsData) setPaymentMethods(paymentMethodsData.map((p: any) => p.name));
            } else {
                // No trips found - Reset data
                setWallets([]);
                setTransactions([]);
                setExchanges([]);
                setCategories([]);
                setAutoSharedCategories([]);
                setPaymentMethods([]);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            // Assuming showToast is defined elsewhere or will be added
            // showToast('Erro ao carregar dados', 'error'); 
        } finally {
            setIsLoading(false);
        }
    };

    // --- Trip Management ---

    const createTrip = async (name: string) => {
        const { data, error } = await supabase.from('trips').insert([{ name }]).select().single();
        if (error) {
            // showToast('Erro ao criar viagem', 'error');
            console.error('Error creating trip:', error);
            return null;
        }
        setTrips(prev => [data, ...prev]);
        // showToast('Viagem criada com sucesso!', 'success');
        return data.id;
    };

    const updateTrip = async (id: string, name: string) => {
        const { error } = await supabase.from('trips').update({ name }).eq('id', id);
        if (!error) {
            setTrips(prev => prev.map(t => t.id === id ? { ...t, name } : t));
        }
        return { error };
    };

    const deleteTrip = async (id: string) => {
        const { error } = await supabase.from('trips').delete().eq('id', id);
        if (!error) {
            setTrips(prev => prev.filter(t => t.id !== id));
            if (currentTripId === id) {
                setCurrentTripId(null);
                // Optionally switch to another trip or clear state
            }
        }
        return { error };
    };

    const switchTrip = (tripId: string) => {
        setCurrentTripId(tripId);
        // fetchInitialData will be triggered by useEffect logic if we separate effects?
        // Current fetchInitialData is called once on mount. 
        // We should break it up or just call it here.
        // Better: Make fetch depend on currentTripId in a useEffect.
    };

    // We need to refactor useEffect slightly to re-fetch when trip changes.
    // For now, let's just create a separate effect for data fetching when ID changes.
    // Actually, `fetchInitialData` handles everything. Let's make it depend on `currentTripId`?
    // See replacement below.

    const addWallet = async (name: string, avatarUrl?: string, includedInDivision: boolean = true) => {
        if (!currentTripId) return { error: 'No trip selected' };

        try {
            const newWallet = {
                name,
                budget: 0,
                avatar_url: avatarUrl,
                included_in_division: includedInDivision,
                trip_id: currentTripId
            };
            const { data, error } = await supabase.from('wallets').insert([newWallet]).select().single();

            if (error) throw error;
            if (data) {
                setWallets(prev => [...prev, {
                    ...data,
                    includedInDivision: data.included_in_division
                }]);
                return { data };
            }
        } catch (error) {
            console.error('Error adding wallet:', error);
            return { error };
        }
        return { error: 'Unknown error adding wallet' }; // Should not be reached
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
            const fileName = `${Math.random()}.${fileExt} `;
            const filePath = `${fileName} `;

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
        if (!currentTripId) return;

        const isAutoShared = autoSharedCategories.includes(category);
        if (isAutoShared) {
            const { error } = await supabase.from('auto_shared_categories')
                .delete()
                .eq('category_name', category)
                .eq('trip_id', currentTripId);
            if (!error) {
                setAutoSharedCategories(prev => prev.filter(c => c !== category));
            }
        } else {
            const { error } = await supabase.from('auto_shared_categories')
                .insert([{ category_name: category, trip_id: currentTripId }]);
            if (!error) {
                setAutoSharedCategories(prev => [...prev, category]);
            }
        }
    };

    const addPaymentMethod = async (name: string) => {
        if (!currentTripId) return;
        const { error } = await supabase.from('payment_methods').insert([{ name, trip_id: currentTripId }]);
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

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        if (!currentTripId) return { error: 'No trip selected' };

        try {
            const dbTransaction = {
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date,
                category: transaction.category,
                payer: transaction.payer,
                is_shared: transaction.isShared,
                payment_method: transaction.paymentMethod,
                trip_id: currentTripId
            };

            const { data, error } = await supabase.from('transactions').insert([dbTransaction]).select().single();

            if (error) throw error;
            if (data) {
                const newTx = { ...transaction, id: data.id };
                setTransactions(prev => [newTx, ...prev]);
                return { data };
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            // showToast('Erro ao salvar despesa', 'error'); // Assuming showToast is defined elsewhere
        }
        return { error: 'Unknown error adding transaction' };
    };

    const addExchange = async (exchange: Omit<ExchangeTransaction, 'id'>) => {
        if (!currentTripId) return;

        const dbExchange = {
            origin_currency: exchange.originCurrency,
            origin_amount: exchange.originAmount,
            target_amount: exchange.targetAmount,
            rate: exchange.rate,
            target_wallet: exchange.targetWallet,
            location: exchange.location,
            date: exchange.date,
            trip_id: currentTripId
        };

        const { data, error } = await supabase.from('exchanges').insert([dbExchange]).select().single();
        if (!error && data) {
            const newEx = { ...exchange, id: data.id };
            setExchanges(prev => [newEx, ...prev]);
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
            trips,
            currentTripId,
            isLoading,
            createTrip,
            updateTrip,
            deleteTrip,
            switchTrip,
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
