import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';

// Hoist static styles outside component (rendering-hoist-jsx)
const STATIC_STYLES = `
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .filled-icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
`;

// Hoist constants outside component (js-hoist-regexp, rendering-hoist-jsx)
const CIRCUMFERENCE = 2 * Math.PI * 120;
const CIRCLE_RADIUS = 120;

// Format functions - pure, can be called during render (js-cache-function-results)
const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}<span class="text-primary text-4xl">.${String(millis).padStart(2, '0')}</span>`;
};

const formatTimeWithoutMillis = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Memoized Lap Row component to prevent unnecessary re-renders (rerender-memo)
const LapRow = memo(({ lap, fastest, slowest, lapsLength }) => {
  // Derive label during render (rerender-derived-state-no-effect)
  const isFastest = lap.time === fastest && lapsLength > 1;
  const isSlowest = lap.time === slowest && lapsLength > 1;
  const label = isFastest ? 'Fastest' : (isSlowest ? 'Slowest' : `Lap ${lap.index}`);
  const labelClass = isFastest ? 'text-primary' : 'text-white/50';

  return (
    <div className="flex items-center justify-between px-4 py-4 rounded-lg">
      <div className="flex items-center gap-4">
        <span className={`${labelClass} font-bold`}>{String(lap.index).padStart(2, '0')}</span>
        <span className="text-sm opacity-70">{label}</span>
      </div>
      <span
        className="text-lg font-mono"
        dangerouslySetInnerHTML={{ __html: formatTime(lap.time) }}
      />
    </div>
  );
});

LapRow.displayName = 'LapRow';

function MaterialTimerApp() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('stopwatch');
  const [milliseconds, setMilliseconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [countdownHours, setCountdownHours] = useState(0);
  const [countdownMinutes, setCountdownMinutes] = useState(15);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Use ref for navigation callback stability (advanced-use-latest)
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  // Optimize interval effect - use functional setState (rerender-functional-setState)
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setMilliseconds(prev => {
          if (mode === 'stopwatch') {
            return prev + 10;
          }
          // For countdown, check threshold before update
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

  // Memoize expensive computations (js-cache-function-results)
  const { progress, strokeDashoffset, fastest, slowest } = useMemo(() => {
    const progress = initialTime > 0
      ? ((initialTime - milliseconds) / initialTime) * 100
      : 0;

    const strokeDashoffset = initialTime > 0
      ? CIRCUMFERENCE - ((initialTime - milliseconds) / initialTime) * CIRCUMFERENCE
      : CIRCUMFERENCE;

    // Pre-compute lap stats once
    const lapTimes = laps.map(l => l.time);
    const fastest = lapTimes.length > 0 ? Math.min(...lapTimes) : 0;
    const slowest = lapTimes.length > 0 ? Math.max(...lapTimes) : 0;

    return { progress, strokeDashoffset, fastest, slowest };
  }, [initialTime, milliseconds, laps]);

  // Move logic to event handlers instead of effects (rerender-move-effect-to-event)
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
  }, []);

  const addLap = useCallback(() => {
    if (milliseconds > 0) {
      setLaps(prev => [...prev, { time: milliseconds, index: prev.length + 1 }]);
    }
  }, [milliseconds]);

  const startCountdown = useCallback(() => {
    const total = (countdownHours * 3600000) + (countdownMinutes * 60000) + (countdownSeconds * 1000);
    if (total > 0) {
      setInitialTime(total);
      setMilliseconds(total);
    }
  }, [countdownHours, countdownMinutes, countdownSeconds]);

  const addMinute = useCallback(() => {
    setMilliseconds(prev => Math.min(prev + 60000, 359999000));
  }, []);

  // Stable callback for navigation (advanced-event-handler-refs)
  const handleBack = useCallback(() => {
    navigateRef.current('/');
  }, []);

  // Preset handlers - use functional setState (rerender-functional-setState)
  const setPreset = useCallback((h, m, s) => {
    setCountdownHours(h);
    setCountdownMinutes(m);
    setCountdownSeconds(s);
  }, []);

  // Derive button text during render, not in separate variable (rerender-derived-state-no-effect)
  const startPauseButtonText = isRunning
    ? (isPaused ? 'Resume' : 'Pause')
    : 'Start';

  const showCheckButton = !isRunning && initialTime === 0;
  const showAddButton = isRunning && !isPaused;

  return (
    <>
      <style>{STATIC_STYLES}</style>

      <body className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col overflow-hidden" />

      {/* Top App Bar */}
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight">
          {mode === 'stopwatch' ? 'Stopwatch' : 'Countdown'}
        </h2>
        <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col overflow-y-auto">
        {mode === 'stopwatch' ? (
          <>
            {/* Main Timer Display */}
            <section className="flex flex-col items-center justify-center py-12 px-6">
              <div className="relative flex items-center justify-center w-72 h-72 rounded-full border-4 border-primary/20 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent -rotate-45"></div>
                <h1
                  className="text-6xl font-bold tracking-tight"
                  dangerouslySetInnerHTML={{ __html: formatTime(milliseconds) }}
                />
              </div>
            </section>

            {/* Controls */}
            <section className="flex justify-center px-6 pb-8">
              <div className="flex flex-1 gap-4 max-w-md items-center justify-between">
                <button
                  onClick={reset}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-all"
                >
                  <span className="material-symbols-outlined">replay</span>
                </button>
                <button
                  onClick={toggle}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-background-dark shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <span className={`material-symbols-outlined text-4xl ${isRunning ? '' : 'filled-icon'}`}>
                    {isRunning ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button
                  onClick={addLap}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-all"
                >
                  <span className="material-symbols-outlined">flag</span>
                </button>
              </div>
            </section>

            {/* Laps Section */}
            <section className="flex-1 flex flex-col bg-white/5 rounded-t-xl mx-4">
              <div className="px-6 pt-6 pb-2 flex justify-between items-center">
                <h3 className="text-lg font-bold">Laps</h3>
                <span className="text-xs font-medium text-white/50 uppercase tracking-widest">Split Time</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="flex flex-col gap-1">
                  {milliseconds > 0 && !isRunning && laps.length === 0 && (
                    <div className="flex items-center justify-between px-4 py-4 rounded-lg bg-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-primary font-bold">--</span>
                        <span className="text-sm opacity-70">Current</span>
                      </div>
                      <span
                        className="text-lg font-mono"
                        dangerouslySetInnerHTML={{ __html: formatTime(milliseconds) }}
                      />
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
            </section>
          </>
        ) : (
          <>
            {/* Countdown Mode */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
              {/* Active Timer Display */}
              <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
                  <circle
                    className="text-gray-200 dark:text-gray-800"
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r={CIRCLE_RADIUS}
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-primary transition-all duration-300"
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r={CIRCLE_RADIUS}
                    stroke="currentColor"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-extrabold tracking-tighter">
                    {formatTimeWithoutMillis(milliseconds)}
                  </span>
                  {initialTime > 0 && (
                    <span className="text-sm font-medium text-gray-500 mt-2">
                      of {formatTimeWithoutMillis(initialTime)}
                    </span>
                  )}
                </div>
              </div>

              {/* Time Input Wheel */}
              {!isRunning && initialTime === 0 && (
                <div className="w-full max-w-sm bg-gray-50 dark:bg-[#1c2e17] rounded-3xl p-6 mb-8">
                  <div className="flex justify-between mb-2 px-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hours</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Minutes</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seconds</span>
                  </div>
                  <div className="flex items-center justify-center gap-8">
                    {/* Hours Wheel */}
                    <TimeWheel
                      value={countdownHours}
                      onChange={setCountdownHours}
                      min={0}
                      max={23}
                    />
                    {/* Minutes Wheel */}
                    <TimeWheel
                      value={countdownMinutes}
                      onChange={setCountdownMinutes}
                      min={0}
                      max={59}
                    />
                    {/* Seconds Wheel */}
                    <TimeWheel
                      value={countdownSeconds}
                      onChange={setCountdownSeconds}
                      min={0}
                      max={59}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mb-12">
                <button
                  onClick={reset}
                  className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"
                >
                  <span className="material-symbols-outlined text-2xl">refresh</span>
                </button>
                <button
                  onClick={isRunning && !isPaused ? pause : (initialTime > 0 || (!isRunning && countdownHours === 0 && countdownMinutes === 15 && countdownSeconds === 0)) ? toggle : startCountdown}
                  className="min-w-[140px] h-16 rounded-full bg-primary text-background-dark flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined">
                    {isRunning ? (isPaused ? 'play_arrow' : 'pause') : 'play_arrow'}
                  </span>
                  {startPauseButtonText}
                </button>
                {showCheckButton && (
                  <button
                    onClick={startCountdown}
                    className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"
                  >
                    <span className="material-symbols-outlined text-2xl">check</span>
                  </button>
                )}
                {showAddButton && (
                  <button
                    onClick={addMinute}
                    className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"
                  >
                    <span className="material-symbols-outlined text-2xl">add</span>
                  </button>
                )}
              </div>

              {/* Presets */}
              {!isRunning && initialTime === 0 && (
                <PresetButtons onPreset={setPreset} currentMinutes={countdownMinutes} />
              )}

              {/* Progress Linear */}
              {initialTime > 0 && <ProgressBar progress={progress} />}
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav mode={mode} onModeChange={setMode} />
    </>
  );
}

// Extract TimeWheel component (rerender-memo)
const TimeWheel = memo(({ value, onChange, min, max }) => {
  const prevValue = value === min ? max - 1 : value - 1;
  const nextValue = value === max ? min : value + 1;

  return (
    <div className="flex-1">
      <button
        onClick={() => onChange(prevValue)}
        className="w-full text-gray-400 text-lg font-medium h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        {String(prevValue).padStart(2, '0')}
      </button>
      <p className="text-primary text-3xl font-bold h-14 flex items-center justify-center bg-primary/10 rounded-xl">
        {String(value).padStart(2, '0')}
      </p>
      <button
        onClick={() => onChange(nextValue)}
        className="w-full text-gray-400 text-lg font-medium h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        {String(nextValue).padStart(2, '0')}
      </button>
    </div>
  );
});

TimeWheel.displayName = 'TimeWheel';

// Extract PresetButtons component (rerender-memo)
const PresetButtons = memo(({ onPreset, currentMinutes }) => (
  <div className="w-full overflow-x-auto py-2">
    <div className="flex gap-3 px-2 justify-center">
      <PresetButton label="1 min" minutes={1} onClick={onPreset} active={false} />
      <PresetButton label="5 min" minutes={5} onClick={onPreset} active={false} />
      <PresetButton label="15 min" minutes={15} onClick={onPreset} active={currentMinutes === 15} />
      <PresetButton label="30 min" minutes={30} onClick={onPreset} active={false} />
    </div>
  </div>
));

PresetButtons.displayName = 'PresetButtons';

const PresetButton = memo(({ label, minutes, onClick, active }) => (
  <button
    onClick={() => onClick(0, minutes, 0)}
    className={`px-5 py-3 rounded-2xl whitespace-nowrap ${
      active
        ? 'bg-primary/10 border border-primary/20 text-primary'
        : 'border border-gray-200 dark:border-gray-800 hover:bg-primary/10'
    }`}
  >
    <span className="text-sm font-bold">{label}</span>
  </button>
));

PresetButton.displayName = 'PresetButton';

// Extract ProgressBar component (rerender-memo)
const ProgressBar = memo(({ progress }) => (
  <div className="w-full px-6 pb-6">
    <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl">
      <div className="flex gap-6 justify-between">
        <p className="text-gray-500 text-sm font-medium leading-normal">Session Progress</p>
        <p className="text-primary text-sm font-bold leading-normal">{Math.round(progress)}%</p>
      </div>
      <div className="rounded-full bg-gray-200 dark:bg-gray-800 h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
));

ProgressBar.displayName = 'ProgressBar';

// Extract BottomNav component (rerender-memo)
const BottomNav = memo(({ mode, onModeChange }) => (
  <nav className="flex h-20 items-center justify-around bg-background-light dark:bg-[#1a2b15] border-t border-white/5">
    <NavTab mode={mode} targetMode="stopwatch" icon="timer" label="Stopwatch" onClick={onModeChange} />
    <NavTab mode={mode} targetMode="countdown" icon="hourglass_empty" label="Countdown" onClick={onModeChange} />
    <div className="flex flex-col items-center gap-1 group cursor-pointer text-white/60 hover:text-white transition-colors">
      <div className="px-5 py-1 rounded-full group-hover:bg-white/5 transition-colors">
        <span className="material-symbols-outlined">alarm</span>
      </div>
      <span className="text-xs font-bold">Alarm</span>
    </div>
  </nav>
));

BottomNav.displayName = 'BottomNav';

const NavTab = memo(({ mode, targetMode, icon, label, onClick }) => {
  const isActive = mode === targetMode;
  return (
    <div
      onClick={() => onClick(targetMode)}
      className={`flex flex-col items-center gap-1 group cursor-pointer ${
        isActive ? 'text-primary' : 'text-white/60 hover:text-white transition-colors'
      }`}
    >
      <div className={`${isActive ? 'bg-primary/20' : ''} px-5 py-1 rounded-full`}>
        <span className={`material-symbols-outlined ${isActive ? 'filled-icon' : ''}`}>{icon}</span>
      </div>
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
});

NavTab.displayName = 'NavTab';

export default MaterialTimerApp;
