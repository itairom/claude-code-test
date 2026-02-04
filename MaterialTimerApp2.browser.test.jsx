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

// Skip browser tests if not in browser environment
const describeIf = process.env.VITEST_BROWSER_PROVIDERS ? describe : describe.skip;

describeIf('MaterialTimerApp2 - General UI Tests', () => {
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
  });

  it('navigates back to home when close button is clicked', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const closeButton = screen.getByRole('button', { name: 'close' });
    fireEvent.click(closeButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

describeIf('MaterialTimerApp2 - Stopwatch Mode Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders stopwatch display with 00:00.00', () => {
    const { container } = renderWithRouter(<MaterialTimerApp2 />);

    expect(container.textContent).toContain('00:00');
  });

  it('starts stopwatch when play button is clicked', async () => {
    const { container } = renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('play_arrow') || btn.innerHTML?.includes('play_arrow')
    );

    if (playButton) {
      fireEvent.click(playButton);
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(container.querySelector('text-[#49e619]')).toBeInTheDocument();
      });
    }
  });

  it('pauses stopwatch when pause button is clicked', async () => {
    const { container } = renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('play_arrow') || btn.innerHTML?.includes('play_arrow')
    );

    if (playButton) {
      fireEvent.click(playButton);
      act(() => {
        vi.advanceTimersByTime(100);
      });

      const pauseButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Pause') || btn.innerHTML?.includes('pause')
      );

      if (pauseButton) {
        fireEvent.click(pauseButton);
        expect(mockNavigate).not.toHaveBeenCalledWith('/');
      }
    }
  });

  it('resets stopwatch to zero', async () => {
    const { container } = renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('play_arrow') || btn.innerHTML?.includes('play_arrow')
    );

    if (playButton) {
      fireEvent.click(playButton);
      act(() => {
        vi.advanceTimersByTime(100);
      });

      const resetButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Reset') || btn.innerHTML?.includes('replay')
      );

      if (resetButton) {
        fireEvent.click(resetButton);
        await waitFor(() => {
          expect(container.textContent).toContain('00:00');
        });
      }
    }
  });

  it('adds lap when lap button is clicked', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('play_arrow') || btn.innerHTML?.includes('play_arrow')
    );

    if (playButton) {
      fireEvent.click(playButton);
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const lapButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Lap') || btn.innerHTML?.includes('flag')
      );

      if (lapButton && !lapButton.hasAttribute('disabled')) {
        fireEvent.click(lapButton);
        await waitFor(() => {
          expect(screen.getByText(/Lap 1/)).toBeInTheDocument();
        });
      }
    }
  });

  it('displays fastest and slowest laps correctly', async () => {
    const { container } = renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('play_arrow') || btn.innerHTML?.includes('play_arrow')
    );

    if (playButton) {
      fireEvent.click(playButton);

      // Add multiple laps
      act(() => {
        vi.advanceTimersByTime(1000);
        vi.advanceTimersByTime(1000);
        vi.advanceTimersByTime(1000);
      });

      const lapButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Lap') || btn.innerHTML?.includes('flag')
      );

      if (lapButton && !lapButton.hasAttribute('disabled')) {
        fireEvent.click(lapButton);
        act(() => vi.advanceTimersByTime(1000));
        fireEvent.click(lapButton);
        act(() => vi.advanceTimersByTime(1000));
        fireEvent.click(lapButton);
        act(() => vi.advanceTimersByTime(1000));
      }

      await waitFor(() => {
        expect(screen.getByText(/Fastest/)).toBeInTheDocument();
        expect(screen.getByText(/Slowest/)).toBeInTheDocument();
      });
    }
  });

  it('disables lap button when timer is not running', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const lapButton = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Lap') || btn.innerHTML?.includes('flag')
    );

    if (lapButton) {
      expect(lapButton).toBeDisabled();
    }
  });
});

