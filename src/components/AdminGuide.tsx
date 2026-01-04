
import React from 'react';
import { SERVICES, BUSINESS_INFO } from '../constants';

const AdminGuide: React.FC = () => {
  return (
    <div className="animate-in slide-in-from-right-8 duration-500 pb-20 px-2">
      <div className="text-center mb-10">
        <i className="fa-solid fa-circle-info text-5xl text-amber-600 mb-4"></i>
        <h2 className="text-3xl font-bold uppercase tracking-tighter">Información</h2>
        <p className="text-stone-500 italic">Detalles de contacto y servicios</p>
      </div>
      
      <div className="space-y-6">
        {/* Sección de Contacto Directo */}
        <section className="bg-white p-6 rounded-3xl border-2 border-amber-500 shadow-xl text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <h3 className="text-lg font-black mb-4 flex items-center justify-center gap-3 text-stone-900 uppercase italic">
            <i className="fa-solid fa-headset text-amber-600"></i>
            ¿Necesitas ayuda?
          </h3>
          <p className="text-sm text-stone-600 mb-6 px-2">
            Para cualquier duda, cambio o cancelación de cita, puedes contactarnos directamente:
          </p>
          <a 
            href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, '')}`} 
            className="inline-flex items-center gap-4 bg-stone-900 text-white px-8 py-5 rounded-2xl font-black text-2xl hover:bg-black transition-all active:scale-95 shadow-lg group"
          >
            <i className="fa-solid fa-phone-flip text-amber-500 group-hover:animate-bounce"></i>
            {BUSINESS_INFO.phone}
          </a>
          <p className="mt-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            Pulsa el número para llamar ahora
          </p>
        </section>

        <section className="bg-stone-900 text-white p-6 rounded-3xl shadow-2xl text-center">
          <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-3 text-amber-500 uppercase">
            <i className="fa-solid fa-calendar-check"></i>
            Gestión Automática
          </h3>
          <p className="text-sm text-stone-300">
            Tus citas se sincronizan automáticamente con nuestro calendario. Recibirás un email de confirmación al instante.
          </p>
        </section>

        <section className="bg-stone-50 p-6 rounded-3xl border border-stone-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-stone-800 uppercase italic">
            <i className="fa-solid fa-list-check text-amber-600"></i>
            Nuestros Servicios
          </h3>
          <div className="space-y-2">
            {SERVICES.map(s => (
              <div key={s.id} className="flex justify-between items-center text-sm p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <span className="font-bold text-stone-800">{s.name}</span>
                <div className="text-right">
                  <div className="font-black text-amber-600 uppercase text-xs">{s.price}</div>
                  <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">{s.durationMinutes} min</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200">
          <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2 uppercase italic text-sm">
            <i className="fa-solid fa-clock"></i>
            Horario de atención
          </h3>
          <p className="text-sm text-amber-800 font-medium">
            {BUSINESS_INFO.schedule}
          </p>
        </div>

        {/* CRÉDITOS DE LA APLICACIÓN */}
        <div className="pt-10 pb-6 text-center border-t border-stone-200 mt-10">
          <p className="text-stone-400 text-[11px] font-bold uppercase tracking-widest mb-1">
            Aplicación creada por IAEdulab
          </p>
          <a 
            href="https://iaedulab.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-amber-600 text-xs font-black hover:text-amber-700 transition-colors tracking-wider"
          >
            https://iaedulab.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminGuide;
