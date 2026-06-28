import { useEffect, useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';

function getInitialTheme(): boolean {
  const stored = localStorage.getItem('bm-theme');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function BrandMark() {
  return (
    <span className="bm-brand">
      <span className="bm-brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="22" height="22">
          <path d="M6 26V10a10 10 0 0 1 20 0v16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="16" cy="10" r="2.4" fill="currentColor" />
          <path d="M11 18h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className="bm-brand__text">
        <strong>Barber</strong>Manager
      </span>
    </span>
  );
}

function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(getInitialTheme);
  const closeMenu = () => setMenuOpen(false);

  const navClass = ['bm-nav', menuOpen ? 'is-open' : ''].filter(Boolean).join(' ');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('bm-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <>
      <header className="bm-topbar">
        <div className="bm-topbar__inner">
          <Link to="/painel/dashboard" className="bm-topbar__brand" onClick={closeMenu}>
            <BrandMark />
          </Link>

          <button
            className="bm-theme-toggle"
            type="button"
            aria-label={dark ? 'Modo claro' : 'Modo escuro'}
            onClick={() => setDark(d => !d)}
          >
            {dark ? '\u2600' : '\u263E'}
          </button>

          <button
            className="bm-topbar__toggle"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={navClass}>
            <NavLink to="/painel/dashboard" className="bm-nav__link" onClick={closeMenu}>Dashboard</NavLink>
            <NavLink to="/painel/agenda" className="bm-nav__link" onClick={closeMenu}>Agenda</NavLink>
            <NavLink to="/painel/clientes" className="bm-nav__link" onClick={closeMenu}>Clientes</NavLink>
            <NavLink to="/painel/funcionarios" className="bm-nav__link" onClick={closeMenu}>Funcionarios</NavLink>
            <NavLink to="/painel/servicos" className="bm-nav__link" onClick={closeMenu}>Servicos</NavLink>
            <NavLink to="/painel/historico" className="bm-nav__link" onClick={closeMenu}>Historico</NavLink>
            <NavLink to="/painel/relatorios" className="bm-nav__link" onClick={closeMenu}>Relatorios</NavLink>
            <NavLink to="/painel/comissoes" className="bm-nav__link" onClick={closeMenu}>Comissoes</NavLink>
            <NavLink to="/painel/expediente" className="bm-nav__link" onClick={closeMenu}>Horarios</NavLink>
            <div className="bm-nav__divider" aria-hidden="true"></div>
            <Link to="/" className="bm-nav__link" onClick={closeMenu}>Ver vitrine</Link>
          </nav>
        </div>
      </header>

      <main className="bm-main">
        <Outlet />
      </main>

      <footer className="bm-footer">
        <span>BarberManager</span>
        <span>Acesso restrito ao proprietario da barbearia.</span>
      </footer>
    </>
  );
}

export default AdminLayout;