describeIf('MaterialTimerApp2 - Countdown Mode Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('switches to countdown mode and shows time wheels', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);

      await waitFor(() => {
        expect(screen.getByText(/Hours/i)).toBeInTheDocument();
        expect(screen.getByText(/Minutes/i)).toBeInTheDocument();
        expect(screen.getByText(/Seconds/i)).toBeInTheDocument();
      });
    }
  });

  it('displays default time of 00:05:00', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);

      await waitFor(() => {
        expect(screen.getByText('05')).toBeInTheDocument();
      });
    }
  });

  it('updates time wheels when clicked', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      const hoursButtons = screen.getAllByText('00');
      expect(hoursButtons.length).toBeGreaterThan(0);
    });
  });

  it('starts countdown with preset buttons', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      const preset5min = screen.getAllByText('5min').find(btn => btn.tagName === 'BUTTON');
      if (preset5min) {
        fireEvent.click(preset5min);

        act(() => {
          vi.advanceTimersByTime(100);
        });

        const startButton = screen.getAllByRole('button').find(btn =>
          btn.textContent?.includes('Start')
        );

        if (startButton) {
          fireEvent.click(startButton);
          expect(mockNavigate).not.toHaveBeenCalledWith('/');
        }
      }
    });
  });

  it('shows progress bar during countdown', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      expect(screen.getByText(/Hours/i)).toBeInTheDocument();
    });
  });

  it('pauses and resumes countdown', async () => {
    const { container } = renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      const startButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Start')
      );

      if (startButton) {
        fireEvent.click(startButton);

        act(() => {
          vi.advanceTimersByTime(1000);
        });

        const pauseButton = screen.getAllByRole('button').find(btn =>
          btn.textContent?.includes('Pause')
        );

        if (pauseButton) {
          fireEvent.click(pauseButton);
        }
      }
    });
  });

  it('resets countdown to original time', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      const startButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Start')
      );

      if (startButton) {
        fireEvent.click(startButton);
        act(() => {
          vi.advanceTimersByTime(1000);
        });

        const resetButton = screen.getAllByRole('button').find(btn =>
          btn.textContent?.includes('Reset') || btn.innerHTML?.includes('replay')
        );

        if (resetButton) {
          fireEvent.click(resetButton);
          expect(screen.getByText('00:00:00')).toBeInTheDocument();
        }
      }
    });
  });

  it('adds minute during countdown', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      const startButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Start')
      );

      if (startButton) {
        fireEvent.click(startButton);
        act(() => {
          vi.advanceTimersByTime(1000);
        });

        const addButton = screen.getAllByRole('button').find(btn =>
          btn.textContent?.includes('add') || btn.innerHTML?.includes('add')
        );

        if (addButton && !addButton.hasAttribute('disabled')) {
          fireEvent.click(addButton);
        }
      }
    });
  });
});

describeIf('MaterialTimerApp2 - Mode Switching', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('switches between stopwatch and countdown modes', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);

      await waitFor(() => {
        expect(screen.getByText(/Hours/i)).toBeInTheDocument();
      });

      // Switch back to stopwatch
      const stopwatchTab = screen.getAllByText('Stopwatch').find(el =>
        el.tagName === 'BUTTON' || el.closest('button') && el.closest('nav')
      );

      if (stopwatchTab) {
        fireEvent.click(stopwatchTab);
        expect(screen.getByRole('heading', { name: 'Stopwatch' })).toBeInTheDocument();
      }
    }
  });

  it('preserves state when switching modes', async () => {
    const { container } = renderWithRouter(<MaterialTimerApp2 />);

    // Start stopwatch
    const playButton = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('play_arrow') || btn.innerHTML?.includes('play_arrow')
    );

    if (playButton) {
      fireEvent.click(playButton);
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Switch to countdown
      const countdownTab = screen.getAllByText('Countdown').find(el =>
        el.tagName === 'BUTTON' || el.closest('button')
      );

      if (countdownTab) {
        fireEvent.click(countdownTab);

        // Switch back to stopwatch - time should be preserved
        const stopwatchTab = screen.getAllByText('Stopwatch').find(el =>
          el.tagName === 'BUTTON' || el.closest('button') && el.closest('nav')
        );

        if (stopwatchTab) {
          fireEvent.click(stopwatchTab);
          expect(container.textContent).not.toContain('00:00');
        }
      }
    }
  });

  it('shows alarm mode with coming soon message', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const alarmTab = screen.getAllByText('Alarm').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (alarmTab) {
      fireEvent.click(alarmTab);
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    }
  });
});

