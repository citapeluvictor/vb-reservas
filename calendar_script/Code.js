/**
 * CÓDIGO GOOGLE APPS SCRIPT PARA VB💈
 * Copia este código en script.google.com
 * 
 * INSTRUCCIONES:
 * 1. Crea un nuevo proyecto en script.google.com
 * 2. Pega este código
 * 3. Publica como aplicación web:
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier persona" (incluso anónima)
 */

const CALENDAR_NAME = "VB Disponibilidad"; // Nombre exacto del calendario de disponibilidad
const MAIN_CALENDAR_ID = "primary"; // O el ID de tu calendario principal si es distinto

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action || 'createBooking'; // Por defecto crear reserva

        if (action === 'getSlots') {
            return getAvailability(data);
        } else {
            return createBooking(data);
        }

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: "Error procesando solicitud: " + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Obtiene los huecos disponibles basados en eventos "Disponible"
 */
function getAvailability(data) {
    const serviceDuration = parseInt(data.durationMinutes) || 30;
    const startDate = new Date(data.startDate); // Fecha inicio búsqueda
    const endDate = new Date(data.endDate);     // Fecha fin búsqueda

    // 1. Obtener calendario de disponibilidad
    const calendars = CalendarApp.getCalendarsByName(CALENDAR_NAME);
    let availCalendar = calendars.length > 0 ? calendars[0] : CalendarApp.getDefaultCalendar();

    // Si no existe el calendario específico, usamos el principal pero buscamos eventos con título "Disponible"
    const useTitleFilter = calendars.length === 0;

    // 2. Obtener bloques de disponibilidad
    const availEvents = availCalendar.getEvents(startDate, endDate);
    const availabilityBlocks = [];

    availEvents.forEach(evt => {
        if (!useTitleFilter || evt.getTitle().toLowerCase().includes("disponible")) {
            availabilityBlocks.push({
                start: evt.getStartTime(),
                end: evt.getEndTime()
            });
        }
    });

    // 3. Obtener conflictos (citas ya reservadas en el calendario principal)
    // Usamos el calendario principal para guardar las citas reales
    const mainCalendar = CalendarApp.getCalendarById(MAIN_CALENDAR_ID);
    const busyEvents = mainCalendar.getEvents(startDate, endDate).filter(evt => {
        // Excluir los eventos de "Disponible" si estamos usando el mismo calendario
        return !evt.getTitle().toLowerCase().includes("disponible");
    });

    // 4. Calcular bloques libres (Raw Blocks)
    const cleanBlocks = [];

    availabilityBlocks.forEach(availBlock => {
        let currentStart = availBlock.start.getTime();
        const availEnd = availBlock.end.getTime();

        // Ordenar eventos ocupados que caen en este bloque
        const blockBusyEvents = busyEvents
            .filter(evt => evt.getStartTime().getTime() < availEnd && evt.getEndTime().getTime() > currentStart)
            .sort((a, b) => a.getStartTime() - b.getStartTime());

        if (blockBusyEvents.length === 0) {
            cleanBlocks.push({ start: new Date(currentStart).toISOString(), end: new Date(availEnd).toISOString() });
        } else {
            blockBusyEvents.forEach(busy => {
                const busyStart = busy.getStartTime().getTime();
                const busyEnd = busy.getEndTime().getTime();

                // Si hay hueco antes del evento ocupado
                if (busyStart > currentStart) {
                    cleanBlocks.push({
                        start: new Date(currentStart).toISOString(),
                        end: new Date(busyStart).toISOString()
                    });
                }
                // Mover inicio al final del evento ocupado (si es posterior al inicio actual)
                if (busyEnd > currentStart) {
                    currentStart = busyEnd;
                }
            });

            // Si queda hueco al final
            if (currentStart < availEnd) {
                cleanBlocks.push({
                    start: new Date(currentStart).toISOString(),
                    end: new Date(availEnd).toISOString()
                });
            }
        }
    });

    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        blocks: cleanBlocks
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Crea la reserva
 */
/**
 * Crea la reserva
 */
function createBooking(data) {
    const calendar = CalendarApp.getCalendarById(MAIN_CALENDAR_ID);
    const start = new Date(data.start);
    const end = new Date(data.end);

    // Doble check de colisión antes de insertar
    // Filtramos eventos que NO son "Disponible"
    // Y verificamos solapamiento real (inicio < finEvento Y fin > inicioEvento)
    const conflicts = calendar.getEvents(start, end).filter(evt => {
        // Ignorar eventos de disponibilidad
        if (evt.getTitle().toLowerCase().includes("disponible")) return false;

        // Chequeo explícito de solapamiento para evitar falsos positivos con eventos adyacentes
        const evtStart = evt.getStartTime().getTime();
        const evtEnd = evt.getEndTime().getTime();
        const bookStart = start.getTime();
        const bookEnd = end.getTime();

        return (bookStart < evtEnd && bookEnd > evtStart);
    });

    if (conflicts.length > 0) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: "Lo siento, ese horario acaba de ser ocupado. Por favor elige otro."
        })).setMimeType(ContentService.MimeType.JSON);
    }

    const title = `✂️ ${data.service} - ${data.name}`;
    const description = `
    Cliente: ${data.name}
    Teléfono: ${data.phone}
    Email: ${data.email}
    Servicio: ${data.service}
    Notas: ${data.notes}
  `.trim();

    const event = calendar.createEvent(title, start, end, {
        description: description
    });

    // Opcional: Enviar email confirmar
    // MailApp.sendEmail(...)

    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        eventId: event.getId()
    })).setMimeType(ContentService.MimeType.JSON);
}
