import React from 'react';
import { Amplify } from 'aws-amplify';
import ReactDOM from 'react-dom/client';
import { initRum } from '@/utils/rum';
// import { registerSW } from 'virtual:pwa-register';
import '@/styles/index.css';
import App from './App.tsx';
import config from '@amplify_outputs';

// registerSW({ immediate: true });

Amplify.configure(config);

// Started before render so that errors thrown during the first paint are
// captured. No-ops when the stage has no RUM app monitor configured.
initRum();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
