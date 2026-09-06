import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../api/auth';

const Sidebar = () => {
  const { logout: logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      logoutContext();
      navigate('/login');
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold">Admin</div>
      <nav className="flex-1">
        <NavLink to="/" className={({ isActive }) => `block p-3 ${isActive ? 'bg-gray-700' : ''}`}>Dashboard</NavLink>
        <NavLink to="/countries" className={({ isActive }) => `block p-3 ${isActive ? 'bg-gray-700' : ''}`}>Países</NavLink>
        <NavLink to="/states" className={({ isActive }) => `block p-3 ${isActive ? 'bg-gray-700' : ''}`}>Estados</NavLink>
        <NavLink to="/cities" className={({ isActive }) => `block p-3 ${isActive ? 'bg-gray-700' : ''}`}>Cidades</NavLink>
        <NavLink to="/neighborhoods" className={({ isActive }) => `block p-3 ${isActive ? 'bg-gray-700' : ''}`}>Bairros</NavLink>
        <NavLink to="/streets" className={({ isActive }) => `block p-3 ${isActive ? 'bg-gray-700' : ''}`}>Ruas</NavLink>
        <NavLink to="/properties" className={({ isActive }) => `block p-3 ${isActive ? 'bg-gray-700' : ''}`}>Propriedades</NavLink>
        <NavLink to="/products" className={({ isActive }) => `block p-3 ${isActive ? 'bg-gray-700' : ''}`}>Produtos</NavLink>
        <NavLink to="/profile" className={({ isActive }) => `block p-3 ${isActive ? 'bg-gray-700' : ''}`}>Perfil</NavLink>
      </nav>
      <button onClick={handleLogout} className="p-4 bg-red-600 hover:bg-red-700 text-left">
        Sair
      </button>
    </div>
  );
};


export default Sidebar;
