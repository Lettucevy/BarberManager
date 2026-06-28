import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL;

interface ComissaoRow {
  funcionario_id: number;
  funcionario_nome: string;
  atendimentos: number;
  total_vendas: number;
  total_comissao: number;
}

function formatCurrency(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v); }

function Comissoes() {
  const [rows, setRows] = useState<ComissaoRow[]>([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (dataInicio) params.set('data_inicio', dataInicio);
    if (dataFim) params.set('data_fim', dataFim);

    fetch(API + '/api/comissoes?' + params, { credentials: 'include' })
      .then(r => r.json())
      .then(setRows)
      .catch(console.error);
  }, [dataInicio, dataFim]);

  const totalComissao = rows.reduce((acc, r) => acc + r.total_comissao, 0);
  const totalVendas = rows.reduce((acc, r) => acc + r.total_vendas, 0);

  return (
    <div className="bm-page">
      <header className="bm-page-head">
        <div>
          <p className="bm-eyebrow">BarberManager</p>
          <h1 className="bm-page-title">Comissoes</h1>
          <p className="bm-page-sub">Acompanhe as comissoes dos profissionais.</p>
        </div>
      </header>

      <div className="bm-search-form">
        <input type="date" className="form-control" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
        <input type="date" className="form-control" value={dataFim} onChange={e => setDataFim(e.target.value)} />
        <button className="btn btn-outline-dark btn-sm" onClick={() => { setDataInicio(''); setDataFim(''); }}>Limpar</button>
      </div>

      <section className="bm-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="bm-kpi">
          <span className="bm-kpi__label">Total em vendas</span>
          <strong className="bm-kpi__value">{formatCurrency(totalVendas)}</strong>
        </div>
        <div className="bm-kpi">
          <span className="bm-kpi__label">Total em comissoes</span>
          <strong className="bm-kpi__value">{formatCurrency(totalComissao)}</strong>
        </div>
        <div className="bm-kpi">
          <span className="bm-kpi__label">% de comissao</span>
          <strong className="bm-kpi__value">{totalVendas > 0 ? ((totalComissao / totalVendas) * 100).toFixed(1) : '0'}%</strong>
        </div>
      </section>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead><tr><th>Profissional</th><th>Atendimentos</th><th>Total vendas</th><th>Comissao</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.funcionario_id}>
                <td><strong>{r.funcionario_nome}</strong></td>
                <td>{r.atendimentos}</td>
                <td>{formatCurrency(r.total_vendas)}</td>
                <td><strong>{formatCurrency(r.total_comissao)}</strong></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="text-muted">Nenhum registro no periodo.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Comissoes;
