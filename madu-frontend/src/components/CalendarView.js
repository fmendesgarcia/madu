import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';

const CalendarView = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5001/aulas')
      .then((response) => {
        const aulas = response.data.map(aula => ({
          title: aula.title,
          start: aula.start,
          end: aula.end_time
        }));
        setEvents(aulas);
      })
      .catch((error) => console.error('Erro ao carregar aulas:', error));
  }, []);

  return (
    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
      />
    </div>
  );
};

export default CalendarView;
