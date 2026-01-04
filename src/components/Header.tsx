
import React from 'react';
import { BUSINESS_INFO } from '../constants';

interface HeaderProps {
  setView: (view: 'booking' | 'guide') => void;
  activeView: string;
}

import logo from '../assets/Logo_pelu_victor.jpeg';

const Header: React.FC<HeaderProps> = ({ setView, activeView }) => {
  return (
    <header className="bg-stone-900 text-white p-6 shadow-md border-b border-stone-800">
      <div className="flex justify-center items-center mb-4">
        <img src={logo} alt="VB Peluquería" className="h-12 w-auto object-contain" />
      </div>
      <p className="text-amber-500 text-xs font-black uppercase tracking-[0.2em] mb-4">Fresh cuts. Real style.</p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setView('booking')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeView === 'booking' ? 'bg-amber-500 text-stone-900 shadow-lg shadow-amber-500/20' : 'bg-stone-800 text-stone-400 opacity-60'}`}
        >
          Reservar
        </button>
        <button
          onClick={() => setView('guide')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeView === 'guide' ? 'bg-amber-500 text-stone-900 shadow-lg shadow-amber-500/20' : 'bg-stone-800 text-stone-400 opacity-60'}`}
        >
          Info
        </button>
      </div>
    </header>
  );
};

export default Header;
