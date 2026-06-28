import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL;

interface RevenueDay { data: string; atendimentos: number; faturamento: number; }
interface PeakHour { hora: string; total: number; }
interface InactiveClient { id: number; nome: string; telefone: string; ultima_visita: string | null; }

function formatCurrency(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v); }

function Relatorios() {
  const [revenue, setRevenue] = useState<RevenueDay[]>([]);
  const [totalAtendimentos, setTotalAtendimentos] = useState(0);
  const [totalFaturamento, setTotalFaturamento] = useState(0);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [noShow, setNoShow] = useState<{ total: number; cancelados: number; taxa: string } | null>(null);
  const [inactive, setInactive] = useState<InactiveClient[]>([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (dataInicio) params.set('data_inicio', dataInicio);
    if (dataFim) params.set('data_fim', dataFim);

    Promise.all([
      fetch(API + '/api/dashboard/revenue?' + params, { credentials: 'include' }).then(r => r.json()),
      fetch(API + '/api/dashboard/peak-hours', { credentials: 'include' }).then(r => r.json()),
      fetch(API + '/api/dashboard/no-show-rate', { credentials: 'include' }).then(r => r.json()),
      fetch(API + '/api/dashboard/inactive-clients', { credentials: 'include' }).then(r => r.json()),
    ]).then(([rev, peak, noshow, inact]) => {
      setRevenue(rev.diario || []);
      setTotalAtendimentos(rev.total_atendimentos || 0);
      setTotalFaturamento(rev.total_faturamento || 0);
      setPeakHours(peak || []);
      setNoShow(noshow);
      setInactive(inact || []);
    }).catch(console.error);
  }, [dataInicio, dataFim]);

  return (
    <div className="bm-page">
      <header className="bm-page-head">
        <div>
          <p className="bm-eyebrow">BarberManager</p>
          <h1 className="bm-page-title">Relatorios</h1>
          <p className="bm-page-sub">Analise de faturamento, horarios de pico e clientes.</p>
        </div>
      </header>

      <div className="bm-search-form">
        <input type="date" className="form-control" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
        <input type="date" className="form-control" value={dataFim} onChange={e => setDataFim(e.target.value)} />
        <button className="btn btn-outline-dark btn-sm" onClick={() => { setDataInicio(''); setDataFim(''); }}>Limpar</button>
      </div>

      <section className="bm-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="bm-kpi">
          <span className="bm-kpi__label">Faturamento total</span>
          <strong className="bm-kpi__value">{formatCurrency(totalFaturamento)}</strong>
          <span className="bm-kpi__hint">no periodo selecionado</span>
        </div>
        <div className="bm-kpi">
          <span className="bm-kpi__label">Atendimentos</span>
          <strong className="bm-kpi__value">{totalAtendimentos}</strong>
          <span className="bm-kpi__hint">no periodo</span>
        </div>
        <div className="bm-kpi">
          <span className="bm-kpi__label">Taxa de cancelamento</span>
          <strong className="bm-kpi__value">{noShow?.taxa || '0'}%</strong>
          <span className="bm-kpi__hint">{noShow?.cancelados || 0} de {noShow?.total || 0} agendamentos</span>
        </div>
        <div className="bm-kpi">
          <span className="bm-kpi__label">Clientes inativos</span>
          <strong className="bm-kpi__value">{inactive.length}</strong>
          <span className="bm-kpi__hint">+30 dias sem visitar</span>
        </div>
      </section>

      <section className="bm-grid-2">
        <div className="bm-card">
          <h2 className="bm-card__title">Faturamento diario</h2>
          <div className="table-responsive" style={{ maxHeight: 300 }}>
            <table className="table table-striped table-sm">
              <thead><tr><th>Data</th><th>Atendimentos</th><th>Faturamento</th></tr></thead>
              <tbody>
                {revenue.map(r => (
                  <tr key={r.data}><td>{r.data}</td><td>{r.atendimentos}</td><td>{formatCurrency(r.faturamento)}</td></tr>
                ))}
                {revenue.length === 0 && <tr><td colSpan={3} className="text-muted">Nenhum dado no periodo.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bm-card">
          <h2 className="bm-card__title">Horarios de pico</h2>
          <div className="table-responsive" style={{ maxHeight: 300 }}>
            <table className="table table-striped table-sm">
              <thead><tr><th>Hora</th><th>Agendamentos</th></tr></thead>
              <tbody>
                {peakHours.map(p => (
                  <tr key={p.hora}><td>{p.hora}:00</td><td>{p.total}</td></tr>
                ))}
                {peakHours.length === 0 && <tr><td colSpan={2} className="text-muted">Sem dados.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bm-card" style={{ marginTop: 24 }}>
        <header className="bm-card__head">
          <div>
            <h2 className="bm-card__title">Clientes inativos (+30 dias)</h2>
            <p className="bm-card__sub">{inactive.length} cliente(s) sem retorno.</p>
          </div>
        </header>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead><tr><th>Nome</th><th>Telefone</th><th>Ultima visita</th></tr></thead>
            <tbody>
              {inactive.map(c => (
                <tr key={c.id}>
                  <td><a href={'/painel/clientes/' + c.id}>{c.nome}</a></td>
                  <td>{c.telefone}</td>
                  <td>{c.ultima_visita || 'Nunca'}</td>
                </tr>
              ))}
              {inactive.length === 0 && <tr><td colSpan={3} className="text-muted">Nenhum cliente inativo.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Relatorios;
