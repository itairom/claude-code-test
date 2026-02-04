import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import TimerApp from './TimerApp';
import MaterialTimerApp2 from './MaterialTimerApp2';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<TimerApp />} />
        <Route path="/v2" element={<MaterialTimerApp2 />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
