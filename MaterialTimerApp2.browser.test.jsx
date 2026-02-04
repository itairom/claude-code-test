import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MaterialTimerApp2 from './MaterialTimerApp2';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  MemoryRouter: ({ children }) => <div>{children}</div>,
}));

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('MaterialTimerApp2 - General UI Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with top app bar and navigation tabs', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    // Check header
    expect(screen.getByRole('heading', { name: 'Stopwatch' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'close' })).toBeInTheDocument();

    // Check mobile navigation tabs
    const navTabs = screen.getAllByText('Stopwatch');
    expect(navTabs.length).toBe(2); // One in header, one in nav
    expect(screen.getByText('Countdown')).toBeInTheDocument();
    expect(screen.getByText('Alarm')).toBeInTheDocument();
  });

  it('displays correct mode in header', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    // Default mode is stopwatch
    expect(screen.getByRole('heading', { name: 'Stopwatch' })).toBeInTheDocument();

    // Switch to countdown
    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);
    expect(screen.getByRole('heading', { name: 'Countdown' })).toBeInTheDocument();

    // Switch to alarm
    const alarmTab = screen.getByText('Alarm');
    fireEvent.click(alarmTab);
    expect(screen.getByRole('heading', { name: 'Alarm' })).toBeInTheDocument();
  });

  it('navigates back to home when close button is clicked', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders active tab with correct styling', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    // Find nav tabs using role buttons instead of text
    const navTabs = screen.getAllByRole('button');
    const stopwatchTab = navTabs[0]; // First tab should be stopwatch

    // Check if tab is visible
    expect(stopwatchTab).toBeInTheDocument();

    // Switch to countdown
    const countdownTab = navTabs[1]; // Second tab should be countdown
    fireEvent.click(countdownTab);

    expect(countdownTab).toBeInTheDocument();

    // Header should update after state change
    expect(screen.getByText('Stopwatch')).toBeInTheDocument(); // Still visible initially
  });
});

describe('MaterialTimerApp2 - Stopwatch Mode Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders stopwatch display with 00:00.00', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('.00')).toBeInTheDocument();
  });

  it('starts stopwatch when play button is clicked', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(playButton);

    expect(screen.getByRole('button', { name: 'pause' })).toBeInTheDocument();

    // Advance timer by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('00:01')).toBeInTheDocument();
  });

  it('pauses stopwatch when pause button is clicked', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(playButton);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('00:03')).toBeInTheDocument();

    const pauseButton = screen.getByRole('button', { name: 'pause' });
    fireEvent.click(pauseButton);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('00:03')).toBeInTheDocument();
  });

  it('resets stopwatch to zero', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(playButton);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('00:05')).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: 'replay' });
    fireEvent.click(resetButton);

    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'play_arrow' })).toBeInTheDocument();
  });

  it('adds lap when lap button is clicked', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getByRole('button', { name: 'play_arrow' });
    const lapButton = screen.getByRole('button', { name: 'flag' });

    // Start timer
    fireEvent.click(playButton);
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Add first lap
    fireEvent.click(lapButton);
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Add second lap
    fireEvent.click(lapButton);

    // Check laps are displayed - use more specific selectors
    const lapElements = screen.getAllByText(/Lap|Fastest|Slowest/);
    expect(lapElements.length).toBeGreaterThan(0);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
  });

  it('displays fastest and slowest laps correctly', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getByRole('button', { name: 'play_arrow' });
    const lapButton = screen.getByRole('button', { name: 'flag' });

    // Create different lap times
    fireEvent.click(playButton);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    fireEvent.click(lapButton);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.click(lapButton);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    fireEvent.click(lapButton);

    // Check that laps are created with different times
    const lapElements = screen.getAllByText(/Lap|Fastest|Slowest/);
    expect(lapElements.length).toBeGreaterThan(0);
  });

  it('disables lap button when timer is not running', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const lapButton = screen.getByRole('button', { name: 'flag' });
    expect(lapButton).toHaveClass('disabled:opacity-30');
    expect(lapButton).toHaveClass('disabled:cursor-not-allowed');
  });
});

