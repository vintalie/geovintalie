import React from 'react';
import { useAuth } from '../hooks/useAuth';
import 'bootstrap'
const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-3xl font-bold">Bem-vindo, {user?.name}!</h1>
      <p className="mt-2">Use o menu lateral para gerenciar localidades.</p>
    </div>
  );
};

export default Dashboard;
