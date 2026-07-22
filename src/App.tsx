import { useEffect, useRef, useState } from 'react'
import { parseAsBoolean, useQueryState } from 'nuqs'

import AboutDialog from './AboutDialog'
import './App.css'
import { GetCardInfo } from './lib/GetCardInfo'
import type { CardType } from './lib/GetCardInfo'
import { GetName } from './lib/GetName'
import { SeededRandom } from './lib/SeededRandom'

const subtitles = [
  "PCI Audit: Fail",
  "Even yours!",
  "Well, only the unexpired ones",
  "Does the security team know?",
  "All your card are belong to us",
  "Unmasked!",
  "Don't spend it all at once",
  "Because that's where the money is",
  "Buy now, pay never",
  "With no fine print!",
];

const pad = (value: number, width: number): string => value.toString().padStart(width, '0');

const getCvv = (random: ReturnType<typeof SeededRandom>, cardType: CardType): string => {
  if (cardType === 'amex') {
    return pad(random.nextInt(0, 9999), 4);
  }

  return pad(random.nextInt(0, 999), 3);
};

const getZip = (random: ReturnType<typeof SeededRandom>): string => pad(random.nextInt(0, 99999), 5);

const getExpires = (random: ReturnType<typeof SeededRandom>): string => {
  const month = pad(random.nextInt(1, 12), 2);
  const year = random.nextInt(26, 36);
  return `${month}/${year}`;
};

function App() {
  const [debug, setDebug] = useQueryState('debug', parseAsBoolean.withDefault(false));
  const [isAboutOpen, setIsAboutOpen] = useQueryState('about', parseAsBoolean.withDefault(false));

  const [subtitleIndex, setSubtitleIndex] = useState(Math.floor(Math.random() * subtitles.length))

  const TOTAL_ROWS = 1_000_000_000_000_000;
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
      <div className="max-lg:collapse bg-base-200 shadow-sm w-full flex flex-col h-screen">
        <div className="navbar flex justify-between border-b border-base-300">
          <div className="">
            <span className="text-3xl font-bold">
              <img className="inline-block h-8 w-auto px-2" src="/logo.svg" alt="Every Credit Card Logo" />
              Every Credit Card</span>
            <span className="ms-3 mt-1 text-xl font-light cursor-pointer" onClick={() => setSubtitleIndex(Math.floor(Math.random() * subtitles.length))}>{subtitles[subtitleIndex]}</span>
          </div>
          {debug && <div className="">
            <span>Debug pos={logicalRow} vis={visibleCount}</span>
          </div>}
          <div className="">
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
        <div className="flex flex-1 min-h-0">
          <div ref={containerRef} className="flex-1 overflow-hidden">
            <table className="table w-full" onWheel={handleWheel}>
              <thead>
                <tr>
                  {debug && <th style={{ width: '18em' }}>Debug</th>}
                  <th className="text-center" style={{ width: '6em' }}></th>
                  <th style={{ width: '18em' }}>Card Number</th>
                  <th style={{ width: '6em' }}>CVV</th>
                  <th style={{ width: '7em' }}>Expires</th>
                  <th style={{ width: '26em' }}>Name</th>
                  <th style={{ width: '7em' }}>Zip</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: visibleCount }, (_, i) => {
                  const row = logicalRow + i;
                  const random = SeededRandom(row);
                  const name = GetName(random);
                  const cardInfo = GetCardInfo(random);
                  const cvv = getCvv(random, cardInfo.cardType);
                  const zip = getZip(random);
                  const expires = getExpires(random);

                  return (
                    <tr key={row} style={{ height: ROW_HEIGHT }}>
                      {debug && <td>{Intl.NumberFormat().format(row + 1)}</td>}
                      <td className="text-center text-nowrap py-0">
                        <img
                          src={cardInfo.imageUrl}
                          title={cardInfo.cardBrand}
                          alt={cardInfo.cardBrand}
                          className="inline-block h-6 w-auto"
                        />
                      </td>
                      <td>{cardInfo.number}</td>
                      <td>{cvv}</td>
                      <td>{expires}</td>
                      <td>{name}</td>
                      <td>{zip}</td>
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
