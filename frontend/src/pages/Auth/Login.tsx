import React, { useState,  useEffect} from 'react';
import { useNavigate} from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';



const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, login: setAuth } = useAuth();

  useEffect(() => {
    if (user) {
      console.log(user)
      console.log(useNavigate)
      navigate('/');
    }
  }, [user, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      const { token, user } = response.data;
      setAuth(token, user);
      console.log(['sucesso' ,token , user]);
      navigate('/')
    } catch (err: any) {
      console.log('erro',err.response?.data?.message)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border mb-2"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border mb-4"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-black p-2 rounded">
          Entrar
        </button>
        <p className="mt-2 text-center">
          Não tem conta? <a href="/register" className="text-blue-500">Registre-se</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
