import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TimerApp from './TimerApp';

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('TimerApp - Stopwatch Mode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial state with timer at 00:00:00', () => {
    renderWithRouter(<TimerApp />);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('starts timer when Start button is clicked', () => {
    renderWithRouter(<TimerApp />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    expect(screen.getByText('Pause')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:00:01')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('00:00:06')).toBeInTheDocument();
  });

  it('pauses timer when Pause button is clicked', () => {
    renderWithRouter(<TimerApp />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('00:00:03')).toBeInTheDocument();

    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('00:00:03')).toBeInTheDocument();
  });

  it('resets timer when Reset button is clicked', () => {
    renderWithRouter(<TimerApp />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('00:00:05')).toBeInTheDocument();

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('formats time correctly with hours', () => {
    renderWithRouter(<TimerApp />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    act(() => {
      vi.advanceTimersByTime(3661 * 1000);
    });

    expect(screen.getByText('01:01:01')).toBeInTheDocument();
  });

  it('formats time correctly with minutes only', () => {
    renderWithRouter(<TimerApp />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    act(() => {
      vi.advanceTimersByTime(125 * 1000);
    });

    expect(screen.getByText('00:02:05')).toBeInTheDocument();
  });
});

describe('TimerApp - Countdown Mode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('switches to countdown mode when button is clicked', () => {
    renderWithRouter(<TimerApp />);
    const modeButton = screen.getByText('Switch to Countdown');

    fireEvent.click(modeButton);
    expect(screen.getByText('Switch to Stopwatch')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Minutes')).toBeInTheDocument();
    expect(screen.getByText('Seconds')).toBeInTheDocument();
  });

  it('sets countdown time and counts down', () => {
    renderWithRouter(<TimerApp />);

    // Switch to countdown mode
    fireEvent.click(screen.getByText('Switch to Countdown'));

    // Set countdown for 10 seconds
    const secondsInput = screen.getAllByRole('spinbutton')[2];
    fireEvent.change(secondsInput, { target: { value: '10' } });
    fireEvent.click(screen.getByText('Set Duration'));

    expect(screen.getByText('00:00:10')).toBeInTheDocument();

    // Start countdown
    fireEvent.click(screen.getByText('Start'));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:00:09')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('00:00:04')).toBeInTheDocument();
  });

  it('stops at zero and shows Time\'s up! message', () => {
    renderWithRouter(<TimerApp />);

    // Switch to countdown mode
    fireEvent.click(screen.getByText('Switch to Countdown'));

    // Set countdown for 3 seconds
    const secondsInput = screen.getAllByRole('spinbutton')[2];
    fireEvent.change(secondsInput, { target: { value: '3' } });
    fireEvent.click(screen.getByText('Set Duration'));

    // Start countdown
    fireEvent.click(screen.getByText('Start'));

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(screen.getByText("Time's Up!")).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('pauses countdown correctly', () => {
    renderWithRouter(<TimerApp />);

    // Switch to countdown mode
    fireEvent.click(screen.getByText('Switch to Countdown'));

    // Set countdown for 10 seconds
    const secondsInput = screen.getAllByRole('spinbutton')[2];
    fireEvent.change(secondsInput, { target: { value: '10' } });
    fireEvent.click(screen.getByText('Set Duration'));

    // Start and pause
    fireEvent.click(screen.getByText('Start'));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('00:00:07')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Pause'));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('00:00:07')).toBeInTheDocument();
  });

  it('resets countdown to initial time', () => {
    renderWithRouter(<TimerApp />);

    // Switch to countdown mode
    fireEvent.click(screen.getByText('Switch to Countdown'));

    // Set countdown for 15 seconds
    const secondsInput = screen.getAllByRole('spinbutton')[2];
    fireEvent.change(secondsInput, { target: { value: '15' } });
    fireEvent.click(screen.getByText('Set Duration'));

    // Start, run, then reset
    fireEvent.click(screen.getByText('Start'));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('00:00:10')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reset'));
    expect(screen.getByText('00:00:15')).toBeInTheDocument();
  });

  it('correctly formats countdown time with hours and minutes', () => {
    renderWithRouter(<TimerApp />);

    // Switch to countdown mode
    fireEvent.click(screen.getByText('Switch to Countdown'));

    // Set countdown for 1 hour, 2 minutes, 3 seconds
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });
    fireEvent.change(inputs[2], { target: { value: '3' } });
    fireEvent.click(screen.getByText('Set Duration'));

    expect(screen.getByText('01:02:03')).toBeInTheDocument();
  });
});
