import React, { useEffect, useState } from 'react';

interface Servico {
  id: number;
  nome: string;
  valor: number;
  duracao_min: number;
}

function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [form, setForm] = useState<{ nome: string; valor?: string; duracao_min?: string }>({ nome: '' });
  const [loading, setLoading] = useState(false);

  const fetchServicos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/servicos`, { credentials: 'include' });
      const data = await res.json();
      setServicos(data);
    } catch (err) {
      console.error('Erro ao buscar serviços', err);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        nome: form.nome,
        valor: parseFloat(form.valor || '0'),
        duracao_min: parseInt(form.duracao_min || '0', 10),
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/servicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao criar serviço');
      await fetchServicos();
      setForm({ nome: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir serviço?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/servicos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      await fetchServicos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Serviços</h2>
      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <input type="text" className="form-control" name="nome" placeholder="Nome" required value={form.nome} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input type="number" step="0.01" className="form-control" name="valor" placeholder="Valor" required value={form.valor || ''} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input type="number" className="form-control" name="duracao_min" placeholder="Duração (min)" required value={form.duracao_min || ''} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>Adicionar</button>
        </div>
      </form>
      <table className="table table-striped">
        <thead><tr><th>#</th><th>Nome</th><th>Valor</th><th>Duração (min)</th><th>Ações</th></tr></thead>
        <tbody>
          {servicos.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.nome}</td>
              <td>{s.valor}</td>
              <td>{s.duracao_min}</td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Servicos;
