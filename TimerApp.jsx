import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Hoist static styles outside component to avoid recreating on every render
// Rule: rendering-hoist-jsx
const STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f0f0',
  },
  timeDisplay: {
    fontSize: '4rem',
    fontWeight: 'bold',
    margin: '20px 0',
    fontFamily: 'monospace',
  },
  timeDisplayFinished: {
    fontSize: '4rem',
    fontWeight: 'bold',
    margin: '20px 0',
    fontFamily: 'monospace',
    color: '#dc3545',
    animation: 'pulse 1s infinite',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: 'white',
  },
  modeButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#6c757d',
    color: 'white',
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    margin: '20px 0',
  },
  timeInput: {
    width: '60px',
    padding: '8px',
    fontSize: '1.2rem',
    textAlign: 'center',
    border: '2px solid #007bff',
    borderRadius: '5px',
  },
};

// Rule: rendering-hoist-jsx - Extract static JSX
const TITLE = <h1>Timer</h1>;
const RESET_TEXT = 'Reset';
const MODE_TEXT = { stopwatch: 'Switch to Countdown', countdown: 'Switch to Stopwatch' };
const INPUT_LABELS = { hours: 'Hours:', minutes: 'Minutes:', seconds: 'Seconds:' };

function TimerApp() {
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' or 'countdown'
  const [seconds, setSeconds] = useState(0);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(0);
  const [inputSeconds, setInputSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        // Rule: rerender-functional-setState - Use functional setState for stable callbacks
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

  // Rule: rerender-move-effect-to-event - Move logic to event handlers instead of effects
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

  // Rule: js-cache-function-results - Memoize formatted time since computation runs every render
  const formattedTime = useMemo(() => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Rule: js-batch-dom-css - Single template literal instead of multiple concatenations
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [seconds]);

  // Derive button text during render, not in a separate variable
  // Rule: rerender-derived-state-no-effect
  const buttonText = isRunning ? 'Pause' : 'Start';

  return (
    <div style={STYLES.container}>
      {TITLE}
      <div style={isFinished ? STYLES.timeDisplayFinished : STYLES.timeDisplay}>{formattedTime}</div>

      {mode === 'countdown' && !isRunning && (
        <div style={STYLES.inputContainer}>
          <div>
            <label>{INPUT_LABELS.hours}</label>
            <input
              type="number"
              min="0"
              max="23"
              value={inputHours}
              onChange={(e) => setInputHours(Math.max(0, parseInt(e.target.value) || 0))}
              style={STYLES.timeInput}
            />
          </div>
          <div>
            <label>{INPUT_LABELS.minutes}</label>
            <input
              type="number"
              min="0"
              max="59"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              style={STYLES.timeInput}
            />
          </div>
          <div>
            <label>{INPUT_LABELS.seconds}</label>
            <input
              type="number"
              min="0"
              max="59"
              value={inputSeconds}
              onChange={(e) => setInputSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              style={STYLES.timeInput}
            />
          </div>
          <button onClick={setCountdown} style={STYLES.button}>
            Set
          </button>
        </div>
      )}

      <div style={STYLES.buttonContainer}>
        <button onClick={toggle} style={STYLES.button} disabled={mode === 'countdown' && seconds === 0 && !isRunning}>
          {buttonText}
        </button>
        <button onClick={reset} style={STYLES.button}>
          {RESET_TEXT}
        </button>
        <button onClick={toggleMode} style={STYLES.modeButton}>
          {MODE_TEXT[mode]}
        </button>
      </div>
      {isFinished && <div style={{ fontSize: '1.5rem', marginTop: '20px', color: '#dc3545' }}>Time's up!</div>}
    </div>
  );
}

export default TimerApp;
