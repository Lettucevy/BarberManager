import React, { useEffect, useState } from 'react';

interface Cliente { id: number; nome: string; }
interface Funcionario { id: number; nome: string; }
interface Servico { id: number; nome: string; }
interface Agendamento {
  id: number;
  cliente_id: number;
  funcionario_id: number;
  servico_id: number;
  data: string;
  hora: string;
  status: string;
}

function Agenda() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [form, setForm] = useState<{ cliente_id?: number; funcionario_id?: number; servico_id?: number; data?: string; hora?: string }>({});
  const [loading, setLoading] = useState(false);

  const api = import.meta.env.VITE_API_URL;

  const loadData = async () => {
    try {
      const [cRes, fRes, sRes, aRes] = await Promise.all([
        fetch(`${api}/api/clientes`, { credentials: 'include' }),
        fetch(`${api}/api/funcionarios`, { credentials: 'include' }),
        fetch(`${api}/api/servicos`, { credentials: 'include' }),
        fetch(`${api}/api/agendamentos`, { credentials: 'include' }),
      ]);
      const [cData, fData, sData, aData] = await Promise.all([cRes.json(), fRes.json(), sRes.json(), aRes.json()]);
      setClientes(cData);
      setFuncionarios(fData);
      setServicos(sData);
      setAgendamentos(aData);
    } catch (err) {
      console.error('Erro ao carregar dados da agenda', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value ? (['cliente_id','funcionario_id','servico_id'].includes(name) ? parseInt(value, 10) : value) : undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${api}/api/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao criar agendamento');
      }
      await loadData();
      setForm({});
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao agendar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancelar este agendamento?')) return;
    try {
      const res = await fetch(`${api}/api/agendamentos/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao cancelar');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Agenda</h2>
      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-2">
          <select className="form-select" name="cliente_id" required value={form.cliente_id || ''} onChange={handleChange}>
            <option value="">Cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" name="funcionario_id" required value={form.funcionario_id || ''} onChange={handleChange}>
            <option value="">Funcionário</option>
            {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" name="servico_id" required value={form.servico_id || ''} onChange={handleChange}>
            <option value="">Serviço</option>
            {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" name="data" required value={form.data || ''} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input type="time" className="form-control" name="hora" required value={form.hora || ''} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>Agendar</button>
        </div>
      </form>
      <table className="table table-striped">
        <thead>
          <tr><th>#</th><th>Cliente</th><th>Funcionário</th><th>Serviço</th><th>Data</th><th>Hora</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {agendamentos.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{clientes.find(c => c.id === a.cliente_id)?.nome || a.cliente_id}</td>
              <td>{funcionarios.find(f => f.id === a.funcionario_id)?.nome || a.funcionario_id}</td>
              <td>{servicos.find(s => s.id === a.servico_id)?.nome || a.servico_id}</td>
              <td>{a.data}</td>
              <td>{a.hora}</td>
              <td>{a.status}</td>
              <td>{a.status === 'confirmado' && (
                <button className="btn btn-sm btn-danger" onClick={() => handleCancel(a.id)}>Cancelar</button>
              )}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Agenda;
