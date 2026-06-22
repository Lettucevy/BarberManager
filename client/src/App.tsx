import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VisagioLayout from './layouts/VisagioLayout';
import AdminLayout from './layouts/AdminLayout';
import ClienteAgendamento from './pages/ClienteAgendamento';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Funcionarios from './pages/Funcionarios';
import Servicos from './pages/Servicos';
import Agenda from './pages/Agenda';
import Historico from './pages/Historico';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<VisagioLayout />}>
          <Route path="/" element={<ClienteAgendamento />} />
          <Route path="/agendar" element={<ClienteAgendamento />} />
        </Route>

        <Route path="/painel" element={<AdminLogin />} />
        <Route path="/painel/*" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="funcionarios" element={<Funcionarios />} />
          <Route path="servicos" element={<Servicos />} />
          <Route path="historico" element={<Historico />} />
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
