import React from 'react';
import type { Wallet } from '../types';
import { clsx } from 'clsx';
import { User, Heart } from 'lucide-react';

interface WalletCardProps {
    wallet: Wallet;
    balance: number;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, balance }) => {
    const isMe = wallet.id === 'me';

    // No changes needed yet, just verifying.d
    // Simplified view, no budget bar for now


    return (
        <div className={clsx(
            "p-5 rounded-3xl shadow-sm border transition-all hover:shadow-md",
            isMe ? "bg-blue-50/50 border-blue-100" : "bg-pink-50/50 border-pink-100"
        )}>
            <div className="flex items-center gap-3 mb-3">
                <div className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2",
                    isMe ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-pink-100 text-pink-600 border-pink-200",
                    wallet.avatar_url && "p-0 bg-transparent border-gray-200"
                )}>
                    {wallet.avatar_url ? (
                        <img src={wallet.avatar_url} alt={wallet.name} className="w-full h-full object-cover" />
                    ) : (
                        isMe ? <User size={20} /> : <Heart size={20} />
                    )}
                </div>
                <h3 className="font-semibold text-gray-700">{wallet.name}</h3>
            </div>

            <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Saldo</p>
                <p className={clsx(
                    "text-2xl font-bold",
                    balance < 0 ? "text-red-500" : "text-gray-800"
                )}>
                    ${balance.toFixed(2)}
                </p>
            </div>


        </div>
    );
};

export default WalletCard;
