import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setMilliseconds(prev => prev + 10);
        } else {
          setMilliseconds(prev => {
            if (prev <= 0) {
              setIsRunning(false);
              return 0;
            }
            return prev - 10;
          });
        }
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, mode]);

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

  const formatCountdownTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatInitialTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? ((initialTime - milliseconds) / initialTime) * 100 : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - ((initialTime - milliseconds) / initialTime) * circumference;

  return (
    <>
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .filled-icon {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <body className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col overflow-hidden" />

      {/* Top App Bar */}
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <button
          onClick={() => navigate('/')}
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
                <h1 className="text-6xl font-bold tracking-tight" dangerouslySetInnerHTML={{ __html: formatTime(milliseconds) }} />
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
                      <span className="text-lg font-mono" dangerouslySetInnerHTML={{ __html: formatTime(milliseconds) }} />
                    </div>
                  )}
                  {[...laps].reverse().map((lap, idx) => {
                    const lapTimes = laps.map(l => l.time);
                    const fastest = Math.min(...lapTimes);
                    const slowest = Math.max(...lapTimes);
                    let label = 'Lap ' + lap.index;
                    let labelClass = 'text-white/50';

                    if (lap.time === fastest && laps.length > 1) {
                      label = 'Fastest';
                      labelClass = 'text-primary';
                    } else if (lap.time === slowest && laps.length > 1) {
                      label = 'Slowest';
                      labelClass = 'text-white/50';
                    }

                    return (
                      <div key={lap.index} className="flex items-center justify-between px-4 py-4 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className={`${labelClass} font-bold`}>{String(lap.index).padStart(2, '0')}</span>
                          <span className="text-sm opacity-70">{label}</span>
                        </div>
                        <span className="text-lg font-mono" dangerouslySetInnerHTML={{ __html: formatTime(lap.time) }} />
                      </div>
                    );
                  })}
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
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-primary transition-all duration-300"
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r="120"
                    stroke="currentColor"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-extrabold tracking-tighter">
                    {formatCountdownTime(milliseconds)}
                  </span>
                  {initialTime > 0 && (
                    <span className="text-sm font-medium text-gray-500 mt-2">
                      of {formatInitialTime(initialTime)}
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
                    <div className="flex-1">
                      <button
                        onClick={() => setCountdownHours(h => Math.max(0, h - 1))}
                        className="w-full text-gray-400 text-lg font-medium h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {String(countdownHours === 0 ? 23 : countdownHours - 1).padStart(2, '0')}
                      </button>
                      <p className="text-primary text-3xl font-bold h-14 flex items-center justify-center bg-primary/10 rounded-xl">
                        {String(countdownHours).padStart(2, '0')}
                      </p>
                      <button
                        onClick={() => setCountdownHours(h => (h + 1) % 24)}
                        className="w-full text-gray-400 text-lg font-medium h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {String((countdownHours + 1) % 24).padStart(2, '0')}
                      </button>
                    </div>
                    <div className="flex-1">
                      <button
                        onClick={() => setCountdownMinutes(m => m === 0 ? 59 : m - 1)}
                        className="w-full text-gray-400 text-lg font-medium h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {String(countdownMinutes === 0 ? 59 : countdownMinutes - 1).padStart(2, '0')}
                      </button>
                      <p className="text-primary text-3xl font-bold h-14 flex items-center justify-center bg-primary/10 rounded-xl">
                        {String(countdownMinutes).padStart(2, '0')}
                      </p>
                      <button
                        onClick={() => setCountdownMinutes(m => (m + 1) % 60)}
                        className="w-full text-gray-400 text-lg font-medium h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {String((countdownMinutes + 1) % 60).padStart(2, '0')}
                      </button>
                    </div>
                    <div className="flex-1">
                      <button
                        onClick={() => setCountdownSeconds(s => s === 0 ? 59 : s - 1)}
                        className="w-full text-gray-400 text-lg font-medium h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {String(countdownSeconds === 0 ? 59 : countdownSeconds - 1).padStart(2, '0')}
                      </button>
                      <p className="text-primary text-3xl font-bold h-14 flex items-center justify-center bg-primary/10 rounded-xl">
                        {String(countdownSeconds).padStart(2, '0')}
                      </p>
                      <button
                        onClick={() => setCountdownSeconds(s => (s + 1) % 60)}
                        className="w-full text-gray-400 text-lg font-medium h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {String((countdownSeconds + 1) % 60).padStart(2, '0')}
                      </button>
                    </div>
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
                  onClick={isRunning && !isPaused ? pause : (initialTime > 0 || !isRunning && countdownHours === 0 && countdownMinutes === 15 && countdownSeconds === 0) ? toggle : startCountdown}
                  className="min-w-[140px] h-16 rounded-full bg-primary text-background-dark flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined">
                    {isRunning ? (isPaused ? 'play_arrow' : 'pause') : 'play_arrow'}
                  </span>
                  {isRunning ? (isPaused ? 'Resume' : 'Pause') : 'Start'}
                </button>
                {!isRunning && initialTime === 0 && (
                  <button
                    onClick={startCountdown}
                    className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"
                  >
                    <span className="material-symbols-outlined text-2xl">check</span>
                  </button>
                )}
                {isRunning && !isPaused && (
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
                <div className="w-full overflow-x-auto py-2">
                  <div className="flex gap-3 px-2 justify-center">
                    <button
                      onClick={() => { setCountdownHours(0); setCountdownMinutes(1); setCountdownSeconds(0); }}
                      className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-primary/10 transition-colors whitespace-nowrap"
                    >
                      <span className="text-sm font-bold">1 min</span>
                    </button>
                    <button
                      onClick={() => { setCountdownHours(0); setCountdownMinutes(5); setCountdownSeconds(0); }}
                      className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-primary/10 transition-colors whitespace-nowrap"
                    >
                      <span className="text-sm font-bold">5 min</span>
                    </button>
                    <button
                      onClick={() => { setCountdownHours(0); setCountdownMinutes(15); setCountdownSeconds(0); }}
                      className="px-5 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary whitespace-nowrap"
                    >
                      <span className="text-sm font-bold">15 min</span>
                    </button>
                    <button
                      onClick={() => { setCountdownHours(0); setCountdownMinutes(30); setCountdownSeconds(0); }}
                      className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-primary/10 transition-colors whitespace-nowrap"
                    >
                      <span className="text-sm font-bold">30 min</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Linear */}
              {initialTime > 0 && (
                <div className="w-full px-6 pb-6">
                  <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl">
                    <div className="flex gap-6 justify-between">
                      <p className="text-gray-500 text-sm font-medium leading-normal">Session Progress</p>
                      <p className="text-primary text-sm font-bold leading-normal">{Math.round(progress)}%</p>
                    </div>
                    <div className="rounded-full bg-gray-200 dark:bg-gray-800 h-1.5 overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex h-20 items-center justify-around bg-background-light dark:bg-[#1a2b15] border-t border-white/5">
        <div
          onClick={() => setMode('stopwatch')}
          className={`flex flex-col items-center gap-1 group cursor-pointer ${mode === 'stopwatch' ? 'text-primary' : 'text-white/60 hover:text-white transition-colors'}`}
        >
          <div className={`${mode === 'stopwatch' ? 'bg-primary/20' : ''} px-5 py-1 rounded-full`}>
            <span className={`material-symbols-outlined ${mode === 'stopwatch' ? 'filled-icon' : ''}`}>timer</span>
          </div>
          <span className="text-xs font-bold">Stopwatch</span>
        </div>
        <div
          onClick={() => setMode('countdown')}
          className={`flex flex-col items-center gap-1 group cursor-pointer ${mode === 'countdown' ? 'text-primary' : 'text-white/60 hover:text-white transition-colors'}`}
        >
          <div className={`${mode === 'countdown' ? 'bg-primary/20' : ''} px-5 py-1 rounded-full`}>
            <span className={`material-symbols-outlined ${mode === 'countdown' ? 'filled-icon' : ''}`}>hourglass_empty</span>
          </div>
          <span className="text-xs font-bold">Countdown</span>
        </div>
        <div className="flex flex-col items-center gap-1 group cursor-pointer text-white/60 hover:text-white transition-colors">
          <div className="px-5 py-1 rounded-full group-hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">alarm</span>
          </div>
          <span className="text-xs font-bold">Alarm</span>
        </div>
      </nav>
    </>
  );
}

export default MaterialTimerApp;
