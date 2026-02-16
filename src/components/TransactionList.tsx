import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { clsx } from 'clsx';
import type { Transaction } from '../types';

interface TransactionListProps {
    limit?: number;
    onTransactionClick?: (transaction: Transaction) => void;
}

import { getIcon } from '../utils/iconMap';

const TransactionList: React.FC<TransactionListProps> = ({ limit, onTransactionClick }) => {
    const { transactions, wallets, categories } = useExpenses();

    const getCategoryIcon = (categoryName: string) => {
        const category = categories.find(c => c.name === categoryName);
        const IconComponent = category ? getIcon(category.icon) : getIcon('Wallet');
        return <IconComponent size={18} />;
    };

    const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed dark:bg-gray-900 dark:border-gray-800 dark:text-gray-500">
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
                            "bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between dark:bg-gray-900 dark:border-gray-800",
                            onTransactionClick && "cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all dark:hover:bg-gray-800"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={clsx("p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300")}>
                                {getCategoryIcon(t.category)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 dark:text-gray-400">
                                    <span>{new Date(t.date).toLocaleDateString()}</span>

                                    {/* Avatars Section */}
                                    <div className="flex -space-x-2 ml-1">
                                        {t.isShared ? (
                                            [...wallets]
                                                .filter(w => w.includedInDivision || w.id === t.payer)
                                                .sort((a, b) => a.id === t.payer ? -1 : b.id === t.payer ? 1 : 0)
                                                .map(w => (
                                                    <div
                                                        key={w.id}
                                                        className={clsx(
                                                            "w-5 h-5 rounded-full border border-white flex items-center justify-center overflow-hidden",
                                                            w.id === t.payer ? "z-10 ring-1 ring-offset-1 ring-blue-500" : "bg-gray-100"
                                                        )}
                                                        title={w.id === t.payer ? `${w.name} (Pagou)` : w.name}
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
                        <span className={clsx("font-bold", t.type === 'income' ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-gray-200")}>
                            {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionList;
