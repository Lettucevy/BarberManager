import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Summary {
  totalClientes: number;
  totalFuncionarios: number;
  agendamentosHoje: number;
  proximoAgendamento: {
    id: number;
    cliente_id: number;
    funcionario_id: number;
    servico_id: number;
    data: string;
    hora: string;
  } | null;
}

interface ServiceStat { id: number; nome: string; vezes: number; }
interface AttendanceStat { id: number; nome: string; atendimentos: number; }

interface AgendaItem {
  id: number;
  cliente_id: number;
  funcionario_id: number;
  servico_id: number;
  data: string;
  hora: string;
  status: string;
}

interface Cliente { id: number; nome: string; }
interface Funcionario { id: number; nome: string; especialidade?: string; }
interface Servico { id: number; nome: string; valor: number; duracao_min: number; }

const API = import.meta.env.VITE_API_URL;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return d + '/' + m + '/' + y;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'confirmado': return 'Confirmado';
    case 'concluido': return 'Concluido';
    case 'cancelado': return 'Cancelado';
    default: return status;
  }
}

function statusClass(status: string): string {
  switch (status) {
    case 'confirmado': return 'badge-soft-success';
    case 'concluido': return 'badge-soft-primary';
    case 'cancelado': return 'badge-soft-danger';
    default: return 'badge-soft-muted';
  }
}

