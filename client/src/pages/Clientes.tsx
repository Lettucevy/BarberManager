import React, { useEffect, useState } from 'react';

interface Cliente {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
}

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<{ nome: string; telefone?: string; email?: string }>({ nome: '' });
  const [loading, setLoading] = useState(false);

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clientes`, { credentials: 'include' });
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error('Erro ao buscar clientes', err);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erro ao criar cliente');
      await fetchClientes();
      setForm({ nome: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir cliente?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clientes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      await fetchClientes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Clientes</h2>
      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <input type="text" className="form-control" name="nome" placeholder="Nome" required value={form.nome} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input type="text" className="form-control" name="telefone" placeholder="Telefone" value={form.telefone || ''} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input type="email" className="form-control" name="email" placeholder="Email" value={form.email || ''} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>Adicionar</button>
        </div>
      </form>
      <table className="table table-striped">
        <thead><tr><th>#</th><th>Nome</th><th>Telefone</th><th>Email</th><th>Ações</th></tr></thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nome}</td>
              <td>{c.telefone}</td>
              <td>{c.email}</td>
              <td>
                {/* Edit functionality could be added later */}
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Clientes;
