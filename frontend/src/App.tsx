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
    <div className="min-h-screen bg-bauhaus-bg text-bauhaus-black font-sans flex flex-col selection:bg-bauhaus-yellow">
      
      {/* Bauhaus Geometric Header */}
      <header className="w-full grid grid-cols-12 border-b-8 border-bauhaus-black bg-bauhaus-white">
        <div className="col-span-12 md:col-span-3 bg-bauhaus-red p-8 flex items-center justify-center">
          <div className="text-bauhaus-white text-3xl font-black uppercase tracking-[0.2em] break-all leading-none">
            Stipe<br/>Stream
          </div>
        </div>
        
        <div className="col-span-12 md:col-span-6 p-8 flex items-end">
          <nav className="flex gap-12 text-sm font-bold tracking-[0.3em] uppercase">
            <button 
              onClick={() => setView('home')} 
              className={`hover:text-bauhaus-red transition-colors ${view === 'home' ? 'text-bauhaus-red border-b-4 border-bauhaus-red pb-1' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => setView('stipends')} 
              className={`hover:text-bauhaus-blue transition-colors ${view === 'stipends' ? 'text-bauhaus-blue border-b-4 border-bauhaus-blue pb-1' : ''}`}
            >
              Stipends
            </button>
            <button 
              onClick={() => setView('history')} 
              className={`hover:text-bauhaus-yellow transition-colors ${view === 'history' ? 'text-bauhaus-yellow border-b-4 border-bauhaus-yellow pb-1' : ''}`}
            >
              Ledger
            </button>
          </nav>
        </div>

        <div className="col-span-12 md:col-span-3 bg-bauhaus-yellow p-8 flex items-center justify-center">
          <button 
            onClick={handleConnect}
            className="w-full bg-bauhaus-black text-bauhaus-white font-bold text-xs tracking-[0.2em] uppercase px-4 py-4 hover:bg-gray-800 transition-colors"
          >
            {walletAddress ? formatAddress(walletAddress) : isConnecting ? 'Connecting' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow bauhaus-container w-full">
        {view === 'home' && <HomeView setView={setView} />}
        {view === 'stipends' && <StipendsView />}
        {view === 'history' && <HistoryView />}
      </main>

    </div>
  );
}

function HomeView({ setView }: { setView: (v: any) => void }) {
  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-700">
      
      {/* Title Section */}
      <div className="col-span-12 md:col-span-8 flex flex-col justify-center mb-8">
        <h3 className="text-bauhaus-red font-bold tracking-[0.3em] uppercase mb-4 text-sm">Dashboard</h3>
        <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9]">
          NGO<br/>Admin<br/>Portal
        </h1>
      </div>

      {/* Geometric Element */}
      <div className="col-span-12 md:col-span-4 flex items-center justify-center hidden md:flex">
        <div className="w-48 h-48 rounded-full bg-bauhaus-blue"></div>
      </div>

      {/* Stats Blocks */}
      <div className="col-span-12 md:col-span-4 bg-bauhaus-white border-l-8 border-bauhaus-blue p-10">
        <div className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">Total Locked</div>
        <div className="text-5xl font-black mb-2">0.00</div>
        <div className="text-sm font-bold tracking-widest text-bauhaus-blue">USDC</div>
      </div>

      <div className="col-span-12 md:col-span-4 bg-bauhaus-black text-bauhaus-white p-10">
        <div className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-6">Active Stipends</div>
        <div className="text-5xl font-black mb-2">0</div>
        <div className="text-sm font-bold tracking-widest text-bauhaus-yellow">IN-FLIGHT</div>
      </div>

      <div className="col-span-12 md:col-span-4 bg-bauhaus-yellow p-10 flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-bauhaus-black mb-6">Action</div>
          <h2 className="text-2xl font-black uppercase mb-4 leading-tight">Create<br/>Stipend</h2>
        </div>
        <button onClick={() => setView('stipends')} className="bauhaus-btn-black bg-bauhaus-black text-bauhaus-white font-bold uppercase tracking-[0.2em] text-xs px-6 py-4 hover:bg-gray-800 transition-colors mt-8">
          Initialize
        </button>
      </div>

      {/* Activity Bar */}
      <div className="col-span-12 border-t-4 border-b-4 border-bauhaus-black py-6 mt-8 flex justify-between items-center bg-bauhaus-white px-8">
        <div>
          <span className="font-black uppercase tracking-widest text-bauhaus-red mr-4">LATEST</span>
          <span className="text-sm font-bold uppercase tracking-wider text-gray-600">Business Profile Created</span>
        </div>
        <button onClick={() => setView('history')} className="text-xs font-bold tracking-[0.2em] uppercase hover:text-bauhaus-blue">
          View Log
        </button>
      </div>
    </div>
  );
}

function StipendsView() {
  return (
    <div className="grid grid-cols-12 gap-0 animate-in fade-in duration-700 bg-bauhaus-white shadow-2xl">
      
      {/* Left Form Side */}
      <div className="col-span-12 md:col-span-7 p-12 lg:p-20 border-r-8 border-bauhaus-black">
        <h1 className="text-5xl font-black uppercase mb-16 leading-none">
          Secure<br/>Stipend
        </h1>
        
        <div className="space-y-12">
          <div>
            <label className="block text-xs font-bold tracking-[0.2em] uppercase mb-4 text-bauhaus-blue">Student Address</label>
            <input type="text" placeholder="G..." className="bauhaus-input" />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[0.2em] uppercase mb-4 text-bauhaus-red">Amount (USDC)</label>
            <input type="text" placeholder="0.00" className="bauhaus-input text-4xl" />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[0.2em] uppercase mb-6">Release Interval</label>
            <div className="flex gap-4">
              <button className="flex-1 border-2 border-bauhaus-black py-4 font-black text-lg hover:bg-bauhaus-black hover:text-bauhaus-white transition-colors">30D</button>
              <button className="flex-1 bg-bauhaus-yellow border-2 border-bauhaus-yellow py-4 font-black text-lg text-bauhaus-black">60D</button>
              <button className="flex-1 border-2 border-bauhaus-black py-4 font-black text-lg hover:bg-bauhaus-black hover:text-bauhaus-white transition-colors">90D</button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Summary Side */}
      <div className="col-span-12 md:col-span-5 bg-bauhaus-bg flex flex-col relative overflow-hidden">
        {/* Geometric accent */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-bauhaus-red rounded-full opacity-10"></div>
        
        <div className="p-12 flex-grow">
          <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-12 border-b-2 border-bauhaus-black pb-4">Summary</h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Payment</span>
              <span className="font-black text-xl">0.00 USDC</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Network Fee</span>
              <span className="font-black text-xl">0.00 USDC</span>
            </div>
          </div>
        </div>

        <div className="p-12 bg-bauhaus-black text-bauhaus-white mt-auto">
          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-bauhaus-yellow">Total Lock</div>
          <div className="text-4xl font-black mb-8">0.00 USDC</div>
          <button className="w-full bg-bauhaus-white text-bauhaus-black font-black uppercase tracking-[0.2em] py-5 hover:bg-gray-200 transition-colors">
            Initialize
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryView() {
  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-700">
      
      <div className="col-span-12 flex items-center justify-between mb-8 border-b-8 border-bauhaus-black pb-8">
        <h1 className="text-5xl md:text-7xl font-black uppercase leading-none">Ledger</h1>
        <div className="w-16 h-16 bg-bauhaus-red transform rotate-45"></div>
      </div>

      <div className="col-span-12 md:col-span-8 bg-bauhaus-white p-12 border-l-8 border-bauhaus-yellow">
        <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-12">All Stipends</h2>
        
        <div className="py-20 flex flex-col items-center justify-center border-4 border-dashed border-gray-300">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-6"></div>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">Empty Ledger</p>
        </div>
      </div>

      <div className="col-span-12 md:col-span-4 bg-bauhaus-black text-bauhaus-white p-12">
        <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-12 text-bauhaus-blue">Activity</h2>
        
        <div className="border-l-2 border-bauhaus-white pl-6 relative">
          <div className="absolute w-3 h-3 bg-bauhaus-red rounded-full -left-[7px] top-1"></div>
          <div className="text-xs font-bold tracking-[0.2em] text-bauhaus-yellow mb-2">USER REGISTERED</div>
          <div className="text-sm font-bold uppercase tracking-wider mb-1">NGO Admin Profile</div>
          <div className="text-xs text-gray-500 font-mono">APR 26, 2026</div>
        </div>
      </div>

    </div>
  );
}
