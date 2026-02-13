import { useState } from 'react';
import { useExpenses } from './context/ExpenseContext';
import { Plus, Settings, Home, DollarSign } from 'lucide-react';
// Will create these components next
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import ExchangeForm from './components/ExchangeForm';
import PeopleManager from './components/PeopleManager';
import CategoryManager from './components/CategoryManager';
import WalletCard from './components/WalletCard';

function App() {
  const { wallets, getWalletBalance } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exchange' | 'settings' | 'history'>('dashboard');

  const totalBalance = wallets.reduce((acc, w) => acc + getWalletBalance(w.id), 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Travel Money</h1>
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="text-center py-4 relative">
          <p className="text-blue-100 text-sm mb-1">Total Balance</p>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-4xl font-bold">${totalBalance.toFixed(2)}</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto space-y-6">

        {/* Wallets */}
        {activeTab === 'dashboard' && (
          <section className="grid grid-cols-2 gap-4">
            {wallets.map(wallet => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                balance={getWalletBalance(wallet.id)}
              />
            ))}
          </section>
        )}

        {/* Exchange Tab */}
        {activeTab === 'exchange' && (
          <section>
            <ExchangeForm />
          </section>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <section className="space-y-6">
            <PeopleManager />
            <CategoryManager />
          </section>
        )}

        {/* Recent Transactions / History */}
        {(activeTab === 'dashboard' || activeTab === 'history') && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">
                {activeTab === 'dashboard' ? 'Recent Activity' : 'Transaction History'}
              </h3>
              {activeTab === 'dashboard' ? (
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-sm text-blue-600 font-medium"
                >
                  See All
                </button>
              ) : null}
            </div>
            <TransactionList limit={activeTab === 'dashboard' ? 5 : undefined} />
          </section>
        )}

      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center p-4 pb-6 z-40">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Home</span>
        </button>

        <div className="relative -top-5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-transform active:scale-95"
          >
            <Plus size={28} />
          </button>
        </div>

        <button
          onClick={() => setActiveTab('exchange')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'exchange' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <DollarSign size={24} />
          <span className="text-xs font-medium">Câmbio</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Settings size={24} />
          <span className="text-xs font-medium">Config</span>
        </button>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <AddTransactionModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