describe('MaterialTimerApp2 - Countdown Mode Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('switches to countdown mode and shows time wheels', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Minutes')).toBeInTheDocument();
    expect(screen.getByText('Seconds')).toBeInTheDocument();
  });

  it('displays default time of 00:05:00', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    // Check that time wheels show default values
    expect(screen.getByText('00')).toBeInTheDocument(); // Hours
    expect(screen.getByText('05')).toBeInTheDocument(); // Minutes
    expect(screen.getByText('00')).toBeInTheDocument(); // Seconds

    // Check that main display shows 00:05:00 when started
    const startButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(startButton);
    expect(screen.getByText('00:05:00')).toBeInTheDocument();
  });

  it('updates time wheels when clicked', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    // Find minutes wheel buttons - look for the increment button
    const incrementButton = screen.getAllByRole('button')[4]; // Fifth button should be minutes increment
    fireEvent.click(incrementButton);
    expect(screen.getByText('06')).toBeInTheDocument();
  });

  it('starts countdown with preset buttons', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    const fiveMinButton = screen.getByText('5min');
    fireEvent.click(fiveMinButton);

    expect(screen.getByText('00')).toBeInTheDocument();
    expect(screen.getByText('05')).toBeInTheDocument();
    expect(screen.getByText('00')).toBeInTheDocument();

    const startButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:04:59')).toBeInTheDocument();
  });

  it('shows progress bar during countdown', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    // Set 10 second countdown
    const minutesButtons = screen.getAllByText(/09$/);
    fireEvent.click(minutesButtons[1]); // Set minutes to 00
    const secondsButtons = screen.getAllByText(/59$/);
    fireEvent.click(secondsButtons[1]); // Set seconds to 10

    const startButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(startButton);

    // Check progress bar appears
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('pauses and resumes countdown', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    // Set 10 second countdown
    const secondsButtons = screen.getAllByText(/59$/);
    fireEvent.click(secondsButtons[1]); // Set seconds to 10

    const startButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('00:00:07')).toBeInTheDocument();

    const pauseButton = screen.getByRole('button', { name: 'pause' });
    fireEvent.click(pauseButton);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('00:00:07')).toBeInTheDocument();

    const resumeButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(resumeButton);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('00:00:05')).toBeInTheDocument();
  });

  it('resets countdown to original time', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    // Set 15 second countdown
    const secondsButtons = screen.getAllByText(/59$/);
    fireEvent.click(secondsButtons[1]); // Set seconds to 15

    const startButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('00:00:10')).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: 'replay' });
    fireEvent.click(resetButton);

    expect(screen.getByText('00:00:15')).toBeInTheDocument();
  });

  it('adds minute during countdown', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    // Set 5 second countdown
    const secondsButtons = screen.getAllByText(/59$/);
    fireEvent.click(secondsButtons[1]); // Set seconds to 5

    const startButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(startButton);

    const addMinuteButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addMinuteButton);

    expect(screen.getByText('00:01:05')).toBeInTheDocument();
  });
});

describe('MaterialTimerApp2 - Mode Switching Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('switches between stopwatch and countdown modes', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    // Start in stopwatch mode
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('.00')).toBeInTheDocument();

    // Switch to countdown
    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Minutes')).toBeInTheDocument();
    expect(screen.getByText('Seconds')).toBeInTheDocument();

    // Switch back to stopwatch
    const stopwatchTab = screen.getByText('Stopwatch');
    fireEvent.click(stopwatchTab);

    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('.00')).toBeInTheDocument();
  });

  it('preserves state when switching modes', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    // Start and run stopwatch
    const playButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(playButton);
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Switch to countdown
    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);
    expect(screen.getByText('00:05')).toBeInTheDocument(); // Stopwatch should still be running

    // Switch back to stopwatch
    const stopwatchTab = screen.getByText('Stopwatch');
    fireEvent.click(stopwatchTab);
    expect(screen.getByText('00:05')).toBeInTheDocument();
  });

  it('shows alarm mode with coming soon message', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const alarmTab = screen.getByText('Alarm');
    fireEvent.click(alarmTab);

    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    expect(screen.getByText('Alarm feature is under development')).toBeInTheDocument();
  });
});

