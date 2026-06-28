import { useEffect, useState } from 'react';

interface Historico {
  id: number;
  cliente_id: number;
  funcionario_id: number;
  servico_id: number;
  data: string;
  valor: number;
}
interface Cliente { id: number; nome: string; }
interface Funcionario { id: number; nome: string; }
interface Servico { id: number; nome: string; }

interface PaginatedResponse {
  data: Historico[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function Historico() {
  const [records, setRecords] = useState<Historico[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  const api = import.meta.env.VITE_API_URL;

  const load = async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '15' });
      if (q.trim()) params.set('q', q.trim());

      const [hRes, cRes, fRes, sRes] = await Promise.all([
        fetch(`${api}/api/historico?${params}`, { credentials: 'include' }),
        fetch(`${api}/api/clientes`, { credentials: 'include' }),
        fetch(`${api}/api/funcionarios`, { credentials: 'include' }),
        fetch(`${api}/api/servicos`, { credentials: 'include' }),
      ]);
      const [hData, cData, fData, sData] = await Promise.all([hRes.json(), cRes.json(), fRes.json(), sRes.json()]);
      const paginated = hData as PaginatedResponse;
      setRecords(paginated.data || []);
      setTotal(paginated.total || 0);
      setPage(paginated.page || 1);
      setTotalPages(paginated.totalPages || 1);
      setClientes(cData);
      setFuncionarios(fData);
      setServicos(sData);
    } catch (err) {
      console.error('Erro ao carregar histórico', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, busca);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1, busca);
  };

  const findName = (arr: { id: number; nome: string }[], id: number) => arr.find(i => i.id === id)?.nome || id;

  return (
    <div className="bm-page">
      <header className="bm-page-head">
        <div>
          <p className="bm-eyebrow">BarberManager</p>
          <h1 className="bm-page-title">Histórico de Atendimentos</h1>
          <p className="bm-page-sub">{total} registro(s) encontrado(s).</p>
        </div>
      </header>

      <form className="bm-search-form" onSubmit={handleSearch}>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar por nome do cliente, funcionário ou serviço..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button type="submit" className="btn btn-dark">Buscar</button>
      </form>

      {loading ? (
        <p className="text-muted">Carregando...</p>
      ) : records.length === 0 ? (
        <div className="bm-empty">Nenhum registro de atendimento encontrado.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr><th>#</th><th>Cliente</th><th>Funcionário</th><th>Serviço</th><th>Data</th><th>Valor</th></tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{findName(clientes, r.cliente_id)}</td>
                    <td>{findName(funcionarios, r.funcionario_id)}</td>
                    <td>{findName(servicos, r.servico_id)}</td>
                    <td>{r.data}</td>
                    <td>{formatCurrency(r.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="bm-pagination">
              <button
                className="btn btn-outline-dark btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span className="bm-pagination__info">Página {page} de {totalPages}</span>
              <button
                className="btn btn-outline-dark btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default Historico;
