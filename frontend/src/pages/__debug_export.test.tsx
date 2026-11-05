import { describe, it, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '@/test/render';
import DataExport from './DataExport';
import * as consentApi from '@/api/user-consent';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

vi.mock('@/api/user-consent');
vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));

const mockExportData = vi.mocked(consentApi.exportData);
const mockUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockUseAuth.mockReturnValue({
    user: { id: 7, name: 'Usuario Teste', email: 'usuario@test.com' },
    loading: false,
    logout: vi.fn(),
  } as any);
});

describe('debug', () => {
  it('component call inspection', async () => {
    mockExportData.mockResolvedValue({
      data: { name: 'Usuario Teste', emails: ['usuario@test.com'] },
    } as any);
    render(<><Toaster /><DataExport /></>);
    console.log('CALLS_BEFORE>>>', mockExportData.mock.calls.length);
    fireEvent.click(screen.getByRole('button', { name: /exportar meus dados/i }));
    console.log('CALLS_AFTER_CLICK>>>', mockExportData.mock.calls.length);
    await new Promise((r) => setTimeout(r, 300));
    console.log('RESULTS>>>', JSON.stringify(mockExportData.mock.results.map((r: any) => ({ status: r.status, value: r.value, error: r.error?.message }))));
    console.log('TOASTS>>>', document.querySelectorAll('[data-sonner-toast]').length);
    document.querySelectorAll('[data-sonner-toast]').forEach((t) => console.log('TOAST>>>', t.textContent));
  });
});
