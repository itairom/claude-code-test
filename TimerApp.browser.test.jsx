import { render } from 'vitest-browser-react';
import { describe, it, expect, vi } from 'vitest';
import { page } from 'vitest/browser';
import TimerApp from './TimerApp.jsx';

// Mock react-router-dom's Link component to avoid Router context issues
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  };
});

describe('TimerApp - Browser Tests', () => {
  it('should render the timer component in the browser', async () => {
    const screen = await render(<TimerApp />);

    // Test that the main timer display is rendered
    const timerDisplay = screen.getByTestId('timer-display');
    await expect.element(timerDisplay).toBeInTheDocument();

    // Test that initial time is 00:00:00
    await expect.element(timerDisplay).toHaveTextContent('00:00:00');
  });

  it('should have stopwatch mode toggle button', async () => {
    const screen = await render(<TimerApp />);

    // Test that mode toggle button exists
    const modeToggle = screen.getByRole('button', { name: /switch to countdown/i });
    await expect.element(modeToggle).toBeInTheDocument();
  });

  it('should have start/pause button in stopwatch mode', async () => {
    const screen = await render(<TimerApp />);

    // Test that start button exists in stopwatch mode
    const startButton = screen.getByRole('button', { name: /start/i });
    await expect.element(startButton).toBeInTheDocument();
  });

  it('should toggle between stopwatch and countdown modes', async () => {
    const screen = await render(<TimerApp />);

    // Find the mode toggle button
    const modeToggle = screen.getByRole('button', { name: /switch to countdown/i });

    // Click to switch to countdown mode
    await modeToggle.click();

    // Verify the button text changed
    await expect.element(screen.getByRole('button', { name: /switch to stopwatch/i })).toBeInTheDocument();
  });
});
