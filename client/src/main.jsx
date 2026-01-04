
import React, { lazy, Suspense } from 'react';
// Use React.lazy for dynamic imports instead of static import statements

import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
const App = lazy(() => import('./App.jsx'));
// import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div>Loading page...</div>}></Suspense>
      <Routes>
        <Route path="/" element={<App />} />
        {/* Other routes would go here */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
