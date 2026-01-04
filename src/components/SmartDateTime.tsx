import React, { useState, useEffect } from 'react';

interface AvailableSlots {
    [date: string]: string[]; // "YYYY-MM-DD": ["10:00", "10:30"]
}

interface SmartDateTimeProps {
    onDateTimeSelect: (date: string, time: string) => void;
    availableSlots: AvailableSlots;
    loading: boolean;
    selectedDate: string;
    selectedTime: string;
}

const SmartDateTime: React.FC<SmartDateTimeProps> = ({
    onDateTimeSelect,
    availableSlots,
    loading,
    selectedDate,
    selectedTime
}) => {
    // Ordenar fechas disponibles
    const sortedDates = Object.keys(availableSlots).sort();

    // Función para formatear fechas amigables
    const formatDateFriendly = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const checkDate = new Date(d);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate.getTime() === today.getTime()) return { label: 'HOY', sub: d.toLocaleDateString('es-ES', { day: 'numeric' }) };
        if (checkDate.getTime() === tomorrow.getTime()) return { label: 'MAÑANA', sub: d.toLocaleDateString('es-ES', { day: 'numeric' }) };

        const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
        const dayNum = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        return { label: dayName.toUpperCase(), sub: dayNum };
    };

    if (loading) {
        return (
            <div className="py-8 text-center bg-stone-50 rounded-2xl border border-stone-100">
                <i className="fa-solid fa-circle-notch animate-spin text-3xl text-amber-500 mb-2"></i>
                <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">Buscando huecos libres...</p>
            </div>
        );
    }

    if (sortedDates.length === 0) {
        return (
            <div className="py-8 text-center bg-stone-50 rounded-2xl border border-stone-100">
                <i className="fa-regular fa-calendar-xmark text-3xl text-stone-300 mb-2"></i>
                <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">No hay citas disponibles pronto</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Selector de Días Horizontal */}
            <div className="relative">
                <i className="fa-solid fa-calendar-day absolute left-0 top-1 text-stone-900 text-xs font-bold uppercase tracking-widest mb-2"></i>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-900 ml-6">Elige el día</span>

                <div className="flex gap-2 overflow-x-auto pb-4 pt-2 -mx-1 px-1 scrollbar-hide snap-x">
                    {sortedDates.map(date => {
                        const { label, sub } = formatDateFriendly(date);
                        const isSelected = selectedDate === date;

                        return (
                            <button
                                key={date}
                                type="button"
                                onClick={() => onDateTimeSelect(date, '')} // Al cambiar día, reset hora
                                className={`
                  flex-shrink-0 snap-start
                  flex flex-col items-center justify-center
                  w-20 h-20 rounded-2xl border-2 transition-all duration-200
                  ${isSelected
                                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-md scale-105'
                                        : 'border-stone-100 bg-white text-stone-400 hover:border-amber-200'}
                `}
                            >
                                <span className="text-[10px] font-black tracking-tighter mb-1">{label}</span>
                                <span className="text-lg font-bold">{sub}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Grid de Horas (Solo si hay día seleccionado) */}
            {selectedDate && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <i className="fa-solid fa-clock text-stone-900 text-xs"></i>
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-900">Elige la hora</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {availableSlots[selectedDate].map(time => {
                            const isSelected = selectedTime === time;
                            return (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => onDateTimeSelect(selectedDate, time)}
                                    className={`
                    py-3 rounded-xl text-sm font-bold transition-all
                    ${isSelected
                                            ? 'bg-stone-900 text-white shadow-lg scale-105'
                                            : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-500 hover:text-amber-600'}
                  `}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartDateTime;
