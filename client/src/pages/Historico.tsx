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

function Historico() {
  const [records, setRecords] = useState<Historico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  const api = import.meta.env.VITE_API_URL;

  const load = async () => {
    try {
      const [hRes, cRes, fRes, sRes] = await Promise.all([
        fetch(`${api}/api/historico`, { credentials: 'include' }),
        fetch(`${api}/api/clientes`, { credentials: 'include' }),
        fetch(`${api}/api/funcionarios`, { credentials: 'include' }),
        fetch(`${api}/api/servicos`, { credentials: 'include' }),
      ]);
      const [hData, cData, fData, sData] = await Promise.all([hRes.json(), cRes.json(), fRes.json(), sRes.json()]);
      setRecords(hData);
      setClientes(cData);
      setFuncionarios(fData);
      setServicos(sData);
    } catch (err) {
      console.error('Erro ao carregar histórico', err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const findName = (arr: { id: number; nome: string }[], id: number) => arr.find(i => i.id === id)?.nome || id;

  return (
    <div>
      <h2 className="mb-4">Histórico de Atendimentos</h2>
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
              <td>{r.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Historico;
