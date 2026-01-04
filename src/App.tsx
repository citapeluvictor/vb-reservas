
import React, { useState } from 'react';
import Header from './components/Header';
import BookingForm from './components/BookingForm';
import AdminGuide from './components/AdminGuide';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [view, setView] = useState<'booking' | 'guide'>('booking');

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative">
      <Header setView={setView} activeView={view} />
      
      <main className="flex-grow p-4 overflow-y-auto pb-24">
        {view === 'booking' ? (
          <BookingForm />
        ) : (
          <AdminGuide />
        )}
      </main>

      <Footer setView={setView} activeView={view} />
    </div>
  );
};

export default App;
