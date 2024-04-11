import './App.css';
import Footer from './footer/Footer';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './loginPage/Login';
import CadastroPage from './cadastroPage/Cadastro';
import { AuthContextProvider } from './server/AuthContext';
import TutorPage from './tutorPage/Tutor';
import AlunoPage from './alunoPage/Aluno';
import AlunoViewPage from './alunoPage/AlunoViewPage';

function App() {
  return (
  <AuthContextProvider>
    <Router>
      <div>
        <Routes>
          <Route path="/" exact element={<CadastroPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/tutor" element={<TutorPage/>} />
          <Route path="/aluno" element={<AlunoPage/>} />
          <Route path="/aluno-view" element={<AlunoViewPage/>} />
        </Routes>
        <Footer/>
      </div>
    </Router>
  </AuthContextProvider>
  );
}

export default App;
