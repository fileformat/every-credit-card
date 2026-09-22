import { useEffect, useRef, useState } from 'react'
import { parseAsBoolean, useQueryState } from 'nuqs'

import './App.css'
import { AboutDialog } from './components/AboutDialog'
import { CopyButton } from './components/CopyButton'
import { NameSearchDialog } from './components/NameSearchDialog'
import { NumberSearchDialog } from './components/NumberSearchDialog'
import { GetCardInfo } from './lib/GetCardInfo'
import { getCvv, getZip, getExpires } from './lib/GetCardDetails'
import { GetName } from './lib/GetName'
import { rememberCard } from './lib/CopiedCardMemory'
import { SeededRandom } from './lib/SeededRandom'
import { TOTAL_ROWS } from './lib/Constants'

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
  "Literally!",
];

function App() {
  const [debug, setDebug] = useQueryState('debug', parseAsBoolean.withDefault(false));
  const [isAboutOpen, setIsAboutOpen] = useQueryState('about', parseAsBoolean.withDefault(false));
  const [isNameSearchOpen, setIsNameSearchOpen] = useQueryState('search', parseAsBoolean.withDefault(false));
  const [isNumberSearchOpen, setIsNumberSearchOpen] = useQueryState('numsearch', parseAsBoolean.withDefault(false));

  const [subtitleIndex, setSubtitleIndex] = useState(Math.floor(Math.random() * subtitles.length))

  const ROW_HEIGHT = 16;

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
  }, [visibleCount, setDebug]);

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
            <img src="/images/icons/info.svg" alt="" className="h-8 w-8" />
            </button>        
          </div>
        </div>
        <div className="flex flex-1 min-h-0">
          <div ref={containerRef} className="flex-1 overflow-hidden">
            <table className="table table-xsm w-full less-padding" onWheel={handleWheel}>
              <thead>
                <tr>
                  {debug && <th style={{ width: '18em' }}>Debug</th>}
                  <th className="text-center" style={{ width: '6em' }}></th>
                  <th style={{ width: '18em' }}>
                    <span className="inline-flex items-center gap-1">
                      Card Number
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs px-0.5"
                        aria-label="Search by card number"
                        onClick={() => setIsNumberSearchOpen(true)}
                      >
                        <img src="/images/icons/search.svg" alt="" className="h-4 w-4" />
                      </button>
                    </span>
                  </th>
                  <th style={{ width: '6em' }}>CVV</th>
                  <th style={{ width: '7em' }}>Expires</th>
                  <th style={{ width: '26em' }}>
                    <span className="inline-flex items-center gap-1">
                      Name
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs px-0.5"
                        aria-label="Search by name"
                        onClick={() => setIsNameSearchOpen(true)}
                      >
                        <img src="/images/icons/search.svg" alt="" className="h-4 w-4" />
                      </button>
                    </span>
                  </th>
                  <th style={{ width: '7em' }}>Zip</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: visibleCount }, (_, i) => {
                  const row = logicalRow + i;
                  const random = SeededRandom(row);
                  const cardInfo = GetCardInfo(random);
                  const name = GetName(random);
                  const cvv = getCvv(random, cardInfo.cardBrand);
                  const zip = getZip(random);
                  const expires = getExpires(random);

                  return (
                    <tr key={row} className="group" style={{ height: ROW_HEIGHT }}>
                      {debug && <td>{Intl.NumberFormat().format(row + 1)}</td>}
                      <td className="text-center text-nowrap py-0">
                        <img
                          src={cardInfo.imageUrl}
                          title={cardInfo.cardBrand}
                          alt={cardInfo.cardBrand}
                          className="inline-block h-5 w-auto"
                        />
                      </td>
                      <td><span className="inline-flex items-center gap-0.5">{cardInfo.number}<CopyButton text={cardInfo.number} onCopy={() => rememberCard(cardInfo.number.replace(/\D/g, ''), { name, cardNumber: cardInfo.number, cvv, expires, zip })} /></span></td>
                      <td><span className="inline-flex items-center gap-0.5">{cvv}<CopyButton text={cvv} /></span></td>
                      <td><span className="inline-flex items-center gap-0.5">{expires}<CopyButton text={expires} /></span></td>
                      <td><span className="inline-flex items-center gap-0.5">{name}<CopyButton text={name} /></span></td>
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
      <NameSearchDialog isOpen={isNameSearchOpen} onClose={() => setIsNameSearchOpen(false)} />
      <NumberSearchDialog
        isOpen={isNumberSearchOpen}
        onClose={() => setIsNumberSearchOpen(false)}
        logicalRow={logicalRow}
        visibleCount={visibleCount}
      />
    </>
  )
}

export default App
