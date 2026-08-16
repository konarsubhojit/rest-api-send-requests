import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProxyToggle } from './ProxyToggle';

it('provides an accessible opt-in proxy toggle', async () => {
  const onChange = vi.fn();
  render(<ProxyToggle enabled={false} onChange={onChange} />);
  const toggle = screen.getByRole('switch', { name: /use cors proxy/i });
  expect(toggle).not.toBeChecked();
  await userEvent.click(toggle);
  expect(onChange).toHaveBeenCalledWith(true);
});
