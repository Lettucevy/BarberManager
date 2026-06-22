import React, { useEffect, useState } from 'react';

interface Funcionario {
  id: number;
  nome: string;
  telefone?: string;
  especialidade?: string;
  status: string;
}

function Funcionarios() {
  const [funcs, setFuncs] = useState<Funcionario[]>([]);
  const [form, setForm] = useState<{ nome: string; telefone?: string; especialidade?: string; status?: string }>({ nome: '' });
  const [loading, setLoading] = useState(false);

  const fetchFuncs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/funcionarios`, { credentials: 'include' });
      const data = await res.json();
      setFuncs(data);
    } catch (err) {
      console.error('Erro ao buscar funcionários', err);
    }
  };

  useEffect(() => {
    fetchFuncs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, status: form.status || 'ativo' };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/funcionarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao criar');
      await fetchFuncs();
      setForm({ nome: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir funcionário?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/funcionarios/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      await fetchFuncs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Funcionários</h2>
      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <input type="text" className="form-control" name="nome" placeholder="Nome" required value={form.nome} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input type="text" className="form-control" name="telefone" placeholder="Telefone" value={form.telefone || ''} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input type="text" className="form-control" name="especialidade" placeholder="Especialidade" value={form.especialidade || ''} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <select className="form-select" name="status" value={form.status || 'ativo'} onChange={handleChange}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>Adicionar</button>
        </div>
      </form>
      <table className="table table-striped">
        <thead><tr><th>#</th><th>Nome</th><th>Telefone</th><th>Especialidade</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>
          {funcs.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.nome}</td>
              <td>{f.telefone}</td>
              <td>{f.especialidade}</td>
              <td>{f.status}</td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Funcionarios;
