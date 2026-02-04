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
};

// Rule: rendering-hoist-jsx - Extract static JSX
const TITLE = <h1>Timer</h1>;
const RESET_TEXT = 'Reset';

// Rule: js-hoist-regexp - Hoist RegExp outside component
const TIME_PARTS_REGEX = /:/g;

function TimerApp() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        // Rule: rerender-functional-setState - Use functional setState for stable callbacks
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Rule: rerender-move-effect-to-event - Move logic to event handlers instead of effects
  // Rule: advanced-event-handler-refs - Store event handlers in refs to avoid recreating
  const toggleRef = useRef(() => setIsRunning(prev => !prev));
  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
  }, []);

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
      <div style={STYLES.timeDisplay}>{formattedTime}</div>
      <div style={STYLES.buttonContainer}>
        <button onClick={toggleRef.current} style={STYLES.button}>
          {buttonText}
        </button>
        <button onClick={reset} style={STYLES.button}>
          {RESET_TEXT}
        </button>
      </div>
    </div>
  );
}

export default TimerApp;
