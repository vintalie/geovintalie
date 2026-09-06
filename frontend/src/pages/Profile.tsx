import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateUser, me } from '../api/auth';
import 'bootstrap'

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(user!.id, { name, email });
      const response = await me();
      setUser(response.data);
      setMessage('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setMessage('Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>
      {message && <div className={`p-2 mb-2 ${message.includes('sucesso') ? 'bg-green-200' : 'bg-red-200'}`}>{message}</div>}
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-2">
          <label className="block">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
