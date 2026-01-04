
import React from 'react';

interface FooterProps {
  setView: (view: 'booking' | 'guide') => void;
  activeView: string;
}

const Footer: React.FC<FooterProps> = ({ setView, activeView }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-stone-200 flex flex-col items-center z-50">
      <div className="flex justify-around items-center w-full py-3">
        <button 
          onClick={() => setView('booking')}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'booking' ? 'text-amber-600 scale-110' : 'text-stone-400'}`}
        >
          <i className="fa-solid fa-calendar-day text-xl"></i>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Reservar</span>
        </button>

        <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center -mt-8 shadow-lg border-4 border-white">
           <i className="fa-solid fa-scissors text-amber-500"></i>
        </div>

        <button 
          onClick={() => setView('guide')}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'guide' ? 'text-amber-600 scale-110' : 'text-stone-400'}`}
        >
          <i className="fa-solid fa-circle-info text-xl"></i>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Info</span>
        </button>
      </div>
      
      {/* Créditos discretos en el footer */}
      <div className="pb-2 flex flex-col items-center scale-90 opacity-60">
        <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest">
          Creado por <a href="https://iaedulab.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">IAEdulab</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