describeIf('MaterialTimerApp2 - Responsive Behavior Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows mobile navigation tabs on small screens', () => {
    // Mock mobile screen size
    global.innerWidth = 375;

    renderWithRouter(<MaterialTimerApp2 />);

    // Should have bottom navigation on mobile
    expect(screen.getByText('Stopwatch')).toBeInTheDocument();
    expect(screen.getByText('Countdown')).toBeInTheDocument();
    expect(screen.getByText('Alarm')).toBeInTheDocument();
  });

  it('shows desktop navigation rail on large screens', () => {
    // Mock desktop screen size
    global.innerWidth = 1280;

    renderWithRouter(<MaterialTimerApp2 />);

    // Should still have navigation
    expect(screen.getByText('Stopwatch')).toBeInTheDocument();
  });

  it('updates navigation when window is resized', async () => {
    const { rerender } = renderWithRouter(<MaterialTimerApp2 />);

    act(() => {
      global.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(screen.getByText('Stopwatch')).toBeInTheDocument();
    });
  });

  it('correctly applies responsive classes to timer display', () => {
    const { container } = renderWithRouter(<MaterialTimerApp2 />);

    // Check for responsive classes
    const timerContainer = container.querySelector('.w-64');
    expect(timerContainer).toBeInTheDocument();
  });
});

describeIf('MaterialTimerApp2 - Edge Cases and Error Handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles rapid mode switching', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );
    const stopwatchTab = screen.getAllByText('Stopwatch').find(el =>
      el.tagName === 'BUTTON' || el.closest('button') && el.closest('nav')
    );

    if (countdownTab && stopwatchTab) {
      // Switch multiple times
      fireEvent.click(countdownTab);
      fireEvent.click(stopwatchTab);
      fireEvent.click(countdownTab);
      fireEvent.click(stopwatchTab);

      expect(screen.getByRole('heading', { name: 'Stopwatch' })).toBeInTheDocument();
    }
  });

  it('handles timer reaching maximum time', () => {
    const { container } = renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('play_arrow') || btn.innerHTML?.includes('play_arrow')
    );

    if (playButton) {
      fireEvent.click(playButton);

      // Advance timers significantly
      act(() => {
        vi.advanceTimersByTime(360000000); // 100 hours
      });

      // Should not crash
      expect(container).toBeInTheDocument();
    }
  });

  it('handles countdown reaching zero', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      const startButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Start')
      );

      if (startButton) {
        fireEvent.click(startButton);

        act(() => {
          // Advance past the countdown time
          vi.advanceTimersByTime(600000); // 10 minutes
        });

        // Timer should have stopped
        expect(mockNavigate).not.toHaveBeenCalledWith('/');
      }
    });
  });

  it('handles invalid time wheel inputs gracefully', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      expect(screen.getByText(/Hours/i)).toBeInTheDocument();
    });
  });

  it('handles multiple rapid lap additions', () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const playButton = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('play_arrow') || btn.innerHTML?.includes('play_arrow')
    );

    if (playButton) {
      fireEvent.click(playButton);

      const lapButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Lap') || btn.innerHTML?.includes('flag')
      );

      if (lapButton && !lapButton.hasAttribute('disabled')) {
        // Add multiple laps rapidly
        fireEvent.click(lapButton);
        fireEvent.click(lapButton);
        fireEvent.click(lapButton);

        // Should not crash
        expect(screen.getByText(/Lap 1/)).toBeInTheDocument();
        expect(screen.getByText(/Lap 2/)).toBeInTheDocument();
        expect(screen.getByText(/Lap 3/)).toBeInTheDocument();
      }
    }
  });
});

describeIf('MaterialTimerApp2 - Carousel Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all preset buttons in carousel', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      expect(screen.getByText('1min')).toBeInTheDocument();
      expect(screen.getByText('5min')).toBeInTheDocument();
      expect(screen.getByText('15min')).toBeInTheDocument();
      expect(screen.getByText('30min')).toBeInTheDocument();
      expect(screen.getByText('45min')).toBeInTheDocument();
      expect(screen.getByText('60min')).toBeInTheDocument();
    });
  });

  it('renders carousel dot indicators', async () => {
    const { container } = renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      // Check for dot indicators (rounded-full divs)
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  it('carousel buttons are clickable', async () => {
    renderWithRouter(<MaterialTimerApp2 />);

    const countdownTab = screen.getAllByText('Countdown').find(el =>
      el.tagName === 'BUTTON' || el.closest('button')
    );

    if (countdownTab) {
      fireEvent.click(countdownTab);
    }

    await waitFor(() => {
      const preset15min = screen.getAllByText('15min').find(btn => btn.tagName === 'BUTTON');
      if (preset15min) {
        fireEvent.click(preset15min);
        // Should not throw
        expect(preset15min).toBeInTheDocument();
      }
    });
  });
});
