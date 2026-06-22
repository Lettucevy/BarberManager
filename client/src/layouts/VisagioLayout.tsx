import { Outlet, Link } from 'react-router-dom';

function VisagioLayout() {
  return (
    <>
      <header className="vg-topbar">
        <div className="vg-topbar__inner">
          <Link to="/" className="vg-brand" aria-label="Visagio Cabeleireiro - inicio">
            <span className="vg-brand__mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="22" height="22">
                <path d="M6 26V10a10 10 0 0 1 20 0v16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="16" cy="10" r="2.4" fill="currentColor" />
                <path d="M11 18h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="vg-brand__text">
              <strong>Visagio</strong>
              <span>Cabeleireiro</span>
            </span>
          </Link>

          <nav className="vg-topbar__nav" aria-label="Acoes da vitrine">
            <a className="vg-topbar__link" href="#cortes">Cortes</a>
            <a className="vg-topbar__link" href="#equipe">Equipe</a>
            <a className="vg-topbar__link" href="#agendar">Agendar</a>
            <a className="vg-topbar__cta" href="#agendar">Reservar horario</a>
          </nav>
        </div>
      </header>

      <main className="vg-main">
        <Outlet />
      </main>

      <footer className="vg-footer">
        <strong>Visagio Cabeleireiro</strong>
        <span>Rua das Tesouras, 123 - Centro - Sao Paulo / SP</span>
        <span>(11) 99999-0000 - contato@visagiocabeleireiro.com.br</span>
        <span>Seg a Sab das 09h as 20h</span>
      </footer>
    </>
  );
}

export default VisagioLayout;