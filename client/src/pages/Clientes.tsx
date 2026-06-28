import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Cliente {
  id: number; nome: string; telefone?: string; email?: string;
}

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<{ nome: string; telefone?: string; email?: string }>({ nome: '' });
  const [loading, setLoading] = useState(false);

  const fetchClientes = async (q?: string) => {
    const url = import.meta.env.VITE_API_URL + '/api/clientes' + (q ? '?q=' + encodeURIComponent(q) : '');
    try {
      const res = await fetch(url, { credentials: 'include' });
      setClientes(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchClientes(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchClientes(search); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/clientes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erro ao criar');
      await fetchClientes();
      setForm({ nome: '' });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir cliente?')) return;
    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/clientes/' + id, { method: 'DELETE', credentials: 'include' });
      await fetchClientes();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bm-page">
      <header className="bm-page-head">
        <div>
          <p className="bm-eyebrow">BarberManager</p>
          <h1 className="bm-page-title">Clientes</h1>
          <p className="bm-page-sub">{clientes.length} cliente(s) cadastrado(s).</p>
        </div>
      </header>

      <form className="bm-search-form" onSubmit={handleSearch}>
        <input type="search" className="form-control" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit" className="btn btn-dark btn-sm">Buscar</button>
      </form>

      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <input type="text" className="form-control" name="nome" placeholder="Nome" required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="col-md-3">
          <input type="text" className="form-control" name="telefone" placeholder="Telefone" value={form.telefone || ''} onChange={e => setForm({ ...form, telefone: e.target.value })} />
        </div>
        <div className="col-md-3">
          <input type="email" className="form-control" name="email" placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-dark w-100" disabled={loading}>Adicionar</button>
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead><tr><th>#</th><th>Nome</th><th>Telefone</th><th>Email</th><th>Acoes</th></tr></thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td><Link to={'/painel/clientes/' + c.id}><strong>{c.nome}</strong></Link></td>
                <td>{c.telefone}</td>
                <td>{c.email}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Clientes;
