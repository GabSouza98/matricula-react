import Header from '../header/Header';
import React, { useState } from 'react';
import './Cadastro.css'; 
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

const CadastroPage = () => {

    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');

    let navigate = useNavigate();

    function missingFields() {
        if (userName === '') return true;
        if (email === '') return true;
        if (password === '') return true;
        if (role === '') return true;
        return false;
    }

    const handleSubmit = async (e) => {

        e.preventDefault();

        console.log('Registrando novo usuário')
        try {
    
            const uid = await registerNewUser(email, password);
            const user = {
                uid: uid,
                username: userName,
                email: email,
                role: role
            };

            await writeUserData(user);
            navigate('/login');

        } catch (err) {
          setError(err.message);
        }
    };

    return (
        <div>
            <Header
                buttonLeftName='Login' 
                buttonLeftRoute='/login' 
                buttonRightName='Cadastro' 
                buttonRightRoute='/' 
                title='Cadastro'/>
            <div style={{ marginTop: '120px' }} className='form-wrapper'>
                <Form onSubmit={handleSubmit} className='form'>

                <Form.Select
                    onChange={(e) => setRole(e.target.value)}>
                    <option value=''>Perfil</option>
                    <option value='TUTOR'>Tutor</option>
                    <option value='ALUNO'>Aluno</option>
                </Form.Select>

                <Form.Group>
                    <Form.Control
                        type='text'
                        placeholder='User Name'
                        onChange={(e) => setUserName(e.target.value)}
                    />
                </Form.Group>

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

export default CadastroPage

async function registerNewUser(email, password) {
    var user = null;
    const auth = getAuth();
    await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        user = userCredential.user;
        console.log(user);
    })
    .catch((err) => {
        console.log('Erro ao cadastrar usuário,', err)
        const errorCode = err.code;
        const errorMessage = err.message;
        alert('Code: ' + errorCode + ' Message: ' + errorMessage);
    });

    if (user != null) {
        return user.uid;
    }
}

async function writeUserData(user) {
  console.log('Salvando dados do usuário no banco de dados');
  const db = getDatabase();

  await set(ref(db, 'users/' + user.uid), {
    username: user.username,
    email: user.email,
    role: user.role,
  });

  console.log('Salvou usuario novo');
}
