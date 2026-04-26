import { useState, useEffect } from 'react';
import { isConnected, isAllowed, setAllowed, getAddress, getNetwork } from '@stellar/freighter-api';
import confetti from 'canvas-confetti';

export default function App() {
  const [hasFreighter, setHasFreighter] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [view, setView] = useState<'landing' | 'student' | 'donor'>('landing');

  // Modals state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [txModal, setTxModal] = useState<{ show: boolean, status: 'pending' | 'success' | 'failed', message: string }>({ show: false, status: 'pending', message: '' });
  const [showNetworkPrompt, setShowNetworkPrompt] = useState(false);

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
        if (networkResult.network !== 'TESTNET') {
          setShowNetworkPrompt(true);
        }
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const handleConnect = async (walletType: string) => {
    setShowConnectModal(false);
    if (walletType === 'freighter') {
      if (!hasFreighter) {
        window.open('https://freighter.app/', '_blank');
        return;
      }
      try {
        const result = await setAllowed();
        const allowed = typeof result === 'boolean' ? result : result.isAllowed;
        if (allowed) {
          await fetchUserInfo();
        }
      } catch (err) {
        console.error("User denied connection", err);
      }
    } else {
      // Simulate other wallets
      setTimeout(() => {
        setWalletAddress('G' + Math.random().toString(36).substring(2, 12).toUpperCase());
        setNetwork('TESTNET');
      }, 500);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const triggerTx = (actionName: string, success: boolean = true) => {
    setTxModal({ show: true, status: 'pending', message: `Waiting for blockchain confirmation... (usually takes ~5 seconds)` });
    setTimeout(() => {
      if (success) {
        setTxModal({ show: true, status: 'success', message: `${actionName} confirmed! View on Stellar Explorer.` });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D92525', '#1C3B7B', '#EBB61A']
        });
      } else {
        setTxModal({ show: true, status: 'failed', message: `Network busy. Could not process ${actionName}. Please try again.` });
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-bauhaus-bg text-bauhaus-black font-sans flex flex-col selection:bg-bauhaus-yellow relative">
      
      {/* Bauhaus Geometric Header */}
      <header className="w-full grid grid-cols-12 border-b-8 border-bauhaus-black bg-bauhaus-white sticky top-0 z-40">
        <div className="col-span-12 md:col-span-3 bg-bauhaus-red p-6 flex items-center justify-center">
          <div className="text-bauhaus-white text-2xl font-black uppercase tracking-[0.2em] break-all leading-none">
            Stipe<br/>Stream
          </div>
        </div>
        
        <div className="col-span-12 md:col-span-6 p-6 flex items-end">
          <nav className="flex gap-8 text-xs font-bold tracking-[0.3em] uppercase">
            <button onClick={() => setView('landing')} className={`hover:text-bauhaus-red transition-colors ${view === 'landing' ? 'text-bauhaus-red border-b-4 border-bauhaus-red pb-1' : ''}`}>Home</button>
            <button onClick={() => setView('student')} className={`hover:text-bauhaus-blue transition-colors ${view === 'student' ? 'text-bauhaus-blue border-b-4 border-bauhaus-blue pb-1' : ''}`}>Student</button>
            <button onClick={() => setView('donor')} className={`hover:text-bauhaus-yellow transition-colors ${view === 'donor' ? 'text-bauhaus-yellow border-b-4 border-bauhaus-yellow pb-1' : ''}`}>Donor</button>
          </nav>
        </div>

        <div className="col-span-12 md:col-span-3 bg-bauhaus-yellow p-6 flex items-center justify-center">
          <button 
            onClick={() => walletAddress ? null : setShowConnectModal(true)}
            className="w-full bg-bauhaus-black text-bauhaus-white font-bold text-xs tracking-[0.2em] uppercase px-4 py-4 hover:bg-gray-800 transition-colors"
          >
            {walletAddress ? formatAddress(walletAddress) : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow bauhaus-container w-full">
        {view === 'landing' && <LandingView setView={setView} />}
        {view === 'student' && <StudentDashboard triggerTx={triggerTx} />}
        {view === 'donor' && <DonorDashboard triggerTx={triggerTx} />}
      </main>

      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-bauhaus-white border-8 border-bauhaus-black p-8 w-full max-w-md">
            <h2 className="text-2xl font-black uppercase mb-6 tracking-widest text-bauhaus-blue">Connect Wallet</h2>
            <div className="space-y-4">
              <button onClick={() => handleConnect('freighter')} className="w-full border-4 border-bauhaus-black p-4 font-bold uppercase tracking-widest hover:bg-bauhaus-black hover:text-white transition-colors flex justify-between items-center">
                <span>Freighter (Stellar)</span>
                {hasFreighter ? <span className="w-3 h-3 bg-green-500 rounded-full"></span> : <span className="text-xs text-gray-400">Install</span>}
              </button>
              <button onClick={() => handleConnect('social')} className="w-full bg-bauhaus-red text-white p-4 font-bold uppercase tracking-widest hover:bg-red-800 transition-colors">
                Social Login (Google/Apple)
              </button>
              <button onClick={() => handleConnect('metamask')} className="w-full bg-bauhaus-yellow p-4 font-bold uppercase tracking-widest hover:bg-yellow-500 transition-colors">
                MetaMask / WalletConnect
              </button>
            </div>
            <button onClick={() => setShowConnectModal(false)} className="mt-8 text-xs font-bold uppercase tracking-widest underline w-full text-center">Cancel</button>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {txModal.show && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`border-8 border-bauhaus-black p-10 w-full max-w-md ${txModal.status === 'success' ? 'bg-bauhaus-white' : txModal.status === 'failed' ? 'bg-bauhaus-red text-white' : 'bg-bauhaus-yellow'}`}>
            <h2 className="text-3xl font-black uppercase mb-4 tracking-widest">
              {txModal.status === 'pending' ? 'Pending...' : txModal.status === 'success' ? 'Success!' : 'Failed'}
            </h2>
            <p className="font-bold text-sm tracking-widest uppercase opacity-80 mb-8">{txModal.message}</p>
            {txModal.status !== 'pending' && (
              <button onClick={() => setTxModal({ ...txModal, show: false })} className="bauhaus-btn-black bg-bauhaus-black text-bauhaus-white font-bold uppercase tracking-[0.2em] px-8 py-4 w-full">
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Network Prompt */}
      {showNetworkPrompt && (
        <div className="fixed bottom-8 right-8 bg-bauhaus-blue text-white border-4 border-bauhaus-black p-6 shadow-2xl max-w-sm z-50 animate-in slide-in-from-bottom-10">
          <h3 className="font-black uppercase tracking-widest mb-2">Wrong Network</h3>
          <p className="text-xs mb-4 opacity-90 font-bold uppercase">StipeStream requires the Stellar Testnet. Please switch networks in your wallet.</p>
          <div className="flex gap-4">
            <button onClick={() => setShowNetworkPrompt(false)} className="bg-bauhaus-yellow text-bauhaus-black font-bold uppercase tracking-widest px-4 py-2 text-xs w-full">Switch Network</button>
            <button onClick={() => setShowNetworkPrompt(false)} className="border-2 border-white font-bold uppercase tracking-widest px-4 py-2 text-xs w-full">Dismiss</button>
          </div>
        </div>
      )}

    </div>
  );
}

function LandingView({ setView }: { setView: (v: any) => void }) {
  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <div className="col-span-12 md:col-span-9 flex flex-col justify-center mb-8 border-l-8 border-bauhaus-red pl-8 md:pl-16 py-12">
        <h3 className="text-bauhaus-red font-bold tracking-[0.4em] uppercase mb-6 text-sm">Why Web3? Because transparency matters.</h3>
        <h1 className="text-5xl md:text-7xl font-black uppercase leading-[1.1]">
          Transparent, Global Scholarships Powered by the Blockchain.
        </h1>
        <p className="mt-8 text-lg font-bold uppercase tracking-widest max-w-2xl text-gray-600">
          Faster cross-border payments. Absolute transparency. Programmable milestones without the crypto jargon.
        </p>
      </div>

      <div className="col-span-12 md:col-span-3 flex items-center justify-center hidden md:flex">
        <div className="w-full h-full min-h-[300px] bg-bauhaus-blue rounded-full"></div>
      </div>

      {/* Live Treasury Stats */}
      <div className="col-span-12 mt-8 mb-4 border-t-8 border-bauhaus-black pt-8">
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] mb-8">Live Treasury Stats</h2>
      </div>

      <div className="col-span-12 md:col-span-4 bg-bauhaus-white border-l-8 border-bauhaus-blue p-10">
        <div className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-6">Total Funds Locked (TVL)</div>
        <div className="text-4xl md:text-5xl font-black mb-2">245,000</div>
        <div className="text-sm font-bold tracking-widest text-bauhaus-blue">USDC</div>
      </div>

      <div className="col-span-12 md:col-span-4 bg-bauhaus-black text-bauhaus-white p-10">
        <div className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-6">Scholarships Distributed</div>
        <div className="text-4xl md:text-5xl font-black mb-2">1,402</div>
        <div className="text-sm font-bold tracking-widest text-bauhaus-yellow">SUCCESSFUL CLAIMS</div>
      </div>

      <div className="col-span-12 md:col-span-4 bg-bauhaus-yellow p-10 flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-bauhaus-black mb-6">Active Students</div>
          <div className="text-4xl md:text-5xl font-black mb-2">340</div>
        </div>
        <button onClick={() => setView('donor')} className="bg-bauhaus-black text-bauhaus-white font-bold uppercase tracking-[0.2em] text-xs px-6 py-4 hover:bg-gray-800 transition-colors mt-8">
          Fund a Scholar
        </button>
      </div>

      {/* Trust Signals */}
      <div className="col-span-12 border-4 border-bauhaus-black py-8 mt-12 flex flex-col md:flex-row justify-around items-center bg-bauhaus-white gap-8 px-8">
        <div className="text-center">
          <span className="font-black uppercase tracking-widest text-gray-400 block mb-2">Built On</span>
          <span className="text-xl font-bold uppercase tracking-wider text-bauhaus-black">Stellar Soroban</span>
        </div>
        <div className="w-2 h-2 bg-bauhaus-red rounded-full hidden md:block"></div>
        <div className="text-center">
          <span className="font-black uppercase tracking-widest text-gray-400 block mb-2">Audited By</span>
          <span className="text-xl font-bold uppercase tracking-wider text-bauhaus-black">CertiK & OpenZeppelin</span>
        </div>
        <div className="w-2 h-2 bg-bauhaus-blue rounded-full hidden md:block"></div>
        <div className="text-center">
          <span className="font-black uppercase tracking-widest text-gray-400 block mb-2">Partners</span>
          <span className="text-xl font-bold uppercase tracking-wider text-bauhaus-black">Global Universities</span>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ triggerTx }: { triggerTx: (action: string, success?: boolean) => void }) {
  return (
    <div className="grid grid-cols-12 gap-0 animate-in fade-in duration-700 bg-bauhaus-white shadow-2xl border-8 border-bauhaus-black">
      
      {/* Left Side: Identity & Milestones */}
      <div className="col-span-12 md:col-span-7 p-12 border-b-8 md:border-b-0 md:border-r-8 border-bauhaus-black bg-bauhaus-bg">
        <h1 className="text-4xl font-black uppercase mb-12 leading-none text-bauhaus-blue">
          Scholar<br/>Dashboard
        </h1>
        
        {/* Decentralized Identity */}
        <div className="mb-12 bg-bauhaus-white border-4 border-bauhaus-black p-8">
          <h2 className="text-xl font-black uppercase tracking-[0.2em] mb-4">DID / KYC Profile</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">zk-Proof Verification: Prove student status without revealing personal data on-chain.</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-black">✓</div>
            <div>
              <div className="font-bold uppercase tracking-widest">Verified Scholar</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">University of Metro Manila</div>
            </div>
          </div>
        </div>

        {/* Milestone Tracker */}
        <div>
          <h2 className="text-xl font-black uppercase tracking-[0.2em] mb-6">Semester Milestones</h2>
          <div className="space-y-6">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div><span className="text-xs font-bold inline-block uppercase text-bauhaus-red tracking-widest">Year 1 - Fall Tranche</span></div>
                <div className="text-right"><span className="text-xs font-bold inline-block text-bauhaus-red">100%</span></div>
              </div>
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-none bg-gray-200 border-2 border-bauhaus-black">
                <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-bauhaus-red"></div>
              </div>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div><span className="text-xs font-bold inline-block uppercase text-bauhaus-blue tracking-widest">Year 1 - Spring Tranche (Awaiting Transcript)</span></div>
                <div className="text-right"><span className="text-xs font-bold inline-block text-bauhaus-blue">0%</span></div>
              </div>
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-none bg-gray-200 border-2 border-bauhaus-black">
                <div style={{ width: "0%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-bauhaus-blue"></div>
              </div>
            </div>
            <button onClick={() => triggerTx('Upload zk-Transcript')} className="bauhaus-btn-secondary px-4 py-3 border-2 border-bauhaus-black hover:border-bauhaus-black">
              Upload Transcript Proof
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Claiming & Off-Ramp */}
      <div className="col-span-12 md:col-span-5 flex flex-col">
        <div className="p-12 flex-grow bg-bauhaus-white">
          <h2 className="text-xl font-black tracking-[0.2em] uppercase mb-8">Claim Funds</h2>
          
          <div className="bg-bauhaus-yellow border-4 border-bauhaus-black p-8 text-center mb-8">
            <div className="text-xs font-bold uppercase tracking-widest mb-2 text-bauhaus-black">Available to Withdraw</div>
            <div className="text-5xl font-black mb-2 text-bauhaus-black">1,000</div>
            <div className="text-sm font-bold tracking-widest uppercase mb-4 text-bauhaus-black">USDC</div>
            <div className="text-xs font-black tracking-[0.2em] bg-bauhaus-white inline-block px-4 py-2 border-2 border-bauhaus-black text-bauhaus-black">
              ~ $1,000 USD
            </div>
          </div>

          <div className="text-center mb-8">
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
               Gas Fee Handling
             </p>
             <p className="text-xs font-bold text-bauhaus-blue uppercase tracking-widest border border-bauhaus-blue p-2 inline-block">
               Gas fees sponsored by StipeStream Paymaster. You pay 0 ETH/XLM.
             </p>
          </div>

          <button onClick={() => triggerTx('Scholarship Claim')} className="w-full bg-bauhaus-red text-white font-black uppercase tracking-[0.2em] py-6 hover:bg-red-800 transition-colors border-4 border-bauhaus-black mb-6">
            Claim 1,000 USDC
          </button>

          {/* Fiat Off-Ramps */}
          <div className="border-t-4 border-bauhaus-black pt-8">
             <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-center">Fiat Off-Ramps</h3>
             <button onClick={() => triggerTx('Bank Withdrawal Initiation')} className="w-full bg-bauhaus-white border-4 border-bauhaus-black text-bauhaus-black font-black uppercase tracking-[0.2em] py-4 hover:bg-gray-100 transition-colors flex justify-center items-center gap-2">
                Withdraw to Bank (Stripe Crypto)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DonorDashboard({ triggerTx }: { triggerTx: (action: string, success?: boolean) => void }) {
  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-700">
      
      <div className="col-span-12 flex flex-col md:flex-row items-start md:items-center justify-between mb-4 border-b-8 border-bauhaus-black pb-8">
        <h1 className="text-5xl md:text-7xl font-black uppercase leading-none text-bauhaus-red">Sponsor<br/>Dashboard</h1>
        <div className="mt-8 md:mt-0 text-right">
          <div className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">Your Impact Level</div>
          <div className="text-2xl font-black uppercase tracking-widest">Visionary</div>
        </div>
      </div>

      {/* Fund Allocation Visualization */}
      <div className="col-span-12 bg-bauhaus-white p-12 border-4 border-bauhaus-black">
        <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-12">Fund Allocation</h2>
        
        {/* Simple Flowchart using Bauhaus Blocks */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="bg-bauhaus-blue p-6 text-center text-white w-full border-4 border-bauhaus-black">
             <div className="text-xs font-bold tracking-widest uppercase mb-2">Treasury Deposit</div>
             <div className="text-2xl font-black">50,000 USDC</div>
           </div>
           
           <div className="w-2 h-12 md:w-12 md:h-2 bg-bauhaus-black"></div>

           <div className="flex flex-col gap-4 w-full">
             <div className="bg-bauhaus-white border-4 border-bauhaus-black p-4 text-center">
                <div className="text-xs font-bold tracking-widest uppercase text-bauhaus-red">Computer Science Pool</div>
                <div className="font-black">25,000 USDC</div>
             </div>
             <div className="bg-bauhaus-white border-4 border-bauhaus-black p-4 text-center">
                <div className="text-xs font-bold tracking-widest uppercase text-bauhaus-yellow">Engineering Pool</div>
                <div className="font-black">25,000 USDC</div>
             </div>
           </div>

           <div className="w-2 h-12 md:w-12 md:h-2 bg-bauhaus-black"></div>

           <div className="bg-bauhaus-red text-white p-6 text-center w-full border-4 border-bauhaus-black">
             <div className="text-xs font-bold tracking-widest uppercase mb-2">Student Wallets</div>
             <div className="text-2xl font-black">50 Scholars Funded</div>
           </div>
        </div>
      </div>

      {/* One-Click Funding */}
      <div className="col-span-12 md:col-span-8 bg-bauhaus-blue text-white p-12 border-4 border-bauhaus-black">
        <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-8">One-Click Funding</h2>
        <div className="flex flex-col md:flex-row gap-6">
           <div className="flex-1">
             <label className="block text-xs font-bold tracking-[0.2em] uppercase mb-4 text-bauhaus-yellow">Select Pool</label>
             <select className="w-full bg-transparent border-b-4 border-white p-4 text-xl font-bold focus:outline-none appearance-none">
               <option className="text-black">General Scholarship Fund</option>
               <option className="text-black">STEM Scholars</option>
               <option className="text-black">Arts & Humanities</option>
             </select>
           </div>
           <div className="flex-1">
             <label className="block text-xs font-bold tracking-[0.2em] uppercase mb-4 text-bauhaus-red">Deposit Amount (USDC)</label>
             <input type="number" placeholder="1000" className="w-full bg-transparent border-b-4 border-white p-4 text-xl font-bold focus:outline-none placeholder:text-gray-400" />
           </div>
        </div>
        <button onClick={() => triggerTx('USDC Deposit')} className="mt-12 bg-bauhaus-yellow text-bauhaus-black font-black uppercase tracking-[0.2em] py-6 px-12 border-4 border-bauhaus-black hover:bg-white transition-colors">
          Fund Protocol
        </button>
      </div>

      {/* Impact NFTs */}
      <div className="col-span-12 md:col-span-4 bg-bauhaus-yellow text-bauhaus-black p-12 border-4 border-bauhaus-black flex flex-col justify-center items-center text-center">
        <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-8">Impact NFT Badge</h2>
        
        {/* Dynamic NFT Visual */}
        <div className="w-48 h-48 border-8 border-bauhaus-black bg-bauhaus-white relative mb-8 overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-bauhaus-red group-hover:h-3/4 transition-all duration-1000"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-full bg-bauhaus-blue group-hover:w-3/4 transition-all duration-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-bauhaus-yellow rounded-full border-4 border-bauhaus-black"></div>
        </div>

        <p className="text-xs font-bold tracking-widest uppercase leading-loose">
          This digital badge updates dynamically as your funded students pass milestones and graduate.
        </p>
      </div>

    </div>
  );
}
