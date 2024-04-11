import Header from '../header/Header'
import React, { useState, useEffect, useReducer } from 'react';
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, update } from 'firebase/database';
import './Aluno.css'

const AlunoPage = () => {
    const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const turnos = ['Manhã', 'Tarde', 'Noite'];

    const [gradeHorarios, setGradeHorarios] = useState([]);
    const [uid, setUid] = useState('');
    const [usuario, setUsuario] = useState({});
    const [disciplinas, setDisciplinas] = useState([]);
    const [matriculado, setMatriculado] = useState([]);
    const [maxAlunos, setMaxAlunos] = useState(20); 

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        var state = location.state;

        console.log('Settando dados iniciais')
        setUid(state.userId);
        setUsuario(state.usuario);
        getAllDisciplines(state.userId);

        const gradeHorarios = [];

        console.log('Populando grade de horário');
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

    const [, forceUpdate] = useReducer(x => x + 1, 0);

    async function getAllDisciplines(alunoUid) {
        const db = getDatabase();
    
        console.log('Buscando disciplinas no banco de dados')
        await get(ref(db, 'disciplinas/')).then((snapshot) => {
            if (snapshot.exists()) {

                const objectOfUids = snapshot.val();
                var disciplinas = [];
                const uidKeys = Object.keys(objectOfUids);

                console.log('Preenchendo disciplinas disponíveis')
                uidKeys.forEach((uid) => {
                    const objectOfDisciplines = objectOfUids[uid];
                    const idsDisciplinas = Object.keys(objectOfDisciplines);
                    idsDisciplinas.forEach((id) => {
                        disciplinas.push(objectOfDisciplines[id]);
                    });
                });            
                setDisciplinas(disciplinas);

                console.log('Preenchendo grade de horários com disciplinas selecionadas')
                var matriculado = [];
                disciplinas.forEach((d) => {
                    if (d.alunos !== undefined && d.alunos.includes(alunoUid)) {
                        matriculado.push(d);
                    }
                });
                setMatriculado(matriculado);

            } else {
                console.log('Nenhuma disciplina em oferta')
                setDisciplinas([]);
                setMatriculado([]);
            }
        }).catch((error) => {
            console.error('Ocorreu um erro', error);
        });
    }

    const adicionarDisciplina = indice => {
        console.log('Adicionando nova disciplina na grade de horários')
        const novaDisciplina = disciplinas[indice];

        var conflito = false;
        matriculado.forEach((m) => {
            if (m.turno === novaDisciplina.turno && m.dia === novaDisciplina.dia) {
                alert('Conflito de horários com a disciplina ' + m.disciplina);
                conflito = true;
            }
        })

        if (conflito) return;

        if (novaDisciplina.alunos === undefined) {
            novaDisciplina.alunos = [uid];
        } else {
            if (isFull(novaDisciplina, maxAlunos)) {
                alert('Disciplina sem vaga');
                return;
            }
            novaDisciplina.alunos.push(uid);
        }
        
        updateAlunosDisciplina(novaDisciplina);

        console.log('Atualizando disciplinas adicionadas')
        var disciplinasMatriculadas = matriculado;
        disciplinasMatriculadas.push(novaDisciplina);
        setMatriculado(disciplinasMatriculadas);

        forceUpdate();
    };

    
    const excluirDisciplina = indice => {
        var disciplinaParaExcluir = disciplinas[indice];
        var indexToDelete = null;

        matriculado.forEach((d, index) => {
            if (d.id === disciplinaParaExcluir.id) {
                indexToDelete = index;
            }
        });

        if (indexToDelete !== null) {
            console.log('Removendo disciplina das matrículas do aluno')
            matriculado.splice(indexToDelete, 1);
            setMatriculado(matriculado);

            console.log('Removendo aluno da lista de alunos da disciplina')
            var uidIndex = disciplinaParaExcluir.alunos.indexOf(uid);
            if (uidIndex !== -1) {
                disciplinaParaExcluir.alunos.splice(uidIndex, 1);
                updateAlunosDisciplina(disciplinaParaExcluir);
                forceUpdate();
            }
        }
    };

    const finalizarMatricula = async () => {
        console.log('Finalizando matrícula')
        if(matriculado.length === 0) {
            alert('Nenhuma disciplina adicionada');
            return;
        }

        await saveMatricula(matriculado, uid);        

        alert('Matrícula finalizada!')
        navigate('/aluno-view', {state: {userId: uid, usuario: usuario, matriculado: matriculado}});
    }

    const isMatriculado = indice => {
        var d = disciplinas[indice];
        if (d.alunos === undefined) {
            return false;
        }
        return d.alunos.includes(uid);
    }

    return(
        <div>
            <Header
                buttonRightName='Sair' 
                buttonRightRoute='/login' 
                title='Área dos Alunos'/>
            <div className='table-container'>
                <h2 className='table-title'>Disciplinas Disponíveis</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Disciplina</th>
                            <th>Professor</th>
                            <th>Dia</th>
                            <th>Turno</th>
                            <th>Resumo</th>
                            <th>Nº Alunos</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disciplinas.map((disciplina, index) => (
                            <tr key={index}>
                                <td>{disciplina.id}</td>
                                <td>{disciplina.disciplina}</td>
                                <td>{disciplina.professor}</td>
                                <td>{disciplina.dia}</td>
                                <td>{disciplina.turno}</td>
                                <td>{disciplina.resumo}</td>
                                <td>{getAlunos(disciplina)}/{maxAlunos}</td>
                                <td>
                                    {isMatriculado(index) ? 
                                    <button onClick={() => excluirDisciplina(index)}>
                                        <FaMinusCircle />
                                    </button> : 
                                     isFull(disciplina, maxAlunos) ? <p>FULL</p> :
                                    <button onClick={() => adicionarDisciplina(index)}>
                                        <FaPlusCircle />
                                    </button>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                <button type='button' onClick={finalizarMatricula}>
                        Finalizar matrícula
                </button>
            </div>
        </div>
    )
}

export default AlunoPage

async function updateAlunosDisciplina(disciplina) {
    const db = getDatabase();

    await update(ref(db, 'disciplinas/' + disciplina.professor_uid + '/' + disciplina.id), {
        alunos: disciplina.alunos
    });

    console.log('ATUALIZOU');
}

async function saveMatricula(matriculado, alunoUid) {
    const db = getDatabase();

    matriculado.forEach(async (matricula) => {
        await set(ref(db, 'matriculas/' + alunoUid + '/' + matricula.id), {
            id: matricula.id,
            disciplina: matricula.disciplina,
            professor: matricula.professor,
            professor_uid: matricula.professor_uid,
            dia: matricula.dia,
            turno: matricula.turno,
            resumo: matricula.resumo,
            alunos: matricula.alunos
        });
    });
}

function getAlunos(disciplina) {
    if (disciplina.alunos === undefined) {
        return 0;
    } else {
        return disciplina.alunos.length;
    }
}

function isFull(disciplina, max) {
    if (disciplina.alunos === undefined) {
        return false;
    }
    return disciplina.alunos.length >= max;
}