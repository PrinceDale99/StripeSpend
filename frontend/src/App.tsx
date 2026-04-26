import { useState, useEffect } from 'react';
import { isConnected, isAllowed, setAllowed, getAddress, getNetwork } from '@stellar/freighter-api';

export default function App() {
  const [hasFreighter, setHasFreighter] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [view, setView] = useState<'home' | 'stipends' | 'history'>('home');

  useEffect(() => {
    const initFreighter = async () => {
      try {
        const result = await isConnected();
        const connected = typeof result === 'boolean' ? result : result.isConnected;
        setHasFreighter(connected);
        
        if (connected) {
          const allowedResult = await isAllowed();
          const allowed = typeof allowedResult === 'boolean' ? allowedResult : allowedResult.isAllowed;
          if (allowed) {
            await fetchUserInfo();
          }
        }
      } catch (err) {
        console.error("Error initializing Freighter:", err);
      }
    };
    initFreighter();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const result = await getAddress();
      if (result && result.address) {
        setWalletAddress(result.address);
        const networkResult = await getNetwork();
        setNetwork(networkResult.network);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const handleConnect = async () => {
    if (!hasFreighter) {
      window.open('https://freighter.app/', '_blank');
      return;
    }
    setIsConnecting(true);
    try {
      const result = await setAllowed();
      const allowed = typeof result === 'boolean' ? result : result.isAllowed;
      if (allowed) {
        await fetchUserInfo();
      }
    } catch (err) {
      console.error("User denied connection", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-black font-sans selection:bg-brand-yellow selection:text-black">
      
      {/* Top Navbar */}
      <nav className="w-full bg-brand-bg border-b-[3px] border-black flex items-center justify-between px-8 py-4 sticky top-0 z-50">
        <div className="text-2xl font-black italic tracking-tight">StipeStream</div>
        
        <div className="flex gap-8 text-sm font-bold tracking-wide uppercase">
          <button onClick={() => setView('home')} className={`transition-colors ${view === 'home' ? 'text-black bg-brand-yellow px-3 py-1 border-[3px] border-black shadow-[2px_2px_0_0_#111]' : 'text-gray-600 hover:text-black px-3 py-1'}`}>HOME</button>
          <button onClick={() => setView('stipends')} className={`transition-colors ${view === 'stipends' ? 'text-black bg-brand-yellow px-3 py-1 border-[3px] border-black shadow-[2px_2px_0_0_#111]' : 'text-gray-600 hover:text-black px-3 py-1'}`}>STIPENDS</button>
          <button onClick={() => setView('history')} className={`transition-colors ${view === 'history' ? 'text-black bg-brand-yellow px-3 py-1 border-[3px] border-black shadow-[2px_2px_0_0_#111]' : 'text-gray-600 hover:text-black px-3 py-1'}`}>HISTORY</button>
        </div>

        <button 
          onClick={handleConnect}
          className="bg-[#111] text-white font-bold text-xs tracking-wider uppercase px-4 py-2 hover:bg-gray-800 transition-colors"
        >
          {walletAddress ? formatAddress(walletAddress) : isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {view === 'home' && <HomeView setView={setView} walletAddress={walletAddress} />}
        {view === 'stipends' && <StipendsView />}
        {view === 'history' && <HistoryView />}
      </main>

    </div>
  );
}

function HomeView({ setView, walletAddress }: { setView: (v: any) => void, walletAddress: string | null }) {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">Overview</h3>
        <h1 className="text-5xl font-black tracking-tight uppercase">Welcome, NGO Admin</h1>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-yellow brutal-border p-6 flex flex-col justify-between shadow-brutal min-h-[160px]">
          <div className="text-xs font-bold tracking-widest uppercase mb-4">Wallet Balance</div>
          <div>
            <div className="text-4xl font-black mb-1 flex items-center gap-2">
              <span className="w-8 h-2 bg-black inline-block"></span>
              USDC
            </div>
          </div>
          <a href="#" className="text-xs font-bold flex items-center gap-1 mt-4 hover:underline">
            ↗ VIEW ON EXPLORER
          </a>
        </div>
        
        <div className="brutal-card p-6 flex flex-col justify-between min-h-[160px]">
          <div className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">Active Stipends</div>
          <div>
            <div className="text-5xl font-black mb-1">0</div>
            <div className="text-xs font-bold tracking-widest uppercase text-gray-400">In-Flight</div>
          </div>
        </div>

        <div className="brutal-card p-6 flex flex-col justify-between min-h-[160px]">
          <div className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">Total Locked</div>
          <div>
            <div className="text-5xl font-black mb-1">0.00 <span className="text-2xl text-gray-500">USDC</span></div>
            <div className="text-xs font-bold tracking-widest uppercase text-gray-400">Across active stipends</div>
          </div>
        </div>
      </div>

      {/* Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="brutal-card p-8">
          <h2 className="text-2xl font-black mb-2 uppercase">Secure Disbursement</h2>
          <p className="text-gray-600 mb-6 font-medium">Lock funds for a student. Auto-releases every 30 days.</p>
          <button onClick={() => setView('stipends')} className="w-full brutal-button">NEW STIPEND +</button>
        </div>
        
        <div className="brutal-card p-8">
          <h2 className="text-2xl font-black mb-2 uppercase">Transaction History</h2>
          <p className="text-gray-600 mb-6 font-medium">Full ledger of past and active stipend payments.</p>
          <button onClick={() => setView('history')} className="w-full bg-white font-bold uppercase text-[#111] border-[3px] border-[#111] shadow-brutal transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] active:translate-y-1 active:shadow-none px-6 py-3">VIEW HISTORY</button>
        </div>
      </div>

      {/* Empty States */}
      <div className="space-y-6">
        <h2 className="text-3xl font-black uppercase">Active Stipends</h2>
        <div className="border-[3px] border-dashed border-black p-16 flex flex-col items-center justify-center text-center bg-black/5">
          <div className="w-8 h-10 border-[3px] border-gray-400 rounded-md relative mb-4 opacity-50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 border-[3px] border-gray-400 rounded-t-full border-b-0"></div>
          </div>
          <p className="text-gray-500 font-medium mb-6">No active stipends. Create one to get started.</p>
          <button onClick={() => setView('stipends')} className="brutal-button !py-2 !px-4 text-sm">NEW STIPEND +</button>
        </div>
      </div>

      <div className="space-y-6 pb-20">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-black uppercase">Recent Activity</h2>
          <button onClick={() => setView('history')} className="text-blue-600 font-bold text-sm hover:underline">VIEW ALL →</button>
        </div>
        <div className="brutal-border bg-white p-5 flex justify-between items-center">
          <div>
            <div className="font-bold text-sm uppercase mb-1">Business Profile Created: NGO Admin</div>
            <div className="text-xs text-gray-500 font-medium tracking-wide">APR 26, 2026, 10:35 PM</div>
          </div>
          <a href="#" className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline">
            ↗ Explorer
          </a>
        </div>
      </div>
    </div>
  );
}

function StipendsView() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <h1 className="text-5xl font-black tracking-tight uppercase">Secure Stipend</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Entry Form */}
        <div className="brutal-card p-8">
          <h2 className="text-2xl font-black mb-8 uppercase">Transaction Entry</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2">Student Stellar Address</label>
              <input type="text" placeholder="G...ABCD" className="brutal-input" />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2">Amount (USDC)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">$</span>
                <input type="text" placeholder="0.00" className="brutal-input pl-8" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2">Release Interval (Auto-Release)</label>
              <div className="grid grid-cols-3 gap-4">
                <button className="brutal-border bg-white py-3 font-bold text-sm hover:bg-gray-50">30D</button>
                <button className="brutal-border bg-brand-yellow py-3 font-bold text-sm shadow-[2px_2px_0_0_#111]">60D</button>
                <button className="brutal-border bg-white py-3 font-bold text-sm hover:bg-gray-50">90D</button>
              </div>
            </div>

            <button className="w-full bg-brand-lightYellow text-black/40 font-bold uppercase border-[3px] border-black/40 py-4 mt-4 cursor-not-allowed">
              INITIALIZE STIPEND →
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="brutal-border bg-brand-bg p-8 shadow-brutal relative overflow-hidden">
          {/* Subtle diagonal lines background effect */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
          
          <h2 className="text-2xl font-black mb-8 uppercase relative z-10">Transaction Summary</h2>
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-600">Payment amount</span>
              <span className="font-bold">0.00 USDC</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium pb-6 border-b-[3px] border-black">
              <span className="text-gray-600">Network Fee (~0.1%)</span>
              <span className="font-bold">0.00 USDC</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-lg">Total to Lock</span>
              <span className="text-2xl font-black text-gray-500">0.00 USDC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryView() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">Ledger</h3>
        <h1 className="text-5xl font-black tracking-tight uppercase">Transaction History</h1>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-black uppercase">All Stipends</h2>
        <div className="border-[3px] border-dashed border-black p-16 flex flex-col items-center justify-center text-center bg-black/5">
          <div className="w-8 h-10 border-[3px] border-gray-400 opacity-50 relative mb-4 flex items-center justify-center">
             <div className="w-4 h-1 bg-gray-400 absolute top-2"></div>
             <div className="w-4 h-1 bg-gray-400 absolute top-4"></div>
             <div className="w-4 h-1 bg-gray-400 absolute top-6"></div>
          </div>
          <p className="text-gray-500 font-medium">No stipends yet.</p>
        </div>
      </div>

      <div className="space-y-6 pb-20">
        <h2 className="text-3xl font-black uppercase">Activity Log</h2>
        <div className="brutal-border bg-white p-5 flex justify-between items-center">
          <div>
            <div className="font-bold text-sm mb-1">Business profile created: NGO Admin</div>
            <div className="text-xs text-gray-500 font-medium tracking-wide uppercase">APR 26, 2026, 10:35 PM</div>
          </div>
          <div className="border-[2px] border-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            USER REGISTERED
          </div>
        </div>
      </div>
    </div>
  );
}
