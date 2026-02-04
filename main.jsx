import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import TimerApp from './TimerApp';
import MaterialTimerApp from './MaterialTimerApp';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<TimerApp />} />
        <Route path="/v2" element={<MaterialTimerApp />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
