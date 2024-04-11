import Header from '../header/Header'
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Aluno.css'

const AlunoViewPage = () => {
    const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const turnos = ['Manhã', 'Tarde', 'Noite'];

    const [gradeHorarios, setGradeHorarios] = useState([]);
    const [uid, setUid] = useState('');
    const [usuario, setUsuario] = useState({});
    const [matriculado, setMatriculado] = useState([]);

    const location = useLocation();

    useEffect(() => {
        var state = location.state;

        console.log('Setando dados iniciais')
        setUid(state.userId);
        setUsuario(state.usuario);
        setMatriculado(state.matriculado);

        console.log('Populando grade de horários')
        const gradeHorarios = [];
        for (const turno of turnos) {
          const coluna = {};
          coluna['Turno'] = turno;
          for (const dia of diasSemana) {
            coluna[dia] = '';
          }
          gradeHorarios.push(coluna);
        }
    
        matriculado.forEach(({ dia, disciplina, turno }) => {
          const indexTurno = turnos.indexOf(turno);
          if (indexTurno !== -1 && diasSemana.includes(dia)) {
            gradeHorarios[indexTurno][dia] = disciplina;
          }
        });
    
        setGradeHorarios(gradeHorarios);
    }, [location.state, matriculado]);

    return(
        <div>
            <Header
                buttonRightName='Sair' 
                buttonRightRoute='/login' 
                title='Área dos Alunos'/>
            <div className='table-container-grade'>
                <h2 className='table-title'>Sua grade de horários</h2>
            </div>
            <div className='table-container-grade'>
                <h2 className='table-title'>Grade de horários</h2>
                <table>
                    <thead>
                        <tr>
                        <th></th>
                        {diasSemana.map((dia, index) => (
                            <th key={index}>{dia}</th>
                        ))}
                        </tr>
                    </thead>
                    <tbody>
                        {gradeHorarios.map((coluna, index) => (
                        <tr key={index}>
                            <td>{coluna.Turno}</td>
                            {diasSemana.map((dia, index) => (
                            <td key={index}>{coluna[dia]}</td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AlunoViewPage