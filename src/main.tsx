import React from 'react'
import ReactDOM from 'react-dom/client'
import { Helmet } from 'react-helmet'
import './style.css'

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import "../node_modules/bootstrap-icons/font/bootstrap-icons.css"

// lazy load the app component to reduce initial load time
const App = React.lazy(() => import('./App'))

// get the base name from the build environment (gitlab pages)
const baseName = import.meta.env.BASE_URL;

// check if the browser is blink renderer (chrome) or not
export const isBlink = navigator.userAgent.includes("Chrome")
// depending on the browser and os the behaviour of fullscreen is different
const browserSpecificFullScreenClass = isBlink ? 'h-screen' : 'fullbody';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <Helmet>
      <title>CG1 Practical Course</title>
    </Helmet>
    <div className={'overflow-hidden ' + browserSpecificFullScreenClass}>
      {/** gitlab pages specific routing */}
      <Router basename={baseName == "/" ? "/" : ("/" + baseName.split("/").slice(3).join("/"))}> 
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/*" element={<h1>404</h1>} />
        </Routes>
      </Router>
    </div>
  </>,
)
