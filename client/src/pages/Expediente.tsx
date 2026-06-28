import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const DIAS_FULL = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado'];

interface Expediente {
  id: number; funcionario_id: number; dia_semana: number;
  inicio: string; fim: string; pausa_inicio: string | null; pausa_fim: string | null;
}
interface Folga { id: number; funcionario_id: number; data: string; motivo: string | null; }

function Expediente() {
  const [searchParams] = useSearchParams();
  const filtroFunc = searchParams.get('funcionario_id');

  const [funcs, setFuncs] = useState<{ id: number; nome: string }[]>([]);
  const [selectedFunc, setSelectedFunc] = useState(filtroFunc || '');
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [editDia, setEditDia] = useState<{ dia: number; inicio: string; fim: string; pausa_ini: string; pausa_fim: string }>({ dia: 0, inicio: '09:00', fim: '18:00', pausa_ini: '', pausa_fim: '' });
  const [folgaData, setFolgaData] = useState('');
  const [folgaMotivo, setFolgaMotivo] = useState('');

  useEffect(() => {
    fetch(API + '/api/funcionarios', { credentials: 'include' })
      .then(r => r.json())
      .then(setFuncs);
  }, []);

  useEffect(() => {
    if (!selectedFunc) { setExpedientes([]); setFolgas([]); return; }
    Promise.all([
      fetch(API + '/api/expediente?funcionario_id=' + selectedFunc, { credentials: 'include' }).then(r => r.json()),
      fetch(API + '/api/folgas?funcionario_id=' + selectedFunc, { credentials: 'include' }).then(r => r.json()),
    ]).then(([exp, fol]) => { setExpedientes(exp); setFolgas(fol); });
  }, [selectedFunc]);

  const addExpediente = async () => {
    await fetch(API + '/api/expediente', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({
        funcionario_id: parseInt(selectedFunc), dia_semana: editDia.dia,
        inicio: editDia.inicio, fim: editDia.fim,
        pausa_inicio: editDia.pausa_ini || undefined, pausa_fim: editDia.pausa_fim || undefined,
      }),
    });
    const data = await fetch(API + '/api/expediente?funcionario_id=' + selectedFunc, { credentials: 'include' }).then(r => r.json());
    setExpedientes(data);
  };

  const removeExpediente = async (id: number) => {
    await fetch(API + '/api/expediente/' + id, { method: 'DELETE', credentials: 'include' });
    setExpedientes(prev => prev.filter(e => e.id !== id));
  };

  const addFolga = async () => {
    if (!folgaData) return;
    await fetch(API + '/api/folgas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ funcionario_id: parseInt(selectedFunc), data: folgaData, motivo: folgaMotivo || undefined }),
    });
    setFolgaData(''); setFolgaMotivo('');
    const data = await fetch(API + '/api/folgas?funcionario_id=' + selectedFunc, { credentials: 'include' }).then(r => r.json());
    setFolgas(data);
  };

  const removeFolga = async (id: number) => {
    await fetch(API + '/api/folgas/' + id, { method: 'DELETE', credentials: 'include' });
    setFolgas(prev => prev.filter(f => f.id !== id));
  };

  const funcNome = funcs.find(f => f.id === parseInt(selectedFunc))?.nome;

  return (
    <div className="bm-page">
      <header className="bm-page-head">
        <div>
          <p className="bm-eyebrow">BarberManager</p>
          <h1 className="bm-page-title">Horarios dos funcionarios</h1>
          <p className="bm-page-sub">Configure expediente e folgas.</p>
        </div>
      </header>

      <div className="bm-search-form">
        <select className="form-select" value={selectedFunc} onChange={e => setSelectedFunc(e.target.value)} style={{ maxWidth: 300 }}>
          <option value="">Selecione um funcionario...</option>
          {funcs.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </div>

      {selectedFunc && (
        <>
          <h3 className="bm-page-title" style={{ fontSize: 20, marginBottom: 12 }}>{funcNome} — Expediente semanal</h3>

          <div className="row g-2 mb-4">
            <div className="col-auto">
              <select className="form-select form-select-sm" value={editDia.dia} onChange={e => setEditDia({ ...editDia, dia: parseInt(e.target.value) })}>
                {DIAS_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="col-auto">
              <input type="time" className="form-control form-control-sm" value={editDia.inicio} onChange={e => setEditDia({ ...editDia, inicio: e.target.value })} />
            </div>
            <div className="col-auto">
              <input type="time" className="form-control form-control-sm" value={editDia.fim} onChange={e => setEditDia({ ...editDia, fim: e.target.value })} />
            </div>
            <div className="col-auto">
              <input type="time" className="form-control form-control-sm" placeholder="Pausa inicio" value={editDia.pausa_ini} onChange={e => setEditDia({ ...editDia, pausa_ini: e.target.value })} />
            </div>
            <div className="col-auto">
              <input type="time" className="form-control form-control-sm" placeholder="Pausa fim" value={editDia.pausa_fim} onChange={e => setEditDia({ ...editDia, pausa_fim: e.target.value })} />
            </div>
            <div className="col-auto">
              <button className="btn btn-dark btn-sm" onClick={addExpediente}>Adicionar</button>
            </div>
          </div>

          <table className="table table-striped table-sm">
            <thead><tr><th>Dia</th><th>Inicio</th><th>Fim</th><th>Pausa</th><th></th></tr></thead>
            <tbody>
              {expedientes.map(e => (
                <tr key={e.id}>
                  <td><strong>{DIAS_FULL[e.dia_semana]}</strong></td>
                  <td>{e.inicio}</td>
                  <td>{e.fim}</td>
                  <td>{e.pausa_inicio && e.pausa_fim ? e.pausa_inicio + ' - ' + e.pausa_fim : '-'}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => removeExpediente(e.id)}>Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="bm-page-title" style={{ fontSize: 20, margin: '24px 0 12px' }}>Folgas e dias bloqueados</h3>
          <div className="row g-2 mb-4">
            <div className="col-auto">
              <input type="date" className="form-control form-control-sm" value={folgaData} onChange={e => setFolgaData(e.target.value)} />
            </div>
            <div className="col-auto">
              <input type="text" className="form-control form-control-sm" placeholder="Motivo (opcional)" value={folgaMotivo} onChange={e => setFolgaMotivo(e.target.value)} />
            </div>
            <div className="col-auto">
              <button className="btn btn-dark btn-sm" onClick={addFolga} disabled={!folgaData}>Bloquear</button>
            </div>
          </div>

          <table className="table table-striped table-sm">
            <thead><tr><th>Data</th><th>Motivo</th><th></th></tr></thead>
            <tbody>
              {folgas.map(f => (
                <tr key={f.id}>
                  <td>{f.data}</td>
                  <td>{f.motivo || '-'}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => removeFolga(f.id)}>Remover</button></td>
                </tr>
              ))}
              {folgas.length === 0 && <tr><td colSpan={3} className="text-muted">Nenhuma folga cadastrada.</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Expediente;
