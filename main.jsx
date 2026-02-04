import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TimerApp from './TimerApp';
import MaterialTimerApp from './MaterialTimerApp';

// Get the basename from environment or use the repo name
const basename = import.meta.env.BASE_URL || '/claude-code-test/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<TimerApp />} />
        <Route path="/v2" element={<MaterialTimerApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
