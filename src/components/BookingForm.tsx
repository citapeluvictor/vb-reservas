import React, { useState, useEffect } from 'react';
import { SERVICES, GAS_WEB_APP_URL, BUSINESS_INFO } from '../constants';
import SmartDateTime from './SmartDateTime';

interface ReservationDetails {
  name: string;
  serviceName: string;
  date: string;
  time: string;
}

const BookingForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReservation, setLastReservation] = useState<ReservationDetails | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ [key: string]: string[] }>({});

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceId: SERVICES[0].id,
    date: '',
    time: '',
    notes: ''
  });

  // Fetch slots whenever Service changes or on mount
  useEffect(() => {
    fetchAvailability();
  }, [formData.serviceId]);

  const fetchAvailability = async () => {
    setLoadingSlots(true);
    setAvailableSlots({});
    setFormData(prev => ({ ...prev, date: '', time: '' })); // Reset selection

    const selectedService = SERVICES.find(s => s.id === formData.serviceId)!;

    // Calcular rango de fechas: Hoy -> +14 días
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 14);

    try {
      const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'getSlots',
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          durationMinutes: selectedService.durationMinutes
        }),
      });

      const result = await response.json();

      if (result.success && result.blocks) {
        // Process blocks to generating slots
        const newSlots: { [key: string]: string[] } = {};
        const serviceDurationMs = selectedService.durationMinutes * 60000;
        const intervalMs = 15 * 60000; // 15 minutes interval

        result.blocks.forEach((block: { start: string, end: string }) => {
          // Parse as dates
          const blockStart = new Date(block.start);
          const blockEnd = new Date(block.end);

          let cursor = new Date(blockStart.getTime());

          // Round cursor up to next 15 min if needed
          const remainder = cursor.getTime() % intervalMs;
          if (remainder !== 0) {
            cursor = new Date(cursor.getTime() + (intervalMs - remainder));
          }

          // Strict check: Slot Start + Duration <= Block End
          while (cursor.getTime() + serviceDurationMs <= blockEnd.getTime()) {
            // Local date string format YYYY-MM-DD for grouping
            const year = cursor.getFullYear();
            const month = String(cursor.getMonth() + 1).padStart(2, '0');
            const day = String(cursor.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            // Time string HH:mm
            const timeStr = cursor.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

            if (!newSlots[dateKey]) newSlots[dateKey] = [];
            if (!newSlots[dateKey].includes(timeStr)) newSlots[dateKey].push(timeStr);

            // Advance 15 mins
            cursor = new Date(cursor.getTime() + intervalMs);
          }
        });

        setAvailableSlots(newSlots);

      } else {
        console.error("Error fetching availability:", result.message);
      }
    } catch (e) {
      console.error("Network error fetching availability", e);
      setError("No se pudieron cargar los horarios. Intenta recargar.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setFormData(prev => ({ ...prev, date, time }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      setError("Por favor selecciona un día y una hora.");
      return;
    }

    setLoading(true);
    setError(null);

    const selectedService = SERVICES.find(s => s.id === formData.serviceId)!;
    const startDate = new Date(`${formData.date}T${formData.time}`);
    const endDate = new Date(startDate.getTime() + selectedService.durationMinutes * 60000);

    const payload = {
      action: 'createBooking', // New param
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: selectedService.name,
      notes: formData.notes || '',
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };

    try {
      const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      let isActuallySuccess = true;

      try {
        const result = await response.json();
        if (result && result.success === false) {
          isActuallySuccess = false;
          setError(result.message || "Ese horario ya está ocupado. Prueba con otro.");
          // Refresh slots if collision
          fetchAvailability();
        }
      } catch (e) {
        if (!response.ok && response.status !== 0) {
          isActuallySuccess = false;
          setError("Error en el servidor. Inténtalo más tarde.");
        }
      }

      if (isActuallySuccess) {
        setLastReservation({
          name: formData.name,
          serviceName: selectedService.name,
          date: formData.date,
          time: formData.time
        });
        setSuccess(true);
      }

    } catch (err) {
      setError("No se pudo conectar con el sistema de reservas. Revisa tu conexión.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success && lastReservation) {
    return (
      <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <i className="fa-solid fa-calendar-check text-4xl"></i>
        </div>

        <h2 className="text-3xl font-bold mb-2 uppercase tracking-tighter text-stone-900">¡CITA CONFIRMADA!</h2>
        <p className="text-stone-600 mb-8 px-6 text-sm">
          Tu cita en <strong>{BUSINESS_INFO.name}</strong> ha sido registrada correctamente en nuestro calendario.
          <br />
          Recibirás un correo electrónico con los detalles de tu cita.
        </p>

        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 mb-8 text-left shadow-sm">
          <p className="text-xs font-bold uppercase text-stone-400 mb-3 tracking-widest">Resumen de tu reserva</p>
          <div className="space-y-2">
            <p className="text-stone-800 font-bold"><i className="fa-solid fa-user w-6 text-amber-600"></i> {lastReservation.name}</p>
            <p className="text-stone-800"><i className="fa-solid fa-scissors w-6 text-amber-600"></i> {lastReservation.serviceName}</p>
            <p className="text-stone-800"><i className="fa-solid fa-calendar-day w-6 text-amber-600"></i> {new Date(lastReservation.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
            <p className="text-stone-800"><i className="fa-solid fa-clock w-6 text-amber-600"></i> {lastReservation.time}h</p>
          </div>
        </div>

        <button
          onClick={() => { setSuccess(false); setFormData({ ...formData, date: '', time: '' }); fetchAvailability(); }}
          className="w-full bg-stone-900 hover:bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95"
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-8 duration-500 max-w-sm mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-tighter text-stone-800">Reserva tu turno en {BUSINESS_INFO.name}</h2>
        <div className="h-1 w-12 bg-amber-500 mx-auto mt-2 rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Paso 1: Datos Personales (Compacto) */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">1. Tus Datos</h3>
          <input
            type="text" name="name" required placeholder="Nombre completo"
            value={formData.name} onChange={handleChange}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="tel" name="phone" required placeholder="Teléfono"
              value={formData.phone} onChange={handleChange}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            />
            <input
              type="email" name="email" required placeholder="Email"
              value={formData.email} onChange={handleChange}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Paso 2: Servicio */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">2. Servicio</h3>
          <div className="relative">
            <i className="fa-solid fa-scissors absolute left-4 top-3.5 text-amber-500"></i>
            <select
              name="serviceId" value={formData.serviceId} onChange={handleChange}
              className="w-full pl-10 pr-8 py-3 bg-stone-900 text-white rounded-xl focus:ring-2 focus:ring-amber-500 outline-none appearance-none font-bold text-sm"
            >
              {SERVICES.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-4 top-3.5 text-white pointer-events-none"></i>
          </div>
        </div>

        {/* Paso 3: Fecha y Hora (Dinámico) */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">3. Fecha y Hora</h3>
          <SmartDateTime
            onDateTimeSelect={handleDateTimeSelect}
            availableSlots={availableSlots}
            loading={loadingSlots}
            selectedDate={formData.date}
            selectedTime={formData.time}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3 animate-pulse">
            <i className="fa-solid fa-circle-exclamation text-lg"></i>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formData.date || !formData.time}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner animate-spin"></i>
              Confirmando...
            </>
          ) : (
            <>
              Confirmar Cita
              <i className="fa-solid fa-check"></i>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
