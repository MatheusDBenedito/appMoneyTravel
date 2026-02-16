import { useState, useEffect } from 'react';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { Plus, ArrowRightLeft, Settings, PieChart, Wallet, Home, DollarSign } from 'lucide-react';
import Sidebar from './components/Sidebar';
import CreateTripModal from './components/CreateTripModal';
import DonutChart from './components/DonutChart';
// Components
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import AddReturnModal from './components/AddReturnModal';
import ExchangeForm from './components/ExchangeForm';
import PeopleManager from './components/PeopleManager';
import CategoryManager from './components/CategoryManager';
import PaymentMethodManager from './components/PaymentMethodManager';
import TripManager from './components/TripManager';
import WalletCard from './components/WalletCard';
import Reports from './components/Reports';
import UserProfile from './components/UserProfile';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import type { Transaction } from './types';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';

function AppContent() {
  const { user, isLoading } = useAuth();
  const { wallets, getWalletBalance, trips, currentTripId, switchTrip } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false);



  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exchange' | 'settings' | 'history' | 'reports' | 'profile'>(() => {
    return (localStorage.getItem('moneytravel_active_tab') as any) || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('moneytravel_active_tab', activeTab);
  }, [activeTab]);

  const totalBalance = wallets.reduce((acc, w) => acc + getWalletBalance(w.id), 0);

  const { transactions } = useExpenses(); // Ensure transactions are available

  // Calculate Category Stats for Chart
  const categoryStats = activeTab === 'dashboard' ? (() => {
    const stats: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        stats[t.category] = (stats[t.category] || 0) + t.amount;
      } else if (t.type === 'income') {
        stats[t.category] = (stats[t.category] || 0) - t.amount;
      }
    });

    // Filter out <= 0 for the pie chart
    const filteredStats = Object.entries(stats).filter(([, value]) => value > 0);

    const total = filteredStats.reduce((a, [, b]) => a + b, 0);

    return filteredStats
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0
      }));
  })() : [];

  const handleTripChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'new_trip') {
      setIsCreateTripModalOpen(true);
    } else {
      switchTrip(val);
    }
  };

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      if (transaction.type === 'income') {
        setSelectedTransaction(transaction);
        setIsReturnModalOpen(true);
      } else {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
      }
    } else {
      setSelectedTransaction(undefined);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(false);
    setIsReturnModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex">

      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        className="hidden md:flex w-64 flex-shrink-0 z-50 shadow-sm"
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Mobile Header (Blue) */}
        <header className="md:hidden bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div className="relative max-w-[70%]">
              <select
                value={currentTripId || ''}
                onChange={handleTripChange}
                className="appearance-none bg-blue-800/50 text-white border border-blue-500/30 py-2 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold text-lg truncate w-full"
                style={{ backgroundImage: 'none' }}
              >
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id} className="text-gray-900">
                    {trip.name}
                  </option>
                ))}
                <option disabled className="text-gray-900">──────────</option>
                <option value="new_trip" className="text-gray-900">➕ Nova Viagem...</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-200">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('settings')}
                className="p-2 hover:bg-blue-700 rounded-full transition-colors"
                title="Configurações"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className="p-2 hover:bg-blue-700 rounded-full transition-colors"
                title="Meu Perfil"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-300 flex items-center justify-center text-sm font-bold">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </div>
              </button>
            </div>
          </div>

          <div className="text-center py-4 relative">
            <span className="text-blue-100 text-sm font-medium">Saldo Total</span>
            <h2 className="text-4xl font-bold mt-1">
              $ {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </header>

        {/* Desktop Header/Trip Selector */}
        <header className="hidden md:flex justify-between items-center p-8 pb-0 max-w-7xl w-full mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {activeTab === 'dashboard' && 'Visão Geral'}
              {activeTab === 'exchange' && 'Câmbio & Conversão'}
              {activeTab === 'reports' && 'Relatórios e Análises'}
              {activeTab === 'history' && 'Histórico de Transações'}
              {activeTab === 'settings' && 'Ajustes da Viagem'}
              {activeTab === 'profile' && 'Meu Perfil'}
            </h1>
            <p className="text-gray-500 text-sm dark:text-gray-400">Gerencie suas finanças de viagem com facilidade</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={currentTripId || ''}
                onChange={handleTripChange}
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm hover:border-gray-300 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-600"
              >
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>
                    ✈️ {trip.name}
                  </option>
                ))}
                <option disabled>──────────</option>
                <option value="new_trip">➕ Nova Viagem...</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>

            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
              title="Nova Devolução"
            >
              <ArrowRightLeft size={20} />
              <span className="hidden lg:inline">Devolução</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              title="Nova Despesa"
            >
              <Plus size={20} />
              <span className="hidden lg:inline">Nova Despesa</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-7xl w-full mx-auto pb-32 md:pb-8 flex-1">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Wallets Cards (Horizontal Scroll) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                {wallets.map(wallet => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    balance={getWalletBalance(wallet.id)}
                  />
                ))}
              </div>

              <div className="grid md:grid-cols-12 gap-6">
                {/* Left Column: Quick Actions + Charts */}
                <div className="md:col-span-7 lg:col-span-8 space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 dark:text-gray-100">
                        <PieChart size={20} className="text-blue-500" />
                        Gastos por Categoria
                      </h3>
                    </div>
                    <div className="flex justify-center">
                      <DonutChart
                        data={categoryStats.map((cat, index) => ({
                          name: cat.name,
                          value: cat.value,
                          color: [
                            '#3B82F6', // blue-500
                            '#10B981', // emerald-500
                            '#F59E0B', // amber-500
                            '#EF4444', // red-500
                            '#8B5CF6', // violet-500
                            '#EC4899', // pink-500
                            '#6366F1', // indigo-500
                            '#14B8A6'  // teal-500
                          ][index % 8]
                        }))}
                        size={220}
                        strokeWidth={25}
                      />
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-6">
                      {categoryStats.slice(0, 4).map((cat, index) => (
                        <div key={cat.name} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: [
                                '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
                                '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
                              ][index % 8]
                            }}
                          ></div>
                          <span className="text-gray-600 truncate flex-1 dark:text-gray-400">{cat.name}</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{Math.round((cat.value / (totalBalance > 0 ? totalBalance : 1)) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200">Atividade Recente</h3>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-sm text-blue-600 font-medium hover:underline"
                    >
                      Ver Tudo
                    </button>
                  </div>
                  <TransactionList limit={5} onTransactionClick={handleOpenModal} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && <Reports />}

          {activeTab === 'profile' && <UserProfile />}

          {activeTab === 'exchange' && (
            <section className="max-w-2xl mx-auto">
              <ExchangeForm />
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PeopleManager />
                <PaymentMethodManager />
              </div>
              <div className="space-y-6">
                <CategoryManager />
                <TripManager />
              </div>
            </section>
          )}

          {activeTab === 'history' && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px] dark:bg-gray-900 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg dark:text-gray-100">Histórico Completo</h3>
              </div>
              <TransactionList onTransactionClick={handleOpenModal} />
            </section>
          )}
        </main>
      </div>

      {/* Mobile Floating Action Button (FAB) Group */}
      <div className="md:hidden fixed bottom-24 right-6 flex flex-col gap-3 z-50">
        <button
          onClick={() => setIsReturnModalOpen(true)}
          className="bg-green-600 text-white p-3 rounded-full shadow-xl hover:bg-green-700 transition-transform active:scale-95 flex items-center justify-center"
          title="Registrar Devolução"
        >
          <ArrowRightLeft size={24} />
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-transform active:scale-95 flex items-center justify-center"
          title="Nova Despesa"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-4 pb-6 z-50 dark:bg-gray-900 dark:border-gray-800">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <Home size={24} />
          <span className="text-xs font-medium">Início</span>
        </button>
        <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-1 ${activeTab === 'reports' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <PieChart size={24} />
          <span className="text-xs font-medium">Relatórios</span>
        </button>
        <button onClick={() => setActiveTab('exchange')} className={`flex flex-col items-center gap-1 ${activeTab === 'exchange' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <DollarSign size={24} />
          <span className="text-xs font-medium">Câmbio</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <Wallet size={24} />
          <span className="text-xs font-medium">Histórico</span>
        </button>
      </nav>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedTransaction}
      />

      <AddReturnModal
        isOpen={isReturnModalOpen}
        onClose={handleCloseModal}
        initialData={selectedTransaction}
      />

      {isCreateTripModalOpen && (
        <CreateTripModal
          onClose={() => setIsCreateTripModalOpen(false)}
        />
      )}
    </div>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  return (
    <ExpenseProvider key={user?.id}>
      <AppContent />
    </ExpenseProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <AuthenticatedApp />
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
