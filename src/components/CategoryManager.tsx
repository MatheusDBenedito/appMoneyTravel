
import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../hooks/useToast';
import ConfirmModal from './ConfirmModal';
import { Trash2, Plus, Tag, ToggleLeft, ToggleRight, Pencil, Check, X, ChevronDown } from 'lucide-react';
import { getIcon, availableIcons } from '../utils/iconMap';

export default function CategoryManager() {
    const { categories, autoSharedCategories, addCategory, removeCategory, renameCategory, toggleAutoShare } = useExpenses();
    const { showToast } = useToast();

    const [newCategory, setNewCategory] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('Wallet');
    const [showIconPicker, setShowIconPicker] = useState(false);

    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editIcon, setEditIcon] = useState('Wallet');
    const [showEditIconPicker, setShowEditIconPicker] = useState(false);

    // Delete Modal State
    const [deleteCategoryName, setDeleteCategoryName] = useState<string | null>(null);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        addCategory(newCategory.trim(), newCategoryIcon);
        setNewCategory('');
        setNewCategoryIcon('Wallet');
        setShowIconPicker(false);
        showToast('Categoria adicionada com sucesso!', 'success');
    };

    const startEditing = (category: { name: string, icon?: string }) => {
        setEditingCategory(category.name);
        setEditName(category.name);
        setEditIcon(category.icon || 'Wallet');
        setShowEditIconPicker(false);
    };

    const saveEdit = (oldName: string) => {
        if (editName.trim() && editingCategory) {
            const currentCat = categories.find(c => c.name === editingCategory);
            if (editName.trim() !== oldName || (currentCat && editIcon !== currentCat.icon)) {
                // Pass new icon as well
                renameCategory(oldName, editName.trim(), editIcon);
                showToast('Categoria atualizada com sucesso!', 'success');
            }
        }
        setEditingCategory(null);
        setEditName('');
        setEditIcon('Wallet');
    };

    const handleDelete = () => {
        if (deleteCategoryName) {
            removeCategory(deleteCategoryName);
            showToast('Categoria removida com sucesso.', 'success');
            setDeleteCategoryName(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 dark:text-gray-100">
                <Tag className="text-blue-500" />
                Gerenciar Categorias
            </h2>

            {/* List */}
            <div className="space-y-3 mb-8">
                {categories.map(category => {
                    const isAutoShared = autoSharedCategories.includes(category.name);
                    const isEditing = editingCategory === category.name;
                    const Icon = getIcon(category.icon);

                    return (
                        <div key={category.name} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">

                            {isEditing ? (
                                <div className="flex flex-col gap-2 flex-1 mr-2">
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditIconPicker(!showEditIconPicker)}
                                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                                            >
                                                {React.createElement(getIcon(editIcon), { size: 18, className: "text-blue-600 dark:text-blue-400" })}
                                                <ChevronDown size={14} className="text-gray-400 dark:text-gray-300" />
                                            </button>

                                            {showEditIconPicker && (
                                                <div className="absolute top-full left-0 mt-1 w-64 p-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 grid grid-cols-6 gap-1 max-h-48 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                                                    {availableIcons.map(iconName => (
                                                        <button
                                                            key={iconName}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditIcon(iconName);
                                                                setShowEditIconPicker(false);
                                                            }}
                                                            className={`p-2 rounded-lg hover:bg-gray-100 flex justify-center items-center dark:hover:bg-gray-700 ${editIcon === iconName ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                                                            title={iconName}
                                                        >
                                                            {React.createElement(getIcon(iconName), { size: 18 })}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="flex-1 px-2 py-1 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(category.name)}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-1">
                                        <button onClick={() => saveEdit(category.name)} className="text-green-600 hover:bg-green-50 p-1 rounded dark:text-green-400 dark:hover:bg-green-900/20">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:bg-gray-50 p-1 rounded dark:hover:bg-gray-700">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                            <Icon size={16} />
                                        </div>
                                        <span className="font-bold text-gray-800 dark:text-gray-200">{category.name}</span>
                                        <button
                                            onClick={() => startEditing(category)}
                                            className="text-gray-300 hover:text-blue-600 transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => toggleAutoShare(category.name)}
                                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors mt-1 dark:text-gray-400 dark:hover:text-blue-400"
                                    >
                                        {isAutoShared ? (
                                            <>
                                                <ToggleRight className="text-blue-600 dark:text-blue-400" size={16} />
                                                <span className="text-blue-600 dark:text-blue-400">Divide Automático</span>
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
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
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
            <form onSubmit={handleAdd} className="mt-6 pt-6 border-t border-gray-100 relative dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-500 mb-2 dark:text-gray-400">Adicionar Nova Categoria</label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="w-full sm:w-auto px-3 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center gap-2 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            {React.createElement(getIcon(newCategoryIcon), { size: 20, className: "text-blue-600 dark:text-blue-400" })}
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>

                        {showIconPicker && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 grid grid-cols-6 gap-1 max-h-48 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                                {availableIcons.map(iconName => (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => {
                                            setNewCategoryIcon(iconName);
                                            setShowIconPicker(false);
                                        }}
                                        className={`p-2 rounded-lg hover:bg-gray-100 flex justify-center items-center dark:hover:bg-gray-700 ${newCategoryIcon === iconName ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                                        title={iconName}
                                    >
                                        {React.createElement(getIcon(iconName), { size: 18 })}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 min-w-0 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="Nome (ex: Pets, Uber)"
                        required
                    />
                    <button
                        type="submit"
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all dark:shadow-none"
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
