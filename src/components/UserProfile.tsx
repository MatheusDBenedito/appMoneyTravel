
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext'; // Import useExpenses
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { User, Camera, Loader2, Save, LogOut } from 'lucide-react';

export default function UserProfile() {
    const { user, signOut } = useAuth();
    const { uploadAvatar } = useExpenses(); // Get uploadAvatar
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false); // State for upload loading
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    async function getProfile() {
        try {
            setLoading(true);
            const { data, error, status } = await supabase
                .from('profiles')
                .select(`full_name, avatar_url`)
                .eq('id', user?.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setFullName(data.full_name || '');
                setAvatarUrl(data.avatar_url || '');
                setImageError(false);
            }
        } catch (error: any) {
            console.error('Error loading user data:', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        try {
            setLoading(true);

            const updates = {
                id: user?.id,
                full_name: fullName,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) {
                throw error;
            }
            showToast('Perfil atualizado com sucesso!', 'success');
        } catch (error: any) {
            showToast('Erro ao atualizar perfil.', 'error');
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        const file = e.target.files[0];
        try {
            setUploading(true);
            const publicUrl = await uploadAvatar(file);
            if (publicUrl) {
                setAvatarUrl(publicUrl);
                setImageError(false);
                showToast('Foto carregada! Não esqueça de salvar.', 'success');
            } else {
                showToast('Erro ao fazer upload da imagem.', 'error');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showToast('Erro ao fazer upload da imagem.', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3 dark:text-gray-100">
                <User className="text-blue-600 dark:text-blue-400" size={32} />
                Meu Perfil
            </h2>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg dark:bg-gray-800 dark:border-gray-700">
                            {avatarUrl && !imageError ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                    <User size={64} />
                                </div>
                            )}
                        </div>

                        {/* Avatar Upload Overlay */}
                        <label className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                            {uploading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <Camera size={24} />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">Clique na foto para alterar</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2 dark:text-gray-400">E-mail</label>
                        <input
                            type="text"
                            value={user?.email}
                            disabled
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2 dark:text-gray-400">Nome Completo</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="Como você quer ser chamado?"
                        />
                    </div>

                    {/* Removed Manual URL Input */}

                    <button
                        onClick={updateProfile}
                        disabled={loading || uploading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transform transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Salvar Alterações
                    </button>

                    <button
                        onClick={signOut}
                        className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transform transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                        <LogOut size={20} />
                        Sair da Conta
                    </button>
                </div>
            </div>
        </div>
    );
}
