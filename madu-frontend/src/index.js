import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'; // Importe o BrowserRouter

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Envolva o App com BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Se quiser medir performance na sua aplicação
reportWebVitals();
