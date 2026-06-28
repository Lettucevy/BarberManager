import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

interface Agendamento {
  id: number;
  cliente_id: number;
  funcionario_id: number;
  servico_id: number;
  data: string;
  hora: string;
  status: string;
  observacao?: string | null;
}

interface Servico { id: number; nome: string; valor: number; }
interface Funcionario { id: number; nome: string; }

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return d + '/' + m + '/' + y;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const HORARIOS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'];

function MeusAgendamentos() {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<{ id: number; nome: string } | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [reagendando, setReagendando] = useState<number | null>(null);
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [horariosOcupados, setHorariosOcupados] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(API + '/api/auth/cliente/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data.authenticated) { navigate('/minha-conta'); return; }
        setCliente(data);
      })
      .catch(() => navigate('/minha-conta'));
  }, []);

  useEffect(() => {
    if (!cliente) return;
    const load = async () => {
      try {
        const [aRes, sRes, fRes] = await Promise.all([
          fetch(API + '/api/agendamentos?cliente_id=' + cliente.id, { credentials: 'include' }),
          fetch(API + '/api/servicos', { credentials: 'include' }),
          fetch(API + '/api/funcionarios', { credentials: 'include' }),
        ]);
        setAgendamentos(await aRes.json());
        setServicos(await sRes.json());
        setFuncionarios((await fRes.json()).filter((f: any) => f.status !== 'inativo'));
      } catch (err) {
        console.error('Erro ao carregar agendamentos', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cliente]);

  useEffect(() => {
    if (!reagendando || !novaData) { setHorariosOcupados(new Set()); return; }
    const item = agendamentos.find(a => a.id === reagendando);
    if (!item) return;
    fetch(API + '/api/agendamentos?data=' + novaData + '&funcionario_id=' + item.funcionario_id, { credentials: 'include' })
      .then(r => r.json())
      .then((lista: Agendamento[]) => {
        const ocupados = new Set<string>();
        lista.forEach(a => {
          if (a.status !== 'cancelado' && a.id !== reagendando) ocupados.add(a.hora);
        });
        setHorariosOcupados(ocupados);
      })
      .catch(() => {});
  }, [reagendando, novaData]);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancelar este agendamento?')) return;
    try {
      const res = await fetch(API + '/api/agendamentos/' + id, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao cancelar');
      setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelado' } : a));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar');
    }
  };

  const handleReagendar = async (id: number) => {
    if (!novaData || !novaHora) return;
    try {
      const res = await fetch(API + '/api/agendamentos/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: novaData, hora: novaHora }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao reagendar');
      }
      setReagendando(null);
      setNovaData('');
      setNovaHora('');
      const [aRes] = await Promise.all([
        fetch(API + '/api/agendamentos?cliente_id=' + cliente!.id, { credentials: 'include' }),
      ]);
      setAgendamentos(await aRes.json());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reagendar');
    }
  };

  if (loading) return <p className="text-muted">Carregando...</p>;

  const hoje = new Date().toISOString().slice(0, 10);
  const ativos = agendamentos.filter(a => a.status === 'confirmado' && a.data >= hoje);
  const passados = agendamentos.filter(a => a.status !== 'confirmado' || a.data < hoje);

  return (
    <section className="vg-account">
      <div className="vg-account__card vg-account__card--wide">
        <div className="vg-account__head">
          <div>
            <h1>Meus Agendamentos</h1>
            <p className="vg-account__sub">Ola, {cliente?.nome}! Gerencie seus horarios.</p>
          </div>
          <button className="btn btn-outline-dark btn-sm" onClick={() => {
            fetch(API + '/api/auth/cliente/logout', { method: 'POST', credentials: 'include' })
              .then(() => navigate('/minha-conta'));
          }}>Sair</button>
        </div>

        {ativos.length === 0 ? (
          <div className="vg-empty">Nenhum agendamento futuro.</div>
        ) : (
          <div className="vg-appointments">
            {ativos.map(a => {
              const servico = servicos.find(s => s.id === a.servico_id);
              const func = funcionarios.find(f => f.id === a.funcionario_id);
              return (
                <div key={a.id} className="vg-appointment">
                  <div className="vg-appointment__head">
                    <span className="vg-appointment__date">{formatDate(a.data)}</span>
                    <span className="vg-appointment__time">{a.hora}</span>
                    <span className="vg-badge vg-badge--confirmed">Confirmado</span>
                  </div>
                  <div className="vg-appointment__body">
                    <strong>{servico?.nome || 'Servico'}</strong>
                    <span>com {func?.nome || 'Profissional'}</span>
                    {servico && <span className="vg-appointment__price">{formatCurrency(servico.valor)}</span>}
                  </div>
                  <div className="vg-appointment__actions">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(a.id)}>Cancelar</button>
                    <button className="btn btn-sm btn-outline-dark" onClick={() => {
                      setReagendando(reagendando === a.id ? null : a.id);
                      setNovaData('');
                      setNovaHora('');
                    }}>
                      {reagendando === a.id ? 'Fechar' : 'Reagendar'}
                    </button>
                    <a
                      href={'data:text/calendar;charset=utf-8,' + encodeURIComponent(criarICS(a, servico))}
                      download={'agendamento-' + a.id + '.ics'}
                      className="btn btn-sm btn-outline-dark"
                    >
                      + Calendario
                    </a>
                  </div>

                  {reagendando === a.id && (
                    <div className="vg-reschedule">
                      <label className="vg-field">
                        <span>Nova data</span>
                        <input type="date" className="form-control" min={hoje} value={novaData} onChange={e => { setNovaData(e.target.value); setNovaHora(''); }} />
                      </label>
                      <label className="vg-field">
                        <span>Novo horario</span>
                        <div className="vg-slots__grid vg-slots__grid--sm">
                          {HORARIOS.map(h => {
                            const ocupado = horariosOcupados.has(h);
                            return (
                              <button key={h} type="button"
                                className={'vg-slot' + (ocupado ? ' is-busy' : '') + (novaHora === h ? ' is-selected' : '')}
                                disabled={!novaData || ocupado}
                                onClick={() => setNovaHora(h)}
                              >{h}</button>
                            );
                          })}
                        </div>
                      </label>
                      <button className="btn btn-dark btn-sm" disabled={!novaData || !novaHora} onClick={() => handleReagendar(a.id)}>
                        Confirmar reagendamento
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {passados.length > 0 && (
          <>
            <h2 className="vg-account__subtitle">Histórico</h2>
            <div className="vg-appointments">
              {passados.map(a => {
                const servico = servicos.find(s => s.id === a.servico_id);
                const func = funcionarios.find(f => f.id === a.funcionario_id);
                return (
                  <div key={a.id} className="vg-appointment vg-appointment--past">
                    <div className="vg-appointment__head">
                      <span className="vg-appointment__date">{formatDate(a.data)}</span>
                      <span className="vg-appointment__time">{a.hora}</span>
                      <span className={'vg-badge vg-badge--' + a.status}>{a.status}</span>
                    </div>
                    <div className="vg-appointment__body">
                      <strong>{servico?.nome || 'Servico'}</strong>
                      <span>com {func?.nome || 'Profissional'}</span>
                      {servico && <span className="vg-appointment__price">{formatCurrency(servico.valor)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function criarICS(a: Agendamento, servico?: Servico): string {
  const [y, m, d] = a.data.split('-');
  const [hh, mm] = a.hora.split(':');
  const start = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm));
  const end = new Date(start.getTime() + (servico?.duracao_min || 30) * 60000);

  const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'SUMMARY:' + (servico?.nome || 'Agendamento Visagio'),
    'DTSTART:' + fmt(start),
    'DTEND:' + fmt(end),
    'DESCRIPTION:Agendamento na Visagio Cabeleireiro',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export default MeusAgendamentos;
