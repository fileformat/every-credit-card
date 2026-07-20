import { useEffect, useRef, useState } from 'react'
import { parseAsBoolean, useQueryState } from 'nuqs'

import AboutDialog from './AboutDialog'
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
  const [isAboutOpen, setIsAboutOpen] = useQueryState('about', parseAsBoolean.withDefault(false));

  const [subtitleIndex, setSubtitleIndex] = useState(Math.floor(Math.random() * subtitles.length))

  const TOTAL_ROWS = 10_000_000_000;
  const ROW_HEIGHT = 48;

  const containerRef = useRef<HTMLDivElement>(null);
  const [logicalRow, setLogicalRow] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visibleCount = Math.floor(containerHeight / ROW_HEIGHT);
  const clamp = (val: number) => Math.max(0, Math.min(TOTAL_ROWS - visibleCount, val));

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setLogicalRow(prev => clamp(prev + (e.deltaY > 0 ? 3 : -3)));
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'x' || e.key === 'X') {
        setDebug(prev => !prev);
      }
      if (e.key === 'Home') {
        e.preventDefault();
        setLogicalRow(0);
      }
      if (e.key === 'End') {
        e.preventDefault();
        setLogicalRow(TOTAL_ROWS - visibleCount);
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const delta = e.key === 'ArrowDown' ? 1 : -1;
        setLogicalRow(prev => Math.max(0, Math.min(TOTAL_ROWS - visibleCount, prev + delta)));
      }
      if (e.key === 'PageDown' || e.key === 'PageUp') {
        e.preventDefault();
        const delta = e.key === 'PageDown' ? visibleCount : -visibleCount;
        setLogicalRow(prev => Math.max(0, Math.min(TOTAL_ROWS - visibleCount, prev + delta)));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [visibleCount]);

  return (
    <>
      <div className="max-lg:collapse bg-base-200 shadow-sm w-full">
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
            <span>Debug pos={logicalRow} vis={visibleCount}</span>
          </div>}
          <div className="navbar-end">
            <button
              type="button"
              className="btn btn-ghost btn-circle me-3"
              aria-label="Open about dialog"
              onClick={() => setIsAboutOpen(true)}
            >
            <svg className="h-5 w-5" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><path d="M196,96c0,29.47-24.21,54.05-56,59.06V156a12,12,0,0,1-24,0V144a12,12,0,0,1,12-12c24.26,0,44-16.15,44-36s-19.74-36-44-36S84,76.15,84,96a12,12,0,0,1-24,0c0-33.08,30.5-60,68-60S196,62.92,196,96Zm-68,92a20,20,0,1,0,20,20A20,20,0,0,0,128,188Z"></path></svg>
            </button>        
          </div>
        </div>
        <div className="flex" style={{ height: 'calc(100vh - 120px)' }}>
          <div ref={containerRef} className="flex-1 overflow-hidden">
            <table className="table w-full" onWheel={handleWheel}>
              <thead>
                <tr>
                  {debug && <th>Debug</th>}
                  <th>Card Number</th>
                  <th>CVV</th>
                  <th>Expires</th>
                  <th>Name</th>
                  <th>Zip</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: visibleCount }, (_, i) => {
                  const row = logicalRow + i;
                  return (
                    <tr key={row} style={{ height: ROW_HEIGHT }}>
                      {debug && <td>{Intl.NumberFormat().format(row + 1)}</td>}
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <input
            type="range"
            min={0}
            max={TOTAL_ROWS - visibleCount}
            value={logicalRow}
            step={1}
            onChange={e => setLogicalRow(clamp(Number(e.target.value)))}
            className="range range-xs"
            style={{ writingMode: 'vertical-lr', width: 16, height: '100%', padding: 0 }}
          />
        </div>
      </div>
      <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  )
}

export default App
