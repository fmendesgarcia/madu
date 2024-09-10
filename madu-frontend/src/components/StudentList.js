import React, { useEffect, useState } from 'react';
import api from '../services/api';

function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function fetchStudents() {
      const response = await api.get('/students');
      setStudents(response.data);
    }
    fetchStudents();
  }, []);

  return (
    <div>
      <h1>Lista de Alunos</h1>
      <ul>
        {students.map(student => (
          <li key={student.id}>{student.nome}</li>
        ))}
      </ul>
    </div>
  );
}

export default StudentList;
