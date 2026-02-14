import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { clsx } from 'clsx';
import { ShoppingBag, Coffee, Home, Car, Film, Wallet } from 'lucide-react';
import type { Transaction, Category } from '../types';

interface TransactionListProps {
    limit?: number;
    onTransactionClick?: (transaction: Transaction) => void;
}

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
    'General': <Wallet size={18} />,
    'Food': <Coffee size={18} />,
    'Transport': <Car size={18} />,
    'Home': <Home size={18} />,
    'Shopping': <ShoppingBag size={18} />,
    'Entertainment': <Film size={18} />,
};

const CATEGORY_COLORS: Record<Category, string> = {
    'General': 'bg-gray-100 text-gray-600',
    'Food': 'bg-orange-100 text-orange-600',
    'Transport': 'bg-blue-100 text-blue-600',
    'Home': 'bg-green-100 text-green-600',
    'Shopping': 'bg-purple-100 text-purple-600',
    'Entertainment': 'bg-red-100 text-red-600',
};

const TransactionList: React.FC<TransactionListProps> = ({ limit, onTransactionClick }) => {
    const { transactions, wallets } = useExpenses();

    const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed">
                <p>Nenhuma transação ainda</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {displayTransactions.map(t => {
                const wallet = wallets.find(w => w.id === t.payer);
                return (
                    <div
                        key={t.id}
                        onClick={() => onTransactionClick?.(t)}
                        className={clsx(
                            "bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between",
                            onTransactionClick && "cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={clsx("p-2 rounded-full", CATEGORY_COLORS[t.category])}>
                                {CATEGORY_ICONS[t.category]}
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{t.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <span>{new Date(t.date).toLocaleDateString()}</span>

                                    {/* Avatars Section */}
                                    <div className="flex -space-x-2 ml-1">
                                        {t.isShared ? (
                                            wallets.map(w => (
                                                <div
                                                    key={w.id}
                                                    className="w-5 h-5 rounded-full border border-white bg-gray-100 flex items-center justify-center overflow-hidden"
                                                    title={w.name}
                                                >
                                                    {w.avatar_url ? (
                                                        <img src={w.avatar_url} alt={w.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[8px] font-bold text-gray-500">{w.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            wallet && (
                                                <div
                                                    className="w-5 h-5 rounded-full border border-white bg-gray-100 flex items-center justify-center overflow-hidden"
                                                    title={wallet.name}
                                                >
                                                    {wallet.avatar_url ? (
                                                        <img src={wallet.avatar_url} alt={wallet.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[8px] font-bold text-gray-500">{wallet.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span className="font-bold text-gray-800">
                            -${t.amount.toFixed(2)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionList;