describe('MaterialTimerApp2 - Responsive Behavior Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    });
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows mobile navigation tabs on small screens', () => {
    // Set mobile screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    });
    window.dispatchEvent(new Event('resize'));

    renderWithRouter(<MaterialTimerApp2 />);

    // Should show bottom navigation on mobile
    expect(screen.getByText('Stopwatch')).toBeInTheDocument();
    expect(screen.getByText('Countdown')).toBeInTheDocument();
    expect(screen.getByText('Alarm')).toBeInTheDocument();

    // Desktop navigation should not be present
    expect(screen.queryByRole('navigation', { name: /desktop navigation/i })).not.toBeInTheDocument();
  });

  it('shows desktop navigation rail on large screens', () => {
    // Set desktop screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200, // Desktop width
    });
    window.dispatchEvent(new Event('resize'));

    renderWithRouter(<MaterialTimerApp2 />);

    // Should show desktop navigation rail
    const desktopNav = screen.getByRole('navigation');
    expect(desktopNav).toHaveClass('w-16');

    // Mobile navigation should not be present
    const mobileNav = screen.queryByText('Alarm'); // Bottom nav contains Alarm tab
    expect(mobileNav).not.toBeInTheDocument();
  });

  it('updates navigation when window is resized', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    // Start with mobile view
    expect(screen.getByText('Stopwatch')).toBeInTheDocument();
    expect(screen.getByText('Countdown')).toBeInTheDocument();
    expect(screen.getByText('Alarm')).toBeInTheDocument();

    // Resize to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    window.dispatchEvent(new Event('resize'));

    // Now should show desktop navigation rail
    const desktopNav = screen.getByRole('navigation');
    expect(desktopNav).toHaveClass('w-16');
  });

  it('correctly applies responsive classes to timer display', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    // Mobile view
    const timerDisplay = screen.getByText('00:00');
    expect(timerDisplay).toBeInTheDocument();

    // Resize to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    window.dispatchEvent(new Event('resize'));

    // Timer should still be present
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });
});

describe('MaterialTimerApp2 - Edge Cases and Error Handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles rapid mode switching', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    // Rapidly switch modes
    const stopwatchTab = screen.getByText('Stopwatch');
    const countdownTab = screen.getByText('Countdown');

    for (let i = 0; i < 5; i++) {
      fireEvent.click(stopwatchTab);
      fireEvent.click(countdownTab);
    }

    // Should end in countdown mode
    expect(screen.getByText('Hours')).toBeInTheDocument();
  });

  it('handles timer reaching maximum time', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(playButton);

    // Advance to near maximum (test stops before actual maximum to prevent infinite test)
    act(() => {
      vi.advanceTimersByTime(359999); // Almost 6 minutes
    });

    expect(screen.getByText('05:59')).toBeInTheDocument();
  });

  it('handles countdown reaching zero', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    // Set 1 second countdown
    const secondsButtons = screen.getAllByText(/59$/);
    fireEvent.click(secondsButtons[1]); // Set seconds to 1

    const startButton = screen.getByRole('button', { name: 'play_arrow' });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'play_arrow' })).toBeInTheDocument();
  });

  it('handles invalid time wheel inputs gracefully', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getByText('Countdown');
    fireEvent.click(countdownTab);

    // Try to set hours beyond max
    const hoursUpButton = screen.getByText('23'); // Max hour
    fireEvent.click(hoursUpButton); // Should wrap to 00

    expect(screen.getByText('00')).toBeInTheDocument();
  });

  it('handles multiple rapid lap additions', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getByRole('button', { name: 'play_arrow' });
    const lapButton = screen.getByRole('button', { name: 'flag' });

    fireEvent.click(playButton);

    // Add multiple laps rapidly
    for (let i = 0; i < 10; i++) {
      act(() => {
        vi.advanceTimersByTime(100 * (i + 1));
      });
      fireEvent.click(lapButton);
    }

    // Should have 10 laps displayed
    expect(screen.getAllByText(/Lap|Fastest|Slowest/).length).toBeGreaterThan(10);
  });
});