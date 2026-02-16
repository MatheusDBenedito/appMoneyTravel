import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../hooks/useToast';
import { Trash2, UserPlus, Users, Pencil, Check, X, Camera, User, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';

import ConfirmModal from './ConfirmModal'; // Import Modal

export default function PeopleManager() {
    const { wallets, addWallet, removeWallet, renameWallet, getWalletBalance, uploadAvatar, updateWalletAvatar, updateWalletDivision, updateBudget } = useExpenses();
    const { showToast } = useToast();
    const [newName, setNewName] = useState('');
    const [errorId, setErrorId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editBudget, setEditBudget] = useState(''); // Edit state for budget
    const [editIncludes, setEditIncludes] = useState(true); // Edit state for checkbox
    const [file, setFile] = useState<File | null>(null); // For new wallet
    const [includedInDivision, setIncludedInDivision] = useState(true); // New state
    const [uploadingId, setUploadingId] = useState<string | null>(null); // For existing wallet
    const [walletToDelete, setWalletToDelete] = useState<{ id: string, name: string } | null>(null); // State for delete modal

    // Helper to trigger hidden file input from the list (edit mode)
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, walletId?: string) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            if (selectedFile.size > 1024 * 1024) {
                showToast('A imagem deve ter no máximo 1MB.', 'error');
                e.target.value = '';
                return;
            }

            if (walletId) {
                // Determine if we are updating an existing wallet directly
                setUploadingId(walletId);
                try {
                    const url = await uploadAvatar(selectedFile);
                    if (url) {
                        const { error } = await updateWalletAvatar(walletId, url);
                        if (error) {
                            showToast('Erro ao atualizar banco de dados.', 'error');
                        } else {
                            showToast('Foto atualizada com sucesso!', 'success');
                        }
                    } else {
                        showToast('Erro ao fazer upload da imagem.', 'error');
                    }
                } catch (error) {
                    console.error(error);
                    showToast('Erro ao atualizar foto.', 'error');
                } finally {
                    setUploadingId(null);
                    // Reset input
                    e.target.value = '';
                }
            } else {
                // Setting file for new wallet creation
                setFile(selectedFile);
            }
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        let avatarUrl = undefined;
        if (file) {
            const url = await uploadAvatar(file);
            if (url) avatarUrl = url;
        }

        await addWallet(newName.trim(), 0, avatarUrl, includedInDivision);
        setNewName('');
        setFile(null);
        setIncludedInDivision(true); // Reset to default
        setErrorId(null);
    };

    const startEditing = (id: string, currentName: string, currentIncludes: boolean) => { // Removed budget param, will calc
        setEditingId(id);
        setEditName(currentName);
        setEditIncludes(currentIncludes);
        const currentBalance = getWalletBalance(id);
        setEditBudget(currentBalance.toFixed(2));
    };

    const saveEdit = async (id: string) => {
        if (editName.trim()) {
            renameWallet(id, editName.trim());
        }
        // Smart Balance Adjustment
        // User inputs the TARGET balance they want to see.
        // We calculate the necessary Budget (Initial Balance) shift to achieve that.
        // Formula: NewBudget = OldBudget + (TargetBalance - CurrentBalance)
        const targetBalance = parseFloat(editBudget);
        const wallet = wallets.find(w => w.id === id);

        if (!isNaN(targetBalance) && wallet) {
            const currentBalance = getWalletBalance(id);
            // Only update if there's a difference to avoid floating point noise on no-change
            if (Math.abs(targetBalance - currentBalance) > 0.001) {
                const diff = targetBalance - currentBalance;
                const newBudget = wallet.budget + diff;
                updateBudget(id, newBudget);
            }
        }

        // Save division status
        const { error } = await updateWalletDivision(id, editIncludes);
        if (error) {
            showToast('Erro ao atualizar status de divisão.', 'error');
        }

        setEditingId(null);
        setEditName('');
    };

    const confirmDelete = () => {
        if (walletToDelete) {
            removeWallet(walletToDelete.id);
            setWalletToDelete(null);
            showToast(`"${walletToDelete.name}" removido com sucesso!`, 'success');
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 dark:text-gray-100">
                <Users className="text-purple-600 dark:text-purple-400" />
                Gerenciar Pessoas
            </h2>

            {/* List */}
            <div className="space-y-3 mb-8">
                {wallets.map(wallet => {
                    const balance = getWalletBalance(wallet.id);
                    const isRemovable = wallets.length > 1; // Prevent deleting last wallet
                    const isEditing = editingId === wallet.id;

                    return (
                        <div key={wallet.id} className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 w-full dark:bg-gray-800 dark:border-gray-700">

                                {isEditing ? (
                                    <div className="flex items-center gap-2 flex-1 mr-2 bg-white p-2 rounded-lg border border-purple-200 dark:bg-gray-700 dark:border-purple-900/50">
                                        <div className="flex-1 flex flex-col gap-1">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full px-2 py-1 border-b border-gray-200 focus:outline-none focus:border-purple-500 text-sm font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                autoFocus
                                                placeholder="Nome"
                                            />
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={`edit-division-${wallet.id}`}
                                                    checked={editIncludes}
                                                    onChange={(e) => setEditIncludes(e.target.checked)}
                                                    className="w-3 h-3 text-purple-600 rounded border-gray-300 dark:bg-gray-600 dark:border-gray-500"
                                                />
                                                <label htmlFor={`edit-division-${wallet.id}`} className="text-xs text-gray-500 cursor-pointer select-none dark:text-gray-300">
                                                    Divide Contas
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-1 border-t border-gray-100 pt-1 mt-1 dark:border-gray-600">
                                                <DollarSign size={12} className="text-gray-400" />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editBudget}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val.length <= 8) { // slightly more for decimals
                                                            setEditBudget(val);
                                                        }
                                                    }}
                                                    className="flex-1 min-w-0 text-xs p-1 bg-gray-50 border border-transparent hover:border-gray-200 rounded focus:outline-none focus:border-purple-300 focus:bg-white transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:border-gray-500 dark:focus:bg-gray-700"
                                                    placeholder="Definir Saldo Atual"
                                                    title="Ao alterar este valor, o Saldo Inicial será reajustado automaticamente para atingir o valor desejado."
                                                />
                                                <button
                                                    onClick={() => setEditBudget('0.00')}
                                                    className="text-[10px] bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 px-2 py-1 rounded border border-gray-200 transition-colors dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-red-900/30"
                                                    title="Zerar Saldo"
                                                >
                                                    Zerar
                                                </button>
                                            </div>
                                        </div>
                                        <button onClick={() => saveEdit(wallet.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-full dark:text-green-400 dark:hover:bg-green-900/20">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:bg-gray-50 p-2 rounded-full dark:hover:bg-gray-600">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col flex-1 min-w-0 mr-2">
                                        <div className="flex items-center gap-3 mb-1">
                                            {/* Avatar / Photo */}
                                            <div className="relative group flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                                    {wallet.avatar_url ? (
                                                        <img src={wallet.avatar_url} alt={wallet.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="text-gray-400 dark:text-gray-500" size={20} />
                                                    )}
                                                </div>

                                                {/* Edit Overlay */}
                                                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                                    {uploadingId === wallet.id ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Camera className="text-white" size={16} />
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileChange(e, wallet.id)}
                                                    />
                                                </label>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-800 truncate block dark:text-gray-200">{wallet.name}</span>
                                                    <button
                                                        onClick={() => startEditing(wallet.id, wallet.name, wallet.includedInDivision)}
                                                        className="text-gray-300 hover:text-purple-600 transition-colors flex-shrink-0 dark:text-gray-600 dark:hover:text-purple-400"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                </div>
                                                {!wallet.includedInDivision && (
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 inline-block truncate max-w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400" title="Não participa da divisão de contas compartilhadas">
                                                        Não Divide
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={clsx("text-xs font-mono", balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                                            ${balance.toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                {!isEditing && isRemovable && (
                                    <button
                                        onClick={() => {
                                            if (balance !== 0) {
                                                setErrorId(wallet.id);
                                                return;
                                            }
                                            // Open Modal instead of window.confirm
                                            setWalletToDelete({ id: wallet.id, name: wallet.name });
                                            setErrorId(null);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                            {errorId === wallet.id && (
                                <span className="text-xs text-red-500 px-2 animate-pulse dark:text-red-400">
                                    Não é possível remover com saldo diferente de zero.
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Form */}
            <form onSubmit={handleAdd} className="mt-6 pt-6 border-t border-gray-100 relative dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-500 mb-2 dark:text-gray-400">Adicionar Nova Pessoa</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* New Avatar Input */}
                    <label className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative overflow-hidden border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700">
                        {file ? (
                            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="text-gray-400 dark:text-gray-500" size={24} />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e)}
                        />
                    </label>

                    <div className="flex-1 flex gap-2 w-full">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 min-w-0 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="Nome (ex: Filho)"
                            required
                        />
                        <button
                            type="submit"
                            className="px-4 py-3 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all flex-shrink-0 dark:shadow-none"
                        >
                            <UserPlus size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-3 sm:ml-20">
                    <input
                        type="checkbox"
                        id="includedInDivision"
                        checked={includedInDivision}
                        onChange={(e) => setIncludedInDivision(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="includedInDivision" className="text-sm text-gray-600 cursor-pointer select-none dark:text-gray-300">
                        Participa da divisão de contas?
                    </label>
                </div>
            </form>
            <ConfirmModal
                isOpen={!!walletToDelete}
                onClose={() => setWalletToDelete(null)}
                onConfirm={confirmDelete}
                title="Remover Pessoa"
                message={`Tem certeza que deseja remover "${walletToDelete?.name}"? Esta ação não pode ser desfeita.`}
                confirmText="Remover"
                isDestructive={true}
            />
        </div >
    );
}
