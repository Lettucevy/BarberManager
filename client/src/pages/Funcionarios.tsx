import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Funcionario {
  id: number; nome: string; telefone?: string; especialidade?: string;
  status: string; comissao_tipo: string; comissao_valor: number;
}

function Funcionarios() {
  const [funcs, setFuncs] = useState<Funcionario[]>([]);
  const [form, setForm] = useState<any>({ nome: '', comissao_tipo: 'percentual', comissao_valor: 0 });
  const [loading, setLoading] = useState(false);

  const fetchFuncs = async () => {
    const res = await fetch(import.meta.env.VITE_API_URL + '/api/funcionarios', { credentials: 'include' });
    setFuncs(await res.json());
  };

  useEffect(() => { fetchFuncs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/funcionarios', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ ...form, status: form.status || 'ativo' }),
      });
      await fetchFuncs();
      setForm({ nome: '', comissao_tipo: 'percentual', comissao_valor: 0 });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir funcionario?')) return;
    await fetch(import.meta.env.VITE_API_URL + '/api/funcionarios/' + id, { method: 'DELETE', credentials: 'include' });
    await fetchFuncs();
  };

  return (
    <div className="bm-page">
      <header className="bm-page-head">
        <div>
          <p className="bm-eyebrow">BarberManager</p>
          <h1 className="bm-page-title">Funcionarios</h1>
          <p className="bm-page-sub">{funcs.length} profissional(is).</p>
        </div>
        <div className="bm-page-head__actions">
          <Link to="/painel/expediente" className="btn btn-outline-dark btn-sm">Gerenciar horarios</Link>
        </div>
      </header>

      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-2">
          <input type="text" className="form-control" name="nome" placeholder="Nome" required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="col-md-2">
          <input type="text" className="form-control" name="telefone" placeholder="Telefone" value={form.telefone || ''} onChange={e => setForm({ ...form, telefone: e.target.value })} />
        </div>
        <div className="col-md-2">
          <input type="text" className="form-control" name="especialidade" placeholder="Especialidade" value={form.especialidade || ''} onChange={e => setForm({ ...form, especialidade: e.target.value })} />
        </div>
        <div className="col-md-1">
          <select className="form-select" name="status" value={form.status || 'ativo'} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <div className="col-md-1">
          <select className="form-select" name="comissao_tipo" value={form.comissao_tipo} onChange={e => setForm({ ...form, comissao_tipo: e.target.value })}>
            <option value="percentual">%</option>
            <option value="fixo">R$</option>
          </select>
        </div>
        <div className="col-md-1">
          <input type="number" step="0.01" className="form-control" name="comissao_valor" placeholder="Valor" value={form.comissao_valor} onChange={e => setForm({ ...form, comissao_valor: parseFloat(e.target.value) || 0 })} />
        </div>
        <div className="col-md-1">
          <button type="submit" className="btn btn-dark w-100" disabled={loading}>Adicionar</button>
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead><tr><th>#</th><th>Nome</th><th>Especialidade</th><th>Status</th><th>Comissao</th><th>Acoes</th></tr></thead>
          <tbody>
            {funcs.map(f => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td><strong>{f.nome}</strong></td>
                <td>{f.especialidade}</td>
                <td>{f.status}</td>
                <td>{f.comissao_tipo === 'percentual' ? f.comissao_valor + '%' : 'R$ ' + f.comissao_valor.toFixed(2)}</td>
                <td>
                  <Link to={'/painel/expediente?funcionario_id=' + f.id} className="btn btn-sm btn-outline-dark me-1">Horarios</Link>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Funcionarios;