function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [topServices, setTopServices] = useState<ServiceStat[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStat[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sum, top, att, ag, cl, fn, sv] = await Promise.all([
          fetch(API + '/api/dashboard/summary', { credentials: 'include' }).then((r) => r.json()),
          fetch(API + '/api/dashboard/top-services', { credentials: 'include' }).then((r) => r.json()),
          fetch(API + '/api/dashboard/attendance-by-employee', { credentials: 'include' }).then((r) => r.json()),
          fetch(API + '/api/agendamentos', { credentials: 'include' }).then((r) => r.json()),
          fetch(API + '/api/clientes', { credentials: 'include' }).then((r) => r.json()),
          fetch(API + '/api/funcionarios', { credentials: 'include' }).then((r) => r.json()),
          fetch(API + '/api/servicos', { credentials: 'include' }).then((r) => r.json()),
        ]);
        setSummary(sum);
        setTopServices(top || []);
        setAttendance(att || []);
        setAgenda(Array.isArray(ag) ? ag : []);
        setClientes(Array.isArray(cl) ? cl : []);
        setFuncionarios(Array.isArray(fn) ? fn : []);
        setServicos(Array.isArray(sv) ? sv : []);
      } catch (err) {
        console.error('Dashboard fetch error', err);
        setError('Nao foi possivel carregar os dados. Verifique se o servidor esta rodando.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const clienteNome = (id: number) => clientes.find((c) => c.id === id)?.nome || ('Cliente #' + id);
  const funcionarioNome = (id: number) => funcionarios.find((f) => f.id === id)?.nome || ('Profissional #' + id);
  const servicoNome = (id: number) => servicos.find((s) => s.id === id)?.nome || ('Servico #' + id);

  const agendaDoDia = useMemo(() => {
    return agenda
      .filter((a) => a.data === selectedDate && a.status !== 'cancelado')
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [agenda, selectedDate]);

  const faturamentoPrevisto = useMemo(() => {
    return agendaDoDia.reduce((acc, item) => {
      const servico = servicos.find((s) => s.id === item.servico_id);
      return acc + (servico ? Number(servico.valor) : 0);
    }, 0);
  }, [agendaDoDia, servicos]);

  const topServico = topServices[0];

  const attendanceData = {
    labels: attendance.map((a) => a.nome),
    datasets: [
      {
        label: 'Atendimentos',
        data: attendance.map((a) => a.atendimentos),
        backgroundColor: '#c89b3c',
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  };

  const attendanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b6375' } },
      y: { beginAtZero: true, ticks: { color: '#6b6375', precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } },
    },
  };

  const servicesData = {
    labels: topServices.map((s) => s.nome),
    datasets: [
      {
        data: topServices.map((s) => s.vezes),
        backgroundColor: ['#c89b3c', '#1f1d1b', '#6b6375', '#a07a2e', '#3b3a36'],
        borderWidth: 0,
      },
    ],
  };

  const servicesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { color: '#6b6375', boxWidth: 12 } } },
    cutout: '60%',
  };

  return (
    <div className="bm-page">
      <header className="bm-page-head">
        <div>
          <p className="bm-eyebrow">Painel da barbearia</p>
          <h1 className="bm-page-title">Dashboard</h1>
          <p className="bm-page-sub">Visao geral do movimento, equipe e faturamento previsto.</p>
        </div>
        <div className="bm-page-head__actions">
          <Link to="/agenda" className="btn btn-outline-dark btn-sm">Abrir agenda</Link>
          <Link to="/agendar" className="btn btn-dark btn-sm">Novo agendamento</Link>
        </div>
      </header>

      {error && <div className="alert alert-warning">{error}</div>}

      <section className="bm-kpi-grid">
        <article className="bm-kpi">
          <span className="bm-kpi__label">Clientes cadastrados</span>
          <strong className="bm-kpi__value">{summary?.totalClientes ?? '-'}</strong>
          <span className="bm-kpi__hint">base ativa no sistema</span>
        </article>
        <article className="bm-kpi">
          <span className="bm-kpi__label">Equipe ativa</span>
          <strong className="bm-kpi__value">{summary?.totalFuncionarios ?? '-'}</strong>
          <span className="bm-kpi__hint">profissionais prontos para atender</span>
        </article>
        <article className="bm-kpi bm-kpi--accent">
          <span className="bm-kpi__label">Agendamentos hoje</span>
          <strong className="bm-kpi__value">{summary?.agendamentosHoje ?? '-'}</strong>
          <span className="bm-kpi__hint">confirmados para {formatDate(todayIso())}</span>
        </article>
        <article className="bm-kpi">
          <span className="bm-kpi__label">Faturamento previsto</span>
          <strong className="bm-kpi__value">{formatCurrency(faturamentoPrevisto)}</strong>
          <span className="bm-kpi__hint">considerando a agenda de {formatDate(selectedDate)}</span>
        </article>
      </section>

      <section className="bm-grid-2">
        <article className="bm-card">
          <header className="bm-card__head">
            <div>
              <h2 className="bm-card__title">Proximo atendimento</h2>
              <p className="bm-card__sub">Cliente que entra na cadeira em seguida.</p>
            </div>
            <Link to="/agenda" className="bm-card__link">Ver agenda</Link>
          </header>
          {loading && <p className="text-muted">Carregando...</p>}
          {!loading && summary?.proximoAgendamento && (
            <div className="bm-next">
              <div className="bm-next__when">
                <span className="bm-next__time">{summary.proximoAgendamento.hora}</span>
                <span className="bm-next__date">{formatDate(summary.proximoAgendamento.data)}</span>
              </div>
              <div className="bm-next__info">
                <strong>{clienteNome(summary.proximoAgendamento.cliente_id)}</strong>
                <span>com {funcionarioNome(summary.proximoAgendamento.funcionario_id)}</span>
                <small>{servicoNome(summary.proximoAgendamento.servico_id)}</small>
              </div>
            </div>
          )}
          {!loading && !summary?.proximoAgendamento && (
            <div className="bm-empty">Nenhum agendamento confirmado pela frente.</div>
          )}
        </article>

        <article className="bm-card">
          <header className="bm-card__head">
            <div>
              <h2 className="bm-card__title">Servico mais procurado</h2>
              <p className="bm-card__sub">Baseado nos atendimentos concluidos.</p>
            </div>
          </header>
          {topServico ? (
            <div className="bm-top-service">
              <div>
                <strong className="bm-top-service__name">{topServico.nome}</strong>
                <span className="bm-top-service__hint">{topServico.vezes} atendimentos no periodo</span>
              </div>
              <span className="bm-top-service__rank">#1</span>
            </div>
          ) : (
            <div className="bm-empty">Ainda nao ha dados de servicos concluidos.</div>
          )}
          {topServices.length > 1 && (
            <ul className="bm-top-list">
              {topServices.slice(1, 4).map((s) => (
                <li key={s.id}>
                  <span>{s.nome}</span>
                  <span className="bm-top-list__count">{s.vezes}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="bm-grid-2">
        <article className="bm-card">
          <header className="bm-card__head">
            <div>
              <h2 className="bm-card__title">Atendimentos por profissional</h2>
              <p className="bm-card__sub">Produtividade acumulada da equipe.</p>
            </div>
          </header>
          <div className="bm-chart">
            {attendance.length > 0 ? (
              <Bar data={attendanceData} options={attendanceOptions} />
            ) : (
              <div className="bm-empty">Sem registros de atendimento ainda.</div>
            )}
          </div>
        </article>

        <article className="bm-card">
          <header className="bm-card__head">
            <div>
              <h2 className="bm-card__title">Servicos mais vendidos</h2>
              <p className="bm-card__sub">Mix de vendas concluido.</p>
            </div>
          </header>
          <div className="bm-chart bm-chart--short">
            {topServices.length > 0 ? (
              <Doughnut data={servicesData} options={servicesOptions} />
            ) : (
              <div className="bm-empty">Sem dados de vendas concluidas.</div>
            )}
          </div>
        </article>
      </section>

      <section className="bm-card bm-agenda">
        <header className="bm-card__head">
          <div>
            <h2 className="bm-card__title">Agenda do dia</h2>
            <p className="bm-card__sub">Horarios confirmados para a data selecionada.</p>
          </div>
          <label className="bm-date-picker">
            <span>Data</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control form-control-sm"
            />
          </label>
        </header>

        {agendaDoDia.length === 0 ? (
          <div className="bm-empty">Nenhum atendimento confirmado para {formatDate(selectedDate)}.</div>
        ) : (
          <div className="bm-agenda__list">
            {agendaDoDia.map((item) => (
              <div key={item.id} className="bm-agenda__row">
                <div className="bm-agenda__time">{item.hora}</div>
                <div className="bm-agenda__main">
                  <strong>{clienteNome(item.cliente_id)}</strong>
                  <span>{servicoNome(item.servico_id)} com {funcionarioNome(item.funcionario_id)}</span>
                </div>
                <span className={'bm-badge ' + statusClass(item.status)}>{statusLabel(item.status)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;