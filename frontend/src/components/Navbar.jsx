import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        MANGA<span>TRACKER</span>
      </Link>

      {user && (
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Minha Lista
          </Link>
          <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>
            Buscar
          </Link>
        </div>
      )}

      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-user">@{user.username}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>Sair</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Entrar</Link>
            <Link to="/register" className="btn btn-primary">Cadastrar</Link>
          </>
        )}
      </div>
    </nav>
  )
}