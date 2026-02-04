import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';

// Constants
const MOBILE_BREAKPOINT = 640;
const DESKTOP_BREAKPOINT = 1024;
const CIRCUMFERENCE_MOBILE = 2 * Math.PI * 128;
const CIRCUMFERENCE_DESKTOP = 2 * Math.PI * 160;

// Format time for stopwatch: MM:SS.ms
const formatStopwatchTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);

  return {
    main: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    millis: String(millis).padStart(2, '0')
  };
};

// Format time for countdown: HH:MM:SS
const formatCountdownTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Memoized Lap Row component
const LapRow = memo(({ lap, fastest, slowest, lapsLength }) => {
  const isFastest = lap.time === fastest && lapsLength > 1;
  const isSlowest = lap.time === slowest && lapsLength > 1;

  const time = formatStopwatchTime(lap.time);

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center gap-4">
        <span className={`font-bold ${isFastest ? 'text-[#49e619]' : isSlowest ? 'text-gray-500' : 'text-white/70'}`}>
          {String(lap.index).padStart(2, '0')}
        </span>
        <span className="text-sm opacity-60">
          {isFastest ? 'Fastest' : isSlowest ? 'Slowest' : `Lap ${lap.index}`}
        </span>
      </div>
      <span className="font-mono text-white">
        {time.main}<span className="text-sm text-[#49e619]">.{time.millis}</span>
      </span>
    </div>
  );
});

LapRow.displayName = 'LapRow';

// Time Wheel component for countdown
const TimeWheel = memo(({ value, onChange, min, max, label }) => {
  const prevValue = value === min ? max : value - 1;
  const nextValue = value === max ? min : value + 1;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => onChange(prevValue)}
        className="text-white/40 text-lg font-medium h-12 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors w-16"
      >
        {String(prevValue).padStart(2, '0')}
      </button>
      <p className="text-[#49e619] text-3xl font-bold h-16 flex items-center justify-center bg-white/5 rounded-xl w-16 border border-[#49e619]/30">
        {String(value).padStart(2, '0')}
      </p>
      <button
        onClick={() => onChange(nextValue)}
        className="text-white/40 text-lg font-medium h-12 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors w-16"
      >
        {String(nextValue).padStart(2, '0')}
      </button>
      <span className="text-xs font-bold text-white/50 uppercase tracking-widest mt-2">{label}</span>
    </div>
  );
});

TimeWheel.displayName = 'TimeWheel';

// Preset button component
const PresetButton = memo(({ label, minutes, onClick, active }) => (
  <button
    onClick={() => onClick(0, minutes, 0)}
    className={`px-6 py-3 rounded-2xl whitespace-nowrap transition-all flex-shrink-0 ${
      active
        ? 'bg-[#49e619] text-[#0a0f0a] font-bold'
        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-[#49e619]/30'
    }`}
  >
    <span className="text-sm font-bold">{label}</span>
  </button>
));

PresetButton.displayName = 'PresetButton';

// Navigation tab component
const NavTab = memo(({ mode, targetMode, icon, label, onClick, isDesktop }) => {
  const isActive = mode === targetMode;

  if (isDesktop) {
    return (
      <button
        onClick={() => onClick(targetMode)}
        className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl transition-all ${
          isActive
            ? 'bg-[#49e619]/20 text-[#49e619]'
            : 'text-white/50 hover:text-white hover:bg-white/5'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(targetMode)}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
        isActive
          ? 'text-[#49e619]'
          : 'text-white/50 hover:text-white'
      }`}
    >
      <span className="material-symbols-outlined text-2xl">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
});

NavTab.displayName = 'NavTab';

// Preset carousel data
const PRESETS = [
  { label: '1min', minutes: 1 },
  { label: '5min', minutes: 5 },
  { label: '15min', minutes: 15 },
  { label: '30min', minutes: 30 },
  { label: '45min', minutes: 45 },
  { label: '60min', minutes: 60 },
];

// Custom hook for swipe/drag gesture on carousel
const useCarouselSwipe = (carouselRef, isDesktop) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Skip on desktop/touch devices where native scroll is better
    if (isDesktop) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    let startX = 0;
    let scrollLeft = 0;
    let isDown = false;

    const handleMouseDown = (e) => {
      isDown = true;
      setIsDragging(true);
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      carousel.style.cursor = 'grabbing';
      carousel.style.scrollBehavior = 'auto';
    };

    const handleMouseLeave = () => {
      isDown = false;
      setIsDragging(false);
      carousel.style.cursor = 'grab';
      carousel.style.scrollBehavior = 'smooth';
    };

    const handleMouseUp = () => {
      isDown = false;
      setIsDragging(false);
      carousel.style.cursor = 'grab';
      carousel.style.scrollBehavior = 'smooth';
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    };

    carousel.addEventListener('mousedown', handleMouseDown);
    carousel.addEventListener('mouseleave', handleMouseLeave);
    carousel.addEventListener('mouseup', handleMouseUp);
    carousel.addEventListener('mousemove', handleMouseMove);

    carousel.style.cursor = 'grab';

    return () => {
      carousel.removeEventListener('mousedown', handleMouseDown);
      carousel.removeEventListener('mouseleave', handleMouseLeave);
      carousel.removeEventListener('mouseup', handleMouseUp);
      carousel.removeEventListener('mousemove', handleMouseMove);
    };
  }, [carouselRef, isDesktop]);

  return isDragging;
};

// Main App Component
function MaterialTimerApp2() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('stopwatch');
  const [milliseconds, setMilliseconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [countdownHours, setCountdownHours] = useState(0);
  const [countdownMinutes, setCountdownMinutes] = useState(5);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [carouselPage, setCarouselPage] = useState(0);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const carouselRef = useRef(null);

  // Detect screen size for responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth > DESKTOP_BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Track carousel scroll position
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const itemWidth = carousel.firstElementChild?.offsetWidth || 0;
      const page = Math.round(scrollLeft / itemWidth);
      setCarouselPage(page);
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  // Enable drag/swipe on carousel
  const isDraggingCarousel = useCarouselSwipe(carouselRef, isDesktop);

  // Timer interval
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setMilliseconds(prev => {
          if (mode === 'stopwatch') {
            return prev + 10;
          }
          if (prev <= 10) {
            setIsRunning(false);
            return 0;
          }
          return prev - 10;
        });
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, mode]);

  // Memoized calculations
  const { progress, strokeDashoffset, fastest, slowest, circumference } = useMemo(() => {
    const circ = isDesktop ? CIRCUMFERENCE_DESKTOP : CIRCUMFERENCE_MOBILE;
    const progressValue = initialTime > 0
      ? ((initialTime - milliseconds) / initialTime) * 100
      : 0;
    const offset = initialTime > 0
      ? circ - ((initialTime - milliseconds) / initialTime) * circ
      : circ;

    const lapTimes = laps.map(l => l.time);
    const fastestLap = lapTimes.length > 0 ? Math.min(...lapTimes) : 0;
    const slowestLap = lapTimes.length > 0 ? Math.max(...lapTimes) : 0;

    return {
      progress: progressValue,
      strokeDashoffset: offset,
      fastest: fastestLap,
      slowest: slowestLap,
      circumference: circ
    };
  }, [initialTime, milliseconds, laps, isDesktop]);

  // Event handlers
  const toggle = useCallback(() => {
    if (milliseconds === 0 && mode === 'countdown') return;
    setIsRunning(prev => !prev);
    setIsPaused(false);
  }, [milliseconds, mode]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setMilliseconds(0);
    setLaps([]);
    setInitialTime(0);
  }, []);

  const addLap = useCallback(() => {
    if (milliseconds > 0 && isRunning) {
      setLaps(prev => [...prev, { time: milliseconds, index: prev.length + 1 }]);
    }
  }, [milliseconds, isRunning]);

  const startCountdown = useCallback(() => {
    const total = (countdownHours * 3600000) + (countdownMinutes * 60000) + (countdownSeconds * 1000);
    if (total > 0) {
      setInitialTime(total);
      setMilliseconds(total);
    }
  }, [countdownHours, countdownMinutes, countdownSeconds]);

  const setPreset = useCallback((h, m, s) => {
    setCountdownHours(h);
    setCountdownMinutes(m);
    setCountdownSeconds(s);
  }, []);

  const addMinute = useCallback(() => {
    setMilliseconds(prev => Math.min(prev + 60000, 359999000));
  }, []);

  // Render helpers
  const renderStopwatch = () => {
    const time = formatStopwatchTime(milliseconds);
    const timerSize = isDesktop ? 'w-80 h-80' : 'w-64 h-64';
    const textSize = isDesktop ? 'text-7xl' : 'text-5xl';
    const ringSize = isDesktop ? 160 : 128;

    return (
      <div className="flex flex-col items-center">
        {/* Main Timer Display */}
        <div className="relative flex items-center justify-center mb-8">
          <svg className={`absolute inset-0 ${timerSize} -rotate-90`} viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              fill="transparent"
              r={ringSize}
              stroke="currentColor"
              strokeWidth="4"
              className="text-white/10"
            />
            <circle
              cx="128"
              cy="128"
              fill="transparent"
              r={ringSize}
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={isRunning ? circumference * (1 - (milliseconds % 1000) / 1000) : circumference}
              strokeLinecap="round"
              className="text-[#49e619] transition-all duration-100"
            />
          </svg>
          <div className={`flex ${timerSize} items-center justify-center`}>
            <div className="text-center">
              <div className={`${textSize} font-bold tracking-tighter text-white`}>
                {time.main}
              </div>
              <div className="text-2xl text-[#49e619] font-mono">.{time.millis}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={reset}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:border-[#49e619]/30 transition-all"
          >
            <span className="material-symbols-outlined text-2xl">replay</span>
          </button>
          <button
            onClick={toggle}
            className="w-20 h-20 rounded-2xl bg-[#49e619] flex items-center justify-center text-[#0a0f0a] hover:bg-[#49e619]/80 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#49e619]/30"
          >
            <span className="material-symbols-outlined text-4xl">
              {isRunning ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button
            onClick={addLap}
            disabled={!isRunning}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:border-[#49e619]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-2xl">flag</span>
          </button>
        </div>

        {/* Laps List */}
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-4 px-4">
            <h3 className="text-lg font-bold text-white">Laps</h3>
            <span className="text-xs font-medium text-white/50 uppercase tracking-widest">Split Time</span>
          </div>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto px-2">
            {laps.length === 0 && milliseconds === 0 && (
              <div className="text-center py-8 text-white/30">
                <span className="material-symbols-outlined text-4xl mb-2">timer</span>
                <p className="text-sm">Start timer to record laps</p>
              </div>
            )}
            {[...laps].reverse().map((lap) => (
              <LapRow
                key={lap.index}
                lap={lap}
                fastest={fastest}
                slowest={slowest}
                lapsLength={laps.length}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCountdown = () => {
    const timerSize = isDesktop ? 'w-80 h-80' : 'w-64 h-64';
    const ringSize = isDesktop ? 160 : 128;
    const isActive = isRunning || initialTime > 0;

    return (
      <div className="flex flex-col items-center">
        {/* Circular Progress Ring */}
        <div className="relative flex items-center justify-center mb-8">
          <svg className={`absolute inset-0 ${timerSize} -rotate-90`} viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              fill="transparent"
              r={ringSize}
              stroke="currentColor"
              strokeWidth="4"
              className="text-white/10"
            />
            <circle
              cx="128"
              cy="128"
              fill="transparent"
              r={ringSize}
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-[#49e619] transition-all duration-300"
            />
          </svg>
          <div className={`flex ${timerSize} items-center justify-center`}>
            <div className="text-center">
              <div className={`${isDesktop ? 'text-6xl' : 'text-4xl'} font-bold tracking-tighter text-white`}>
                {formatCountdownTime(milliseconds)}
              </div>
              {initialTime > 0 && (
                <div className="text-sm text-white/50 mt-2">
                  of {formatCountdownTime(initialTime)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time Picker Wheel */}
        {!isActive && (
          <>
            <div className="flex items-center justify-center gap-6 mb-8 p-6 bg-white/5 rounded-3xl border border-white/10">
              <TimeWheel
                value={countdownHours}
                onChange={setCountdownHours}
                min={0}
                max={23}
                label="Hours"
              />
              <div className="text-2xl text-white/30">:</div>
              <TimeWheel
                value={countdownMinutes}
                onChange={setCountdownMinutes}
                min={0}
                max={59}
                label="Minutes"
              />
              <div className="text-2xl text-white/30">:</div>
              <TimeWheel
                value={countdownSeconds}
                onChange={setCountdownSeconds}
                min={0}
                max={59}
                label="Seconds"
              />
            </div>

            {/* Quick Presets Carousel */}
            <div className="relative w-full max-w-md mb-8">
              <div
                ref={carouselRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 py-2 -mx-4 scroll-smooth"
              >
                {PRESETS.map((preset) => (
                  <div key={preset.label} className="snap-center">
                    <PresetButton
                      label={preset.label}
                      minutes={preset.minutes}
                      onClick={setPreset}
                      active={false}
                    />
                  </div>
                ))}
                {/* Spacer for end padding */}
                <div className="w-2 flex-shrink-0 snap-center" />
              </div>
              {/* Fade edges indicator */}
              <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#0a0f0a] to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#0a0f0a] to-transparent pointer-events-none" />
              {/* Scroll indicator dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {PRESETS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const carousel = carouselRef.current;
                      if (carousel) {
                        const targetButton = carousel.children[index];
                        if (targetButton) {
                          targetButton.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'center'
                          });
                        }
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === carouselPage
                        ? 'bg-[#49e619] scale-125'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                    aria-label={`Go to preset ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={reset}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:border-[#49e619]/30 transition-all"
          >
            <span className="material-symbols-outlined text-2xl">replay</span>
          </button>

          {!isActive ? (
            <button
              onClick={startCountdown}
              className="min-w-[140px] h-16 rounded-2xl bg-[#49e619] flex items-center justify-center gap-2 text-[#0a0f0a] font-bold hover:bg-[#49e619]/80 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#49e619]/30"
            >
              <span className="material-symbols-outlined text-2xl">play_arrow</span>
              Start
            </button>
          ) : (
            <button
              onClick={isRunning ? pause : toggle}
              className="min-w-[140px] h-16 rounded-2xl bg-[#49e619] flex items-center justify-center gap-2 text-[#0a0f0a] font-bold hover:bg-[#49e619]/80 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#49e619]/30"
            >
              <span className="material-symbols-outlined text-2xl">
                {isRunning ? 'pause' : 'play_arrow'}
              </span>
              {isRunning ? 'Pause' : 'Resume'}
            </button>
          )}

          {isRunning && (
            <button
              onClick={addMinute}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:border-[#49e619]/30 transition-all"
            >
              <span className="material-symbols-outlined text-2xl">add</span>
            </button>
          )}
        </div>

        {/* Linear Progress Bar */}
        {isActive && (
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-2 px-4">
              <span className="text-sm text-white/50">Progress</span>
              <span className="text-sm font-bold text-[#49e619]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#49e619] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAlarm = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <span className="material-symbols-outlined text-8xl text-white/20 mb-4">alarm</span>
      <h2 className="text-2xl font-bold text-white/50">Coming Soon</h2>
      <p className="text-white/30 mt-2">Alarm feature is under development</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f0a] flex font-sans">
      {/* Desktop Side Navigation Rail */}
      {isDesktop && (
        <nav className="w-16 h-screen bg-[#0f150f] border-r border-white/5 flex flex-col items-center py-6 gap-2">
          <div className="mb-8">
            <span className="material-symbols-outlined text-3xl text-[#49e619]">timer</span>
          </div>
          <NavTab
            mode={mode}
            targetMode="stopwatch"
            icon="timer"
            label="Stopwatch"
            onClick={setMode}
            isDesktop={true}
          />
          <NavTab
            mode={mode}
            targetMode="countdown"
            icon="hourglass_empty"
            label="Countdown"
            onClick={setMode}
            isDesktop={true}
          />
          <NavTab
            mode={mode}
            targetMode="alarm"
            icon="alarm"
            label="Alarm"
            onClick={setMode}
            isDesktop={true}
          />
        </nav>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${isDesktop ? 'h-screen' : 'min-h-screen'} flex flex-col`}>
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {mode === 'stopwatch' ? 'Stopwatch' : mode === 'countdown' ? 'Countdown' : 'Alarm'}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {mode === 'stopwatch' && renderStopwatch()}
          {mode === 'countdown' && renderCountdown()}
          {mode === 'alarm' && renderAlarm()}
        </div>

        {/* Mobile Bottom Navigation */}
        {!isDesktop && (
          <nav className="flex items-center justify-around bg-[#0f150f] border-t border-white/5 px-4 py-3">
            <NavTab
              mode={mode}
              targetMode="stopwatch"
              icon="timer"
              label="Stopwatch"
              onClick={setMode}
              isDesktop={false}
            />
            <NavTab
              mode={mode}
              targetMode="countdown"
              icon="hourglass_empty"
              label="Countdown"
              onClick={setMode}
              isDesktop={false}
            />
            <NavTab
              mode={mode}
              targetMode="alarm"
              icon="alarm"
              label="Alarm"
              onClick={setMode}
              isDesktop={false}
            />
          </nav>
        )}
      </main>
    </div>
  );
}

export default MaterialTimerApp2;
