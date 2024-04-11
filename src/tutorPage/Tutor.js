import Header from '../header/Header';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { getDatabase, ref, set, get, update, remove } from 'firebase/database';
import './Tutor.css';

const TutorPage = () => {
    const location = useLocation();
    const [uid, setUid] = useState('');
    const [usuario, setUsuario] = useState({});
    const [disciplinas, setDisciplinas] = useState([]);
    const [novaDisciplina, setNovaDisciplina] = useState({
        id: '',
        disciplina: '',
        dia: '',
        turno: '',
        resumo: ''
    });
    const [modoEdicao, setModoEdicao] = useState(false);
    const [indiceEdicao, setIndiceEdicao] = useState(null);
    const [error, setError] = useState('');
    
    useEffect(() => {
        var state = location.state;

        setUid(state.userId);
        setUsuario(state.usuario);

        getDisciplinesByUid(state.userId);
    }, [location.state]);


    const handleInputChange = event => {
        const { name, value } = event.target;
        setNovaDisciplina({ ...novaDisciplina, [name]: value });
    };

    const adicionarDisciplina = () => {
        if (
            novaDisciplina.disciplina &&
            novaDisciplina.dia &&
            novaDisciplina.turno &&
            novaDisciplina.resumo
        ) {
            if (modoEdicao) {
                const novasDisciplinas = [...disciplinas];
                novasDisciplinas[indiceEdicao] = novaDisciplina;
                updateDiscipline(novaDisciplina, uid);
                setDisciplinas(novasDisciplinas);
                setModoEdicao(false);
                setIndiceEdicao(null);
            } else {
                var conflito = false;
                disciplinas.forEach((disciplina) => {
                    if (disciplina.turno === novaDisciplina.turno && disciplina.dia === novaDisciplina.dia) {
                        alert('Conflito de horários com a disciplina ' + disciplina.disciplina);
                        conflito = true;
                    }
                });

                if (conflito) return;

                const novaDisciplinaComId = { ...novaDisciplina, id: Date.now().toString(), professor: usuario.username };
                writeDiscipline(novaDisciplinaComId, uid);
                setDisciplinas([...disciplinas, novaDisciplinaComId]);
            }
            setNovaDisciplina({
                id: '', 
                disciplina: '',
                dia: '',
                turno: '',
                resumo: ''
            });
        } else {
            setError('Por favor, preencha todos os campos');
        }
    };

    const editarDisciplina = indice => {
        setNovaDisciplina(disciplinas[indice]);
        setModoEdicao(true);
        setIndiceEdicao(indice);
    };

    const excluirDisciplina = indice => {
        if (getAlunos(disciplinas[indice]) > 0) {
            alert('Não é possível excluir uma disciplina que já possua alunos matriculados');
            return;
        }
        const novasDisciplinas = [...disciplinas];
        const deleted = novasDisciplinas.splice(indice, 1);
        setDisciplinas(novasDisciplinas);
        deleteDiscipline(deleted[0], uid);
    };

    async function getDisciplinesByUid(uid) {
        const db = getDatabase();
    
        await get(ref(db, 'disciplinas/' + uid)).then((snapshot) => {
            if (snapshot.exists()) {
    
                const objectOfDisciplines = snapshot.val();
                const keys = Object.keys(objectOfDisciplines);
                var disciplinas = []; 
                keys.forEach((key) => {
                    disciplinas.push(objectOfDisciplines[key]); 
                }); 
    
                setDisciplinas(disciplinas);
            } else {
                setDisciplinas([]);
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    return (
        <div>
            <Header
                buttonRightName='Sair' 
                buttonRightRoute='/login' 
                title='Área dos Tutores'
            />
            <div className='table-container'>
                <h2 className='table-title'>Suas disciplinas</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Disciplina</th>
                            <th>Dia</th>
                            <th>Turno</th>
                            <th>Resumo</th>
                            <th>Nº Alunos</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disciplinas.map((disciplina, index) => (
                            <tr key={index}>
                                <td>{disciplina.id}</td>
                                <td>{disciplina.disciplina}</td>
                                <td>{disciplina.dia}</td>
                                <td>{disciplina.turno}</td>
                                <td>{disciplina.resumo}</td>
                                <td>{getAlunos(disciplina)}/20</td>
                                <td>
                                    <button onClick={() => editarDisciplina(index)}>
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => excluirDisciplina(index)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='nova-turma-container'>
                <h2 style={{ color: '#006D77' }}>{modoEdicao ? 'Editar Turma' : 'Nova Turma'}</h2>
                <div className='form-container'>
                    <div className='form-group'>
                        <label htmlFor='disciplina'>Disciplina:</label>
                        <input
                            type='text'
                            id='disciplina'
                            name='disciplina'
                            value={novaDisciplina.disciplina}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='dia'>Dia:</label>
                        <select
                            id='dia'
                            name='dia'
                            value={novaDisciplina.dia}
                            onChange={handleInputChange}
                        >
                            <option value=''>Selecione o dia</option>
                            <option value='Segunda'>Segunda</option>
                            <option value='Terça'>Terça</option>
                            <option value='Quarta'>Quarta</option>
                            <option value='Quinta'>Quinta</option>
                            <option value='Sexta'>Sexta</option>
                        </select>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='turno'>Turno:</label>
                        <select
                            id='turno'
                            name='turno'
                            value={novaDisciplina.turno}
                            onChange={handleInputChange}
                        >
                            <option value=''>Selecione o turno</option>
                            <option value='Manhã'>Manhã</option>
                            <option value='Tarde'>Tarde</option>
                            <option value='Noite'>Noite</option>
                        </select>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='resumo'>Resumo:</label>
                        <input
                            type='text'
                            id='resumo'
                            name='resumo'
                            value={novaDisciplina.resumo}
                            onChange={handleInputChange}
                        />
                    </div>                    
                </div>
                <button type='button' onClick={adicionarDisciplina}>
                        {modoEdicao ? 'Salvar Edição' : 'Adicionar Turma'}
                    </button>
                {error && <p>{error}</p>}
            </div>
        </div>
    );
};

export default TutorPage;

async function writeDiscipline(disciplina, uid) {
    const db = getDatabase();

    await set(ref(db, 'disciplinas/' + uid + '/' + disciplina.id), {
        id: disciplina.id,
        disciplina: disciplina.disciplina,
        professor: disciplina.professor,
        professor_uid: uid,
        dia: disciplina.dia,
        turno: disciplina.turno,
        resumo: disciplina.resumo,
        alunos: []
    });

    console.log('Salvou disciplina');
}

async function updateDiscipline(disciplina, uid) {
    console.log('Atualizando disciplina de id ' + uid)
    const db = getDatabase();

    await update(ref(db, 'disciplinas/' + uid + '/' + disciplina.id), {
        disciplina: disciplina.disciplina,
        dia: disciplina.dia,
        turno: disciplina.turno,
        resumo: disciplina.resumo,
    });

    console.log('Atualizou disciplina');
}

async function deleteDiscipline(disciplina, uid) {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar esta disciplina?");
    
    if (confirmDelete) {
        const db = getDatabase();
        
        await remove(ref(db, "disciplinas/" + uid + "/" + disciplina.id));
        
        console.log("Deletou disciplina");
    } else {
        console.log("Operação de deleção cancelada");
    }
}

function getAlunos(disciplina) {
    console.log('Buscando alunos da disciplina')
    if (disciplina.alunos === undefined) {
        return 0;
    } else {
        return disciplina.alunos.length;
    }
}