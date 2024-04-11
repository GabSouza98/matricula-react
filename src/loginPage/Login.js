import Header from '../header/Header'
import React, { useState } from 'react';
import './Login.css'; 
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

const LoginPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    function missingFields() {
        if (email === '') return true;
        if (password === '') return true;
        return false;
    }

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            var userId = await login(email, password);
            var usuario = await findUserByUid(userId);        

            if (usuario.role === 'TUTOR') {
                console.log('Efetuando login para role tutor')
                navigate('/tutor', {state: {userId: userId, usuario: usuario}});
                return;
            }

            console.log('Efetuando login para role aluno')
            var matricula = await findMatriculaById(userId);
            if(matricula == null) {
                navigate('/aluno', {state: {userId: userId, usuario: usuario}});
            } else {
                navigate('/aluno-view', {state: {userId: userId, usuario: usuario, matriculado: matricula}});
            }

        } catch (err) {
            console.log('Erro durante o login', err)
          setError(err.message);
        }
    };

    return(<div>
        <Header
            buttonLeftName='Login' 
            buttonLeftRoute='/login' 
            buttonRightName='Cadastro' 
            buttonRightRoute='/' 
            title='Login'/>
        <div style={{ marginTop: '120px' }} className='login-general form-wrapper'>
            <Form onSubmit={handleSubmit} className='form'>
            
            <Form.Group>
                <Form.Control
                type='email'
                placeholder='Email'
                onChange={(e) => setEmail(e.target.value)}
                />
            </Form.Group>

            <Form.Group>
                <Form.Control
                type='password'
                placeholder='Senha'
                onChange={(e) => setPassword(e.target.value)}
                />
            </Form.Group>

            <div>
                <Button className="login-button" variant="primary" type="Submit" disabled={missingFields()}>
                            Log In
                        </Button>
                </div>
            </Form>
        </div>
    </div>)
}

export default LoginPage

async function login(email, password) {

    var uid = null;
    const auth = getAuth();

    await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        uid = userCredential.user.uid;
    })
    .catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        alert('Code: ' + errorCode + ' Message: ' + errorMessage);
    });

    if (uid != null) {
        return uid;
    }
}

async function findUserByUid(uid) {

    console.log('Buscando usuário pelo seu id')
    var usuario = null;
    const db = getDatabase();

    await get(ref(db, 'users/' + uid))
    .then((snapshot) => {
        if (snapshot.exists()) {
          usuario = snapshot.val();
        } else {
          console.log('No data available');
        }
    })
    .catch((error) => {
        console.error(error);
    });

    return usuario;
   
}


async function findMatriculaById(uuid) {
    console.log('Buscando matrícula por id de usuário')
    var matricula = null;
    const db = getDatabase();

    await get(ref(db, 'matriculas/' + uuid))
    .then((snapshot) => {
        if (snapshot.exists()) {

          const objectOfDisciplines = snapshot.val();
          const keys = Object.keys(objectOfDisciplines);
          var disciplinas = [];
          keys.forEach((key) => {
            disciplinas.push(objectOfDisciplines[key]); 
          }); 

          matricula = disciplinas;
        } else {
          console.log('Nenhuma matrícula encontrada');
          return null
        }
    })
    .catch((error) => {
        console.error(error);
    });

    return matricula; 
}