import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email, password: senha }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Credenciais invalidas.');
      }
      navigate('/painel/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-login">
      <form className="bm-login__card" onSubmit={entrar}>
        <div>
          <p className="vg-eyebrow">Acesso restrito</p>
          <h1>BarberManager</h1>
          <p className="bm-login__hint">Entre com o usuario do proprietario para gerenciar a barbearia.</p>
        </div>
        <label className="vg-field">
          <span>Email</span>
          <input
            type="email"
            className="form-control"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dono@visagiocabeleireiro.com.br"
          />
        </label>
        <label className="vg-field">
          <span>Senha</span>
          <input
            type="password"
            className="form-control"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
          />
        </label>
        {error && <div className="bm-login__error">{error}</div>}
        <button type="submit" className="btn btn-dark btn-lg" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar no painel'}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;