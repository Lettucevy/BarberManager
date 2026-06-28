import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

interface ClienteSessao {
  authenticated: boolean;
  id?: number;
  nome?: string;
  telefone?: string;
  email?: string | null;
}

function MinhaConta() {
  const navigate = useNavigate();
  const [sessao, setSessao] = useState<ClienteSessao | null>(null);
  const [modo, setModo] = useState<'login' | 'register'>('login');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(API + '/api/auth/cliente/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setSessao(data);
        if (data.authenticated) navigate('/minha-conta/agendamentos');
      })
      .catch(() => setSessao({ authenticated: false }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const endpoint = modo === 'login' ? '/api/auth/cliente/login' : '/api/auth/cliente/register';
      const body: Record<string, string> = { telefone, senha };
      if (modo === 'register') { body.nome = nome; if (email) body.email = email; }

      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.message || data.errors?.[0]?.msg || 'Erro desconhecido');
        return;
      }
      navigate('/minha-conta/agendamentos');
    } catch (err) {
      setErro('Erro de conexao com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const toggleModo = () => {
    setModo(m => m === 'login' ? 'register' : 'login');
    setErro('');
  };

  if (sessao === null) return <p className="text-muted">Carregando...</p>;

  return (
    <section className="vg-account">
      <div className="vg-account__card">
        <h1>{modo === 'login' ? 'Entrar' : 'Criar conta'}</h1>
        <p className="vg-account__sub">
          {modo === 'login'
            ? 'Acesse para ver seus agendamentos'
            : 'Crie uma conta para gerenciar seus horarios'}
        </p>

        {erro && <div className="alert alert-danger">{erro}</div>}

        <form onSubmit={handleSubmit}>
          {modo === 'register' && (
            <label className="vg-field">
              <span>Nome completo</span>
              <input type="text" className="form-control" required value={nome} onChange={e => setNome(e.target.value)} />
            </label>
          )}
          <label className="vg-field">
            <span>Telefone</span>
            <input type="tel" className="form-control" required value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-0000" />
          </label>
          {modo === 'register' && (
            <label className="vg-field">
              <span>Email</span>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="opcional" />
            </label>
          )}
          <label className="vg-field">
            <span>Senha</span>
            <input type="password" className="form-control" required minLength={4} value={senha} onChange={e => setSenha(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-dark btn-lg w-100" disabled={loading}>
            {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="vg-account__toggle">
          {modo === 'login' ? (
            <>Nao tem conta? <button type="button" className="btn btn-link p-0" onClick={toggleModo}>Cadastre-se</button></>
          ) : (
            <>Ja tem conta? <button type="button" className="btn btn-link p-0" onClick={toggleModo}>Faca login</button></>
          )}
        </p>
      </div>
    </section>
  );
}

export default MinhaConta;
