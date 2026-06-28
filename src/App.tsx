import { useEffect, useState } from 'react'
import { parseAsBoolean, useQueryState } from 'nuqs'

import './App.css'

const subtitles = [
  "PCI Audit: Fail",
  "Even yours!",
  "Well, only the unexpired ones",
  "Does the security team know about this?",
  "All your cards are belong to us",
]

function App() {
  const [debug, setDebug] = useQueryState('debug', parseAsBoolean.withDefault(false));

  const [subtitleIndex, setSubtitleIndex] = useState(Math.floor(Math.random() * subtitles.length))

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'x' || e.key === 'X') {
        setDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <div className="max-lg:collapse bg-base-200 lg:mb-48 shadow-sm w-full">
        <input id="navbar-1-toggle" className="peer hidden" type="checkbox" />
        <label htmlFor="navbar-1-toggle" className="fixed inset-0 hidden max-lg:peer-checked:block"></label>
        <div className="collapse-title navbar">
          <div className="navbar-start">
            <label htmlFor="navbar-1-toggle" className="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
            </label>
            <button className="btn btn-ghost text-3xl">Every Credit Card</button>
            <div className="ms-3 mt-1 text-lg xfont-light cursor-pointer" onClick={() => setSubtitleIndex(Math.floor(Math.random() * subtitles.length))}>{subtitles[subtitleIndex]}</div>
          </div>
          {debug && <div className="navbar-center">
            <span>Debug</span>
          </div>}
          <div className="navbar-end">
            <button className="btn btn-ghost btn-circle me-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg>
            </button>
            <a className="btn btn-ghost btn-circle me-3" href="https://github.com/fileformat">
              <svg className="h-5 w-5" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><path d="M416 160a64 64 0 1 0-96.27 55.24c-2.29 29.08-20.08 37-75 48.42-17.76 3.68-35.93 7.45-52.71 13.93v-126.2a64 64 0 1 0-64 0v209.22a64 64 0 1 0 64.42.24c2.39-18 16-24.33 65.26-34.52 27.43-5.67 55.78-11.54 79.78-26.95 29-18.58 44.53-46.78 46.36-83.89A64 64 0 0 0 416 160zM160 64a32 32 0 1 1-32 32 32 32 0 0 1 32-32zm0 384a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm192-256a32 32 0 1 1 32-32 32 32 0 0 1-32 32z"></path></svg>
            </a>         
          </div>
        </div>
      </div>
    </>
  )
}

export default App
