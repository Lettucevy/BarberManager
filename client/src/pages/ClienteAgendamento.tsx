import { useEffect, useMemo, useState } from 'react';

interface Servico {
  id: number;
  nome: string;
  valor: number;
  duracao_min: number;
  imagem?: string | null;
}

interface Funcionario {
  id: number;
  nome: string;
  especialidade?: string;
  status: string;
  imagem?: string | null;
}

interface Agendamento {
  id: number;
  data: string;
  hora: string;
  funcionario_id: number;
  status: string;
}

interface ClienteSessao {
  authenticated: boolean;
  id?: number;
  nome?: string;
  telefone?: string;
}

const API = import.meta.env.VITE_API_URL;
const HORARIOS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'];

const SERVICE_FALLBACK = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop';
const PROFILE_FALLBACK = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&crop=faces';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return d + '/' + m + '/' + y;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function ClienteAgendamento() {
  const [cliente, setCliente] = useState<ClienteSessao | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [busca, setBusca] = useState('');
  const [servicoId, setServicoId] = useState<number | ''>('');
  const [funcionarioId, setFuncionarioId] = useState<number | ''>('');
  const [data, setData] = useState<string>('');
  const [hora, setHora] = useState<string>('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [observacao, setObservacao] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ tipo: 'ok' | 'erro'; mensagem: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [agendamentosDia, setAgendamentosDia] = useState<Agendamento[]>([]);
  const [passo, setPasso] = useState<1 | 2 | 3>(1);

  const logado = cliente?.authenticated && cliente?.id;

  useEffect(() => {
    const carregar = async () => {
      try {
        const [sRes, fRes, aRes] = await Promise.all([
          fetch(API + '/api/servicos', { credentials: 'include' }),
          fetch(API + '/api/funcionarios', { credentials: 'include' }),
          fetch(API + '/api/auth/cliente/me', { credentials: 'include' }),
        ]);
        const [sData, fData, aData] = await Promise.all([sRes.json(), fRes.json(), aRes.json()]);
        setServicos(Array.isArray(sData) ? sData : []);
        const ativos = Array.isArray(fData) ? fData.filter((f: Funcionario) => f.status !== 'inativo') : [];
        setFuncionarios(ativos);
        setCliente(aData);
      } catch (err) {
        console.error('Erro ao carregar dados', err);
        setStatusMsg({ tipo: 'erro', mensagem: 'Nao conseguimos carregar os servicos. Tente novamente.' });
      }
    };
    carregar();
  }, []);

  useEffect(() => {
    if (!data) { setAgendamentosDia([]); return; }
    const carregar = async () => {
      try {
        const res = await fetch(API + '/api/agendamentos?data=' + data, { credentials: 'include' });
        const lista = await res.json();
        setAgendamentosDia(Array.isArray(lista) ? lista : []);
      } catch (err) {
        console.error('Erro ao carregar horarios', err);
      }
    };
    carregar();
  }, [data]);

  const servicosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return servicos;
    return servicos.filter((s) => s.nome.toLowerCase().includes(termo));
  }, [busca, servicos]);

  const servicoEscolhido = servicos.find((s) => s.id === servicoId);
  const funcionarioEscolhido = funcionarios.find((f) => f.id === funcionarioId);

  const horariosOcupados = useMemo(() => {
    const ocupados = new Set<string>();
    agendamentosDia.forEach((a) => {
      if (a.status === 'cancelado') return;
      if (funcionarioId && a.funcionario_id !== funcionarioId) return;
      ocupados.add(a.hora);
    });
    return ocupados;
  }, [agendamentosDia, funcionarioId]);

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!servicoId || !funcionarioId || !data || !hora) {
      setStatusMsg({ tipo: 'erro', mensagem: 'Selecione servico, profissional, data e horario.' });
      return;
    }
    if (!logado && (!nome || !telefone)) {
      setStatusMsg({ tipo: 'erro', mensagem: 'Preencha nome e telefone.' });
      return;
    }

    setEnviando(true);
    try {
      let clienteId: number;

      if (logado) {
        clienteId = cliente!.id!;
      } else {
        const clienteRes = await fetch(API + '/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ nome, telefone, email: email || undefined }),
        });
        if (!clienteRes.ok) {
          const err = await clienteRes.json().catch(() => ({}));
          throw new Error(err.message || 'Nao foi possivel registrar seus dados.');
        }
        const novoCliente = await clienteRes.json();
        clienteId = novoCliente.id;
      }

      const agendamentoRes = await fetch(API + '/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cliente_id: clienteId,
          funcionario_id: funcionarioId,
          servico_id: servicoId,
          data: data,
          hora: hora,
          observacao: observacao || undefined,
        }),
      });
      if (!agendamentoRes.ok) {
        const err = await agendamentoRes.json().catch(() => ({}));
        throw new Error(err.message || 'Horario indisponivel.');
      }

      const nomeCliente = logado ? cliente!.nome : nome;
      setStatusMsg({ tipo: 'ok', mensagem: 'Tudo certo, ' + (nomeCliente?.split(' ')[0] || '') + '! Sua reserva foi confirmada.' });
      setObservacao('');
      setServicoId(''); setFuncionarioId(''); setData(''); setHora('');
      setNome(''); setTelefone(''); setEmail('');
      setPasso(1);
    } catch (err) {
      setStatusMsg({ tipo: 'erro', mensagem: err instanceof Error ? err.message : 'Falha ao enviar.' });
    } finally {
      setEnviando(false);
    }
  };

  const selecionarServico = (id: number) => {
    setServicoId(id);
    setPasso(2);
  };

  const selecionarFuncionario = (id: number) => {
    setFuncionarioId(id);
    setPasso(3);
  };

  const alertClass = statusMsg ? 'alert ' + (statusMsg.tipo === 'ok' ? 'alert-success' : 'alert-danger') + ' vg-alert' : '';
  const serviceClass = (id: number) => 'vg-service' + (servicoId === id ? ' is-selected' : '');
  const barberClass = (id: number) => 'vg-barber' + (funcionarioId === id ? ' is-selected' : '');
  const slotClass = (_h: string, ocupado: boolean, selecionado: boolean) =>
    'vg-slot' + (ocupado ? ' is-busy' : '') + (selecionado ? ' is-selected' : '');

  return (
    <>
      <section className="vg-hero" id="agendar">
        <div className="vg-hero__content">
          <p className="vg-eyebrow">Agendamento online</p>
          <h1>Reserve seu horario na Visagio Cabeleireiro</h1>
          <p>
            Escolha o corte, o profissional e o horario que combinam com voce.
            Em poucos cliques sua cadeira esta garantida.
          </p>
          <div className="vg-hero__meta">
            <span><strong>1</strong> escolha o servico</span>
            <span><strong>2</strong> escolha o profissional</span>
            <span><strong>3</strong> escolha o horario</span>
            {!logado && <span><strong>4</strong> confirme seus dados</span>}
          </div>
        </div>
      </section>

      <ol className="vg-steps">
        <li className={passo >= 1 ? 'is-active' : ''} data-state={servicoId ? 'done' : passo === 1 ? 'current' : 'todo'}>
          <span className="vg-steps__dot">1</span>Servico
        </li>
        <li className={passo >= 2 ? 'is-active' : ''} data-state={funcionarioId ? 'done' : passo === 2 ? 'current' : 'todo'}>
          <span className="vg-steps__dot">2</span>Profissional
        </li>
        <li className={passo >= 3 ? 'is-active' : ''} data-state={data && hora ? 'done' : passo === 3 ? 'current' : 'todo'}>
          <span className="vg-steps__dot">3</span>Data e horario
        </li>
        {!logado && (
          <li className={passo >= 3 ? 'is-active' : ''} data-state={passo === 3 && data && hora ? 'current' : 'todo'}>
            <span className="vg-steps__dot">4</span>Seus dados
          </li>
        )}
      </ol>

      {statusMsg && (
        <div className={alertClass}>
          {statusMsg.mensagem}
        </div>
      )}

      <form className="vg-booking" onSubmit={submeter}>
        <section className="vg-step-card" id="cortes">
          <header>
            <h2 className="vg-step-card__title">1. Escolha o servico</h2>
            <input
              type="search"
              className="form-control vg-search"
              placeholder="Buscar servico..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </header>
          {servicosFiltrados.length === 0 ? (
            <div className="vg-empty">Nenhum servico disponivel no momento.</div>
          ) : (
            <div className="vg-services">
              {servicosFiltrados.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  className={serviceClass(s.id)}
                  onClick={() => selecionarServico(s.id)}
                >
                  <span className="vg-service__media">
                    <img src={s.imagem || SERVICE_FALLBACK} alt={'Foto de ' + s.nome} loading="lazy" />
                  </span>
                  <span className="vg-service__body">
                    <span className="vg-service__name">{s.nome}</span>
                    <span className="vg-service__meta">
                      <span>{s.duracao_min} min</span>
                      <strong className="vg-service__price">{formatCurrency(s.valor)}</strong>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="vg-step-card" id="equipe">
          <header>
            <h2 className="vg-step-card__title">2. Escolha o profissional</h2>
            <p className="vg-step-card__sub">Cada barbeiro tem seu estilo, escolha o seu favorito.</p>
          </header>
          {funcionarios.length === 0 ? (
            <div className="vg-empty">Sem profissionais disponiveis.</div>
          ) : (
            <div className="vg-barbers">
              {funcionarios.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  className={barberClass(f.id)}
                  onClick={() => selecionarFuncionario(f.id)}
                >
                  <span className="vg-barber__photo">
                    <img src={f.imagem || PROFILE_FALLBACK} alt={'Foto de ' + f.nome} loading="lazy" />
                  </span>
                  <span className="vg-barber__info">
                    <strong>{f.nome}</strong>
                    <small>{f.especialidade || 'Barbeiro'}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="vg-step-card">
          <header>
            <h2 className="vg-step-card__title">3. Escolha data e horario</h2>
            <p className="vg-step-card__sub">Selecione um dia e clique em um horario livre.</p>
          </header>
          <div className="vg-datetime">
            <label className="vg-field">
              <span>Data</span>
              <input
                type="date"
                className="form-control"
                min={todayIso()}
                value={data}
                onChange={(e) => { setData(e.target.value); setHora(''); }}
              />
            </label>
            <div className="vg-slots">
              <span className="vg-slots__legend">Horarios disponiveis</span>
              {!data ? (
                <div className="vg-empty">Selecione uma data para ver os horarios.</div>
              ) : (
                <div className="vg-slots__grid">
                  {HORARIOS.map((h) => {
                    const ocupado = horariosOcupados.has(h);
                    const selecionado = hora === h;
                    return (
                      <button
                        type="button"
                        key={h}
                        className={slotClass(h, ocupado, selecionado)}
                        onClick={() => { if (!ocupado) setHora(h); }}
                        disabled={ocupado}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {!logado && (
          <section className="vg-step-card">
            <header>
              <h2 className="vg-step-card__title">4. Seus dados</h2>
              <p className="vg-step-card__sub">Para confirmar o agendamento, preencha seus dados de contato.</p>
            </header>
            <div className="vg-fields">
              <label className="vg-field">
                <span>Nome completo*</span>
                <input type="text" className="form-control" required value={nome}
                  onChange={(e) => setNome(e.target.value)} placeholder="Como podemos te chamar?" />
              </label>
              <label className="vg-field">
                <span>Telefone*</span>
                <input type="tel" className="form-control" required value={telefone}
                  onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-0000" />
              </label>
              <label className="vg-field">
                <span>Email</span>
                <input type="email" className="form-control" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="opcional" />
              </label>
              <label className="vg-field vg-field--full">
                <span>Observacao</span>
                <textarea className="form-control" rows={2} value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Algo que o barbeiro precise saber?" />
              </label>
            </div>
          </section>
        )}

        {logado && (
          <section className="vg-step-card">
            <header>
              <h2 className="vg-step-card__title">Confirmacao</h2>
              <p className="vg-step-card__sub">Cliente: <strong>{cliente!.nome}</strong> &mdash; {cliente!.telefone}</p>
            </header>
            <div className="vg-fields">
              <label className="vg-field vg-field--full">
                <span>Observacao</span>
                <textarea className="form-control" rows={2} value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Algo que o barbeiro precise saber?" />
              </label>
            </div>
          </section>
        )}

        <aside className="vg-summary">
          <h3 className="vg-summary__title">Resumo da reserva</h3>
          <ul>
            <li>
              <span>Servico</span>
              <strong>{servicoEscolhido?.nome || 'Selecione um servico'}</strong>
            </li>
            <li>
              <span>Profissional</span>
              <strong>{funcionarioEscolhido?.nome || 'Qualquer profissional'}</strong>
            </li>
            <li>
              <span>Data</span>
              <strong>{data ? formatDate(data) : '-'}</strong>
            </li>
            <li>
              <span>Horario</span>
              <strong>{hora || '-'}</strong>
            </li>
            <li className="vg-summary__total">
              <span>Total previsto</span>
              <strong>{servicoEscolhido ? formatCurrency(servicoEscolhido.valor) : '-'}</strong>
            </li>
          </ul>
          <button type="submit" className="btn btn-dark btn-lg w-100" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Confirmar reserva'}
          </button>
          {!logado && (
            <p className="vg-summary__hint">
              Ja tem cadastro? <a href="/minha-conta">Faca login</a> para agendar mais rapido.
            </p>
          )}
        </aside>
      </form>
    </>
  );
}

export default ClienteAgendamento;
