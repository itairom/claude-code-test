import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

function TimerApp() {
  const [mode, setMode] = useState('stopwatch');
  const [seconds, setSeconds] = useState(0);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(0);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [inputFocused, setInputFocused] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (mode === 'countdown') {
            const newSeconds = prev - 1;
            if (newSeconds <= 0) {
              setIsRunning(false);
              setIsFinished(true);
              return 0;
            }
            return newSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const toggle = useCallback(() => setIsRunning(prev => !prev), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(mode === 'countdown' ? initialSeconds : 0);
    setIsFinished(false);
  }, [mode, initialSeconds]);

  const toggleMode = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    if (mode === 'stopwatch') {
      setMode('countdown');
      setSeconds(0);
    } else {
      setMode('stopwatch');
      setSeconds(0);
    }
  }, [mode]);

  const setCountdown = useCallback(() => {
    const totalSeconds = (inputHours * 3600) + (inputMinutes * 60) + inputSeconds;
    if (totalSeconds > 0) {
      setInitialSeconds(totalSeconds);
      setSeconds(totalSeconds);
      setIsFinished(false);
    }
  }, [inputHours, inputMinutes, inputSeconds]);

  const formattedTime = useMemo(() => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [seconds]);

  const progress = mode === 'countdown' && initialSeconds > 0
    ? (initialSeconds - seconds) / initialSeconds
    : seconds / 3600;

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700;800&family=Orbitron:wght@400;700;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'JetBrains Mono', monospace;
          background: #0a0a0f;
          min-height: 100vh;
          overflow: hidden;
        }

        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 107, 53, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0, 245, 212, 0.05), transparent),
            #0a0a0f;
          position: relative;
        }

        .app-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 107, 53, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 107, 53, 0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent);
          transition: background-image 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .app-container.countdown {
          background:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 245, 212, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0, 187, 249, 0.05), transparent),
            #0a0a0f;
        }

        .app-container.countdown::before {
          background-image:
            linear-gradient(rgba(0, 245, 212, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 212, 0.02) 1px, transparent 1px);
        }

        .mode-indicator {
          position: absolute;
          top: 40px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .mode-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 107, 53, 0.2);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mode-dot.active {
          background: #ff6b35;
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.6);
        }

        .mode-dot:nth-child(2).active {
          background: #00f5d4;
          box-shadow: 0 0 20px rgba(0, 245, 212, 0.6);
        }

        .timer-ring {
          position: relative;
          width: 340px;
          height: 340px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .timer-ring svg {
          position: absolute;
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .timer-ring-bg {
          fill: none;
          stroke: rgba(255, 107, 53, 0.1);
          stroke-width: 3;
        }

        .timer-ring-progress {
          fill: none;
          stroke: url(#gradient);
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s linear;
          filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.5));
        }

        .timer-ring-progress.countdown {
          stroke: url(#gradientCountdown);
          filter: drop-shadow(0 0 8px rgba(0, 245, 212, 0.5));
        }

        .time-display {
          font-family: 'Orbitron', monospace;
          font-size: 3.5rem;
          font-weight: 900;
          color: #ffffff;
          text-align: center;
          letter-spacing: 0.05em;
          text-shadow: 0 0 40px rgba(255, 107, 53, 0.3);
          z-index: 5;
          transition: all 0.3s ease;
        }

        .time-display.finished {
          color: #00f5d4;
          text-shadow: 0 0 40px rgba(0, 245, 212, 0.5);
          animation: pulse-finish 1s ease-in-out infinite;
        }

        @keyframes pulse-finish {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }

        .time-display-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-top: 8px;
        }

        .controls {
          display: flex;
          gap: 16px;
          margin-top: 48px;
          z-index: 10;
        }

        .control-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 16px 28px;
          border: 1px solid rgba(255, 107, 53, 0.3);
          background: transparent;
          color: #ff6b35;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .control-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 107, 53, 0.1);
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .control-btn:hover {
          border-color: #ff6b35;
          box-shadow: 0 0 30px rgba(255, 107, 53, 0.2);
        }

        .control-btn:hover::before {
          transform: translateY(0);
        }

        .control-btn:active {
          transform: scale(0.97);
        }

        .control-btn.primary {
          background: #ff6b35;
          border-color: #ff6b35;
          color: #0a0a0f;
        }

        .control-btn.primary:hover {
          background: #ff8055;
          box-shadow: 0 0 40px rgba(255, 107, 53, 0.4);
        }

        .control-btn.secondary {
          border-color: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.5);
        }

        .control-btn.secondary:hover {
          border-color: rgba(255, 255, 255, 0.4);
          color: rgba(255, 255, 255, 0.8);
        }

        .control-btn.secondary::before {
          background: rgba(255, 255, 255, 0.05);
        }

        .control-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          pointer-events: none;
        }

        .mode-toggle {
          position: absolute;
          bottom: 40px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 12px 20px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mode-toggle:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        .mode-toggle-icon {
          width: 20px;
          height: 20px;
          border: 1px solid currentColor;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.5rem;
        }

        .input-panel {
          position: absolute;
          bottom: 100px;
          display: flex;
          gap: 24px;
          align-items: center;
          padding: 24px 32px;
          background: rgba(10, 10, 15, 0.9);
          border: 1px solid rgba(255, 107, 53, 0.2);
          backdrop-filter: blur(20px);
          z-index: 10;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }

        .input-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
        }

        .time-input {
          width: 70px;
          height: 60px;
          font-family: 'Orbitron', monospace;
          font-size: 1.8rem;
          font-weight: 700;
          color: #ffffff;
          text-align: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: 4px;
          transition: all 0.3s ease;
          -moz-appearance: textfield;
        }

        .time-input::-webkit-outer-spin-button,
        .time-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .time-input:focus {
          outline: none;
          border-color: #ff6b35;
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.2);
          background: rgba(255, 107, 53, 0.05);
        }

        .time-input.focused {
          border-color: #ff6b35;
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.2);
        }

        .input-separator {
          font-family: 'Orbitron', monospace;
          font-size: 1.8rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.2);
          margin-top: 20px;
        }

        .set-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 18px 32px;
          background: #ff6b35;
          border: none;
          border-radius: 4px;
          color: #0a0a0f;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          margin-left: 16px;
        }

        .set-btn:hover {
          background: #ff8055;
          box-shadow: 0 0 30px rgba(255, 107, 53, 0.4);
          transform: translateY(-2px);
        }

        .set-btn:active {
          transform: translateY(0);
        }

        .finished-message {
          position: absolute;
          bottom: 140px;
          font-family: 'Orbitron', monospace;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #00f5d4;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brand {
          position: absolute;
          top: 40px;
          right: 40px;
          font-family: 'Orbitron', monospace;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.15);
          text-transform: uppercase;
        }

        .status-bar {
          position: absolute;
          bottom: 40px;
          left: 40px;
          display: flex;
          gap: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 0.05em;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-dot.running {
          background: #ff6b35;
          animation: blink 1s ease-in-out infinite;
        }

        .status-bar.countdown .status-dot.running {
          background: #00f5d4;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div className={`app-container ${mode === 'countdown' ? 'countdown' : ''}`}>
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b35" />
              <stop offset="100%" stopColor="#f7931e" />
            </linearGradient>
            <linearGradient id="gradientCountdown" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5d4" />
              <stop offset="100%" stopColor="#00bbf9" />
            </linearGradient>
          </defs>
        </svg>

        <div className="mode-indicator">
          <div className={`mode-dot ${mode === 'stopwatch' ? 'active' : ''}`} />
          <div className={`mode-dot ${mode === 'countdown' ? 'active' : ''}`} />
        </div>

        <div className="brand">Chronos</div>

        <Link
          to="/v2"
          className="absolute top-40 right-40 font-family: 'Orbitron', monospace; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.3em; color: rgba(255, 255, 255, 0.2); text-transform: uppercase; hover:color: rgba(255, 255, 255, 0.4); transition: all 0.3s ease; text-decoration: none;"
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.55rem',
            fontWeight: '700',
            letterSpacing: '0.3em',
            color: 'rgba(255, 255, 255, 0.2)',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}
        >
          v2 Material
        </Link>

        <div className="timer-ring">
          <svg viewBox="0 0 300 300">
            <circle
              className="timer-ring-bg"
              cx="150"
              cy="150"
              r="140"
            />
            <circle
              className={`timer-ring-progress ${mode === 'countdown' ? 'countdown' : ''}`}
              cx="150"
              cy="150"
              r="140"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div>
            <div className={`time-display ${isFinished ? 'finished' : ''}`}>
              {formattedTime}
            </div>
            <div className="time-display-label">
              {mode === 'stopwatch' ? 'Elapsed Time' : 'Remaining'}
            </div>
          </div>
        </div>

        {mode === 'countdown' && !isRunning && (
          <div className="input-panel">
            <div className="input-group">
              <label className="input-label">Hours</label>
              <input
                type="number"
                min="0"
                max="23"
                value={inputHours}
                onChange={(e) => setInputHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                className={`time-input ${inputFocused === 'hours' ? 'focused' : ''}`}
                onFocus={() => setInputFocused('hours')}
                onBlur={() => setInputFocused(null)}
              />
            </div>
            <span className="input-separator">:</span>
            <div className="input-group">
              <label className="input-label">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className={`time-input ${inputFocused === 'minutes' ? 'focused' : ''}`}
                onFocus={() => setInputFocused('minutes')}
                onBlur={() => setInputFocused(null)}
              />
            </div>
            <span className="input-separator">:</span>
            <div className="input-group">
              <label className="input-label">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={inputSeconds}
                onChange={(e) => setInputSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className={`time-input ${inputFocused === 'seconds' ? 'focused' : ''}`}
                onFocus={() => setInputFocused('seconds')}
                onBlur={() => setInputFocused(null)}
              />
            </div>
            <button onClick={setCountdown} className="set-btn">
              Set Duration
            </button>
          </div>
        )}

        {isFinished && (
          <div className="finished-message">Time's Up!</div>
        )}

        <div className="controls">
          <button
            onClick={toggle}
            className={`control-btn primary`}
            disabled={mode === 'countdown' && seconds === 0 && !isRunning}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button onClick={reset} className="control-btn secondary">
            Reset
          </button>
        </div>

        <button onClick={toggleMode} className="mode-toggle">
          <span className="mode-toggle-icon">
            {mode === 'stopwatch' ? '↓' : '↑'}
          </span>
          {mode === 'stopwatch' ? 'Switch to Countdown' : 'Switch to Stopwatch'}
        </button>

        <div className={`status-bar ${mode === 'countdown' ? 'countdown' : ''}`}>
          <div className="status-item">
            <span className={`status-dot ${isRunning ? 'running' : ''}`} />
            {isRunning ? 'Active' : 'Standby'}
          </div>
          <div>•</div>
          <div>{mode === 'stopwatch' ? 'STW' : 'CDN'}</div>
        </div>
      </div>
    </>
  );
}

export default TimerApp;
