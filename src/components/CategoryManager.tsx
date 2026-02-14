
import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';
import { Trash2, Plus, Tag, ToggleLeft, ToggleRight, Pencil, Check, X } from 'lucide-react';

export default function CategoryManager() {
    const { categories, autoSharedCategories, addCategory, removeCategory, renameCategory, toggleAutoShare } = useExpenses();
    const { showToast } = useToast();

    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Delete Modal State
    const [deleteCategoryName, setDeleteCategoryName] = useState<string | null>(null);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        addCategory(newCategory.trim());
        setNewCategory('');
        showToast('Categoria adicionada com sucesso!', 'success');
    };

    const startEditing = (currentName: string) => {
        setEditingCategory(currentName);
        setEditName(currentName);
    };

    const saveEdit = (oldName: string) => {
        if (editName.trim() && editName.trim() !== oldName) {
            renameCategory(oldName, editName.trim());
            showToast('Categoria renomeada com sucesso!', 'success');
        }
        setEditingCategory(null);
        setEditName('');
    };

    const handleDelete = () => {
        if (deleteCategoryName) {
            removeCategory(deleteCategoryName);
            showToast('Categoria removida com sucesso.', 'success');
            setDeleteCategoryName(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Tag className="text-blue-500" />
                Gerenciar Categorias
            </h2>

            {/* List */}
            <div className="space-y-3 mb-8">
                {categories.map(category => {
                    const isAutoShared = autoSharedCategories.includes(category.name);
                    const isEditing = editingCategory === category.name;

                    return (
                        <div key={category.name} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">

                            {isEditing ? (
                                <div className="flex items-center gap-2 flex-1 mr-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(category.name)}
                                    />
                                    <button onClick={() => saveEdit(category.name)} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                        <Check size={18} />
                                    </button>
                                    <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:bg-gray-50 p-1 rounded">
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800">{category.name}</span>
                                        <button
                                            onClick={() => startEditing(category.name)}
                                            className="text-gray-300 hover:text-blue-600 transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => toggleAutoShare(category.name)}
                                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors mt-1"
                                    >
                                        {isAutoShared ? (
                                            <>
                                                <ToggleRight className="text-blue-600" size={16} />
                                                <span className="text-blue-600">Divide Automático</span>
                                            </>
                                        ) : (
                                            <>
                                                <ToggleLeft className="text-gray-400" size={16} />
                                                <span>Individual (Padrão)</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {!isEditing && (
                                <button
                                    onClick={() => setDeleteCategoryName(category.name)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remover Categoria"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Form */}
            <form onSubmit={handleAdd} className="mt-6 pt-6 border-t border-gray-100 relative">
                <label className="block text-sm font-medium text-gray-500 mb-2">Adicionar Nova Categoria</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nome (ex: Pets, Uber)"
                        required
                    />
                    <button
                        type="submit"
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </form>

            {/* Confirm Category Delete */}
            <ConfirmModal
                isOpen={!!deleteCategoryName}
                onClose={() => setDeleteCategoryName(null)}
                onConfirm={handleDelete}
                title="Remover Categoria"
                message={`Tem certeza que deseja remover a categoria "${deleteCategoryName}"?`}
                confirmText="Remover"
                isDestructive
            />
        </div>
    );
}
