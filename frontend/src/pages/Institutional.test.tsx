import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import Institutional from './Institutional';
import { render } from '@/test/render';

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('Institutional', () => {
  it('renderiza a hero com título e descrição', () => {
    render(<Institutional />);
    expect(screen.getByText(/Comércio local, no mapa/i)).toBeInTheDocument();
    // O h1 quebra o texto em dois nós ("Propriedades e produtos" + <span>no mapa</span>)
    expect(screen.getByText(/Propriedades e produtos/i)).toBeInTheDocument();
    expect(screen.getByText(/no mapa/i)).toBeInTheDocument();
    expect(
      screen.getByAltText(/Mapa urbano com propriedades marcadas/i),
    ).toBeInTheDocument();
  });

  it('renderiza os 5 cards de "Como funciona"', () => {
    render(<Institutional />);
    expect(screen.getByText(/Cadastre lojas/i)).toBeInTheDocument();
    expect(screen.getByText(/Vincule produtos/i)).toBeInTheDocument();
    expect(screen.getByText(/Gere seu mapa/i)).toBeInTheDocument();
    expect(screen.getByText(/Incorpore/i)).toBeInTheDocument();
    expect(screen.getByText(/Importe.*Exporte/i)).toBeInTheDocument();
  });

  it('renderiza a seção de contato com link do WhatsApp', () => {
    render(<Institutional />);
    expect(screen.getByText(/Vamos conversar\?/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Chamar no WhatsApp/i });
    expect(link).toHaveAttribute('href', /wa\.me\/5513981412290/);
  });

  it('renderiza o cabeçalho do site com link Geovintalie e botão Entrar', () => {
    render(<Institutional />);
    expect(screen.getByRole('link', { name: /Geovintalie/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
});
