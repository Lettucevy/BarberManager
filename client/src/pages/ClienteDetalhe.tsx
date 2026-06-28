import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

interface ClienteProfile {
  id: number; nome: string; telefone: string; email: string | null;
  observacao_admin: string | null;
  stats: { total_visitas: number; total_gasto: number; ultima_visita: string | null };
  historico: Array<{ id: number; data: string; servico_nome: string; funcionario_nome: string; valor: number }>;
  agendamentos: Array<{ id: number; data: string; hora: string; status: string; servico_nome: string; funcionario_nome: string }>;
}

function formatCurrency(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v); }

function ClienteDetalhe() {
  const { id } = useParams();
  const [cliente, setCliente] = useState<ClienteProfile | null>(null);
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(API + '/api/clientes/' + id, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setCliente(data); setObs(data.observacao_admin || ''); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const salvarObs = async () => {
    setSaving(true);
    await fetch(API + '/api/clientes/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ observacao_admin: obs }),
    });
    setSaving(false);
  };

  if (loading) return <p>Carregando...</p>;
  if (!cliente) return <p>Cliente nao encontrado.</p>;

  return (
    <div className="bm-page">
      <header className="bm-page-head">
        <div>
          <p className="bm-eyebrow"><Link to="/painel/clientes">Clientes</Link> / Detalhe</p>
          <h1 className="bm-page-title">{cliente.nome}</h1>
          <p className="bm-page-sub">{cliente.telefone}{cliente.email ? ' | ' + cliente.email : ''}</p>
        </div>
      </header>

      <section className="bm-grid-3">
        <div className="bm-card">
          <strong className="bm-kpi__value">{cliente.stats.total_visitas}</strong>
          <span className="bm-kpi__label">Visitas</span>
        </div>
        <div className="bm-card">
          <strong className="bm-kpi__value">{formatCurrency(cliente.stats.total_gasto)}</strong>
          <span className="bm-kpi__label">Total gasto</span>
        </div>
        <div className="bm-card">
          <strong className="bm-kpi__value">{cliente.stats.ultima_visita || '-'}</strong>
          <span className="bm-kpi__label">Ultima visita</span>
        </div>
      </section>

      <section className="bm-card" style={{ marginBottom: 20 }}>
        <h2 className="bm-card__title">Anotacao interna</h2>
        <textarea className="form-control" rows={3} value={obs} onChange={e => setObs(e.target.value)}
          placeholder="Observacoes sobre este cliente..." style={{ marginBottom: 8 }} />
        <button className="btn btn-sm btn-dark" onClick={salvarObs} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar anotacao'}
        </button>
      </section>

      {cliente.agendamentos.filter(a => a.status === 'confirmado').length > 0 && (
        <section className="bm-card" style={{ marginBottom: 20 }}>
          <h2 className="bm-card__title">Proximos agendamentos</h2>
          <div className="bm-agenda__list">
            {cliente.agendamentos.filter(a => a.status === 'confirmado').map(a => (
              <div key={a.id} className="bm-agenda__row">
                <div className="bm-agenda__time">{a.data.slice(8,10)}/{a.data.slice(5,7)} {a.hora}</div>
                <div className="bm-agenda__main">
                  <strong>{a.servico_nome || 'Servico'}</strong>
                  <span>com {a.funcionario_nome || 'Profissional'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bm-card">
        <header className="bm-card__head">
          <div>
            <h2 className="bm-card__title">Historico de atendimentos</h2>
            <p className="bm-card__sub">{cliente.historico.length} registro(s)</p>
          </div>
        </header>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead><tr><th>Data</th><th>Servico</th><th>Profissional</th><th>Valor</th></tr></thead>
            <tbody>
              {cliente.historico.map(h => (
                <tr key={h.id}>
                  <td>{h.data}</td>
                  <td>{h.servico_nome || 'Servico'}</td>
                  <td>{h.funcionario_nome || 'Profissional'}</td>
                  <td>{formatCurrency(h.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ClienteDetalhe;
