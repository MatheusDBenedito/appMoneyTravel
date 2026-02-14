import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../context/ToastContext';
import { Trash2, UserPlus, Users, Pencil, Check, X, Camera, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function PeopleManager() {
    const { wallets, addWallet, removeWallet, renameWallet, getWalletBalance, uploadAvatar, updateWalletAvatar } = useExpenses();
    const { showToast } = useToast();
    const [newName, setNewName] = useState('');
    const [errorId, setErrorId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [file, setFile] = useState<File | null>(null); // For new wallet
    const [uploadingId, setUploadingId] = useState<string | null>(null); // For existing wallet

    // Helper to trigger hidden file input from the list (edit mode)
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, walletId?: string) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

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

        await addWallet(newName.trim(), avatarUrl);
        setNewName('');
        setFile(null);
        setErrorId(null);
    };

    const startEditing = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const saveEdit = (id: string) => {
        if (editName.trim()) {
            renameWallet(id, editName.trim());
        }
        setEditingId(null);
        setEditName('');
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users className="text-purple-600" />
                Gerenciar Pessoas
            </h2>

            {/* List */}
            <div className="space-y-3 mb-8">
                {wallets.map(wallet => {
                    const balance = getWalletBalance(wallet.id);
                    const isRemovable = wallets.length > 1; // Prevent deleting last wallet
                    const isEditing = editingId === wallet.id;

                    return (
                        <div key={wallet.id} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">

                                {isEditing ? (
                                    <div className="flex items-center gap-2 flex-1 mr-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full px-2 py-1 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            autoFocus
                                        />
                                        <button onClick={() => saveEdit(wallet.id)} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:bg-gray-50 p-1 rounded">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar / Photo */}
                                            <div className="relative group">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-300">
                                                    {wallet.avatar_url ? (
                                                        <img src={wallet.avatar_url} alt={wallet.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="text-gray-400" size={20} />
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

                                            <span className="font-bold text-gray-800">{wallet.name}</span>
                                            <button
                                                onClick={() => startEditing(wallet.id, wallet.name)}
                                                className="text-gray-300 hover:text-purple-600 transition-colors"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        </div>
                                        <span className={clsx("text-xs font-mono", balance >= 0 ? "text-green-600" : "text-red-500")}>
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
                                            if (confirm(`Remover "${wallet.name}"?`)) {
                                                removeWallet(wallet.id);
                                                setErrorId(null);
                                            }
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                            {errorId === wallet.id && (
                                <span className="text-xs text-red-500 px-2 animate-pulse">
                                    Não é possível remover com saldo diferente de zero.
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Form */}
            <form onSubmit={handleAdd} className="mt-6 pt-6 border-t border-gray-100 relative">
                <label className="block text-sm font-medium text-gray-500 mb-2">Adicionar Nova Pessoa</label>
                <div className="flex gap-2 items-center">
                    {/* New Avatar Input */}
                    <label className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative overflow-hidden border border-gray-300">
                        {file ? (
                            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="text-gray-400" size={20} />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e)}
                        />
                    </label>

                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Nome (ex: Filho)"
                            required
                        />
                        <button
                            type="submit"
                            className="px-4 py-3 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all"
                        >
                            <UserPlus size={24} />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
