import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimerApp from './TimerApp';

describe('TimerApp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial state with timer at 00:00:00', () => {
    render(<TimerApp />);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('starts timer when Start button is clicked', () => {
    render(<TimerApp />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    expect(screen.getByText('Pause')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);
    expect(screen.getByText('00:00:01')).toBeInTheDocument();

    vi.advanceTimersByTime(5000);
    expect(screen.getByText('00:00:06')).toBeInTheDocument();
  });

  it('pauses timer when Pause button is clicked', () => {
    render(<TimerApp />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    vi.advanceTimersByTime(3000);
    expect(screen.getByText('00:00:03')).toBeInTheDocument();

    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);

    vi.advanceTimersByTime(2000);
    expect(screen.getByText('00:00:03')).toBeInTheDocument();
  });

  it('resets timer when Reset button is clicked', () => {
    render(<TimerApp />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    vi.advanceTimersByTime(5000);
    expect(screen.getByText('00:00:05')).toBeInTheDocument();

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('formats time correctly with hours', () => {
    render(<TimerApp />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    vi.advanceTimersByTime(3661 * 1000);

    expect(screen.getByText('01:01:01')).toBeInTheDocument();
  });

  it('formats time correctly with minutes only', () => {
    render(<TimerApp />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    vi.advanceTimersByTime(125 * 1000);

    expect(screen.getByText('00:02:05')).toBeInTheDocument();
  });
});
