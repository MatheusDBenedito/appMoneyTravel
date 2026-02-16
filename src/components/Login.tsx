import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { Mail, Lock, LogIn, UserPlus, User, X } from 'lucide-react';

export default function Login() {
    const { showToast } = useToast();
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    // SignUp State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Revert Remember Me change to fix login blocker
            // console.log('setPersistence:', (supabase.auth as any).setPersistence);
            // await (supabase.auth as any).setPersistence(rememberMe ? window.localStorage : window.sessionStorage);

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            showToast('Login realizado com sucesso!', 'success');
        } catch (error: any) {
            console.error(error);
            showToast(error.message || 'Erro ao realizar login.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email: newEmail,
                password: newPassword,
                options: {
                    data: {
                        full_name: newName,
                    },
                    emailRedirectTo: `${window.location.origin}`,
                },
            });

            if (error) throw error;

            showToast('Cadastro realizado! Verifique seu e-mail.', 'success');
            setIsSignUpModalOpen(false);
            // Optionally clear form
            setNewName('');
            setNewEmail('');
            setNewPassword('');
        } catch (error: any) {
            console.error(error);
            showToast(error.message || 'Erro ao realizar cadastro.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 dark:bg-gray-900">
                <div className="p-8 pb-6">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2 dark:text-white">MoneyTravel</h1>
                        <p className="text-gray-500 dark:text-gray-400">Gerencie seus gastos de viagem</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 ml-1 dark:text-gray-300">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 ml-1 dark:text-gray-300">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                                Esqueceu a senha?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transform transition-all active:scale-95 flex items-center justify-center gap-2 dark:shadow-none"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Entrar
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-gray-50 p-6 text-center border-t border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">
                        Não tem uma conta?
                        <button
                            type="button"
                            onClick={() => setIsSignUpModalOpen(true)}
                            className="ml-2 font-bold text-blue-600 hover:underline focus:outline-none dark:text-blue-400"
                        >
                            Criar agora
                        </button>
                    </p>
                </div>
            </div>

            {/* SignUp Modal */}
            {isSignUpModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative dark:bg-gray-900">
                        <button
                            onClick={() => setIsSignUpModalOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Criar Conta</h2>
                                <p className="text-gray-500 dark:text-gray-400">Comece a controlar suas viagens</p>
                            </div>

                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600 ml-1 dark:text-gray-300">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                            placeholder="Seu nome"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600 ml-1 dark:text-gray-300">E-mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                            placeholder="seu@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600 ml-1 dark:text-gray-300">Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                            placeholder="Crie uma senha"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transform transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <UserPlus size={20} />
                                            Cadastrar
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
