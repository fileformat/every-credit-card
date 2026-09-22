import { useEffect, useRef, useState } from 'react'
import { CopyButton } from './CopyButton'
import { GetCardInfo, formatCardNumberInput } from '../lib/GetCardInfo'
import { getCvv, getZip, getExpires } from '../lib/GetCardDetails'
import { GetName } from '../lib/GetName'
import { SeededRandom } from '../lib/SeededRandom'
import { findRememberedCard } from '../lib/CopiedCardMemory'
import { validateCardNumber } from '../lib/ValidateCardNumber'
import { TOTAL_ROWS } from '../lib/Constants'

type NumberSearchDialogProps = {
  isOpen: boolean
  onClose: () => void
  logicalRow: number
  visibleCount: number
}

type SearchResult = {
  name: string
  cardNumber: string
  cvv: string
  expires: string
  zip: string
}

type DonationStatus = 'idle' | 'submitting' | 'processing' | 'thanks'

const emptyResult: SearchResult = { name: '', cardNumber: '', cvv: '', expires: '', zip: '' }

const SEARCH_WINDOW = 100
const EDGE_SEARCH_COUNT = 50

const getRowResultIfMatches = (row: number, digits: string): SearchResult | null => {
  const random = SeededRandom(row)
  const cardInfo = GetCardInfo(random)
  if (cardInfo.number.replace(/\D/g, '') !== digits) {
    return null;
  }
  const name = GetName(random)
  const cvv = getCvv(random, cardInfo.cardBrand)
  const expires = getExpires(random)
  const zip = getZip(random)

  return { name, cardNumber: cardInfo.number, cvv, expires, zip };
}

/** Searches a wide window around the currently displayed rows, plus the first and last rows of the whole range. */
const findResultInDisplayedRows = (digits: string, logicalRow: number, visibleCount: number): SearchResult | null => {
  const windowStart = Math.max(0, logicalRow - SEARCH_WINDOW)
  const windowEnd = Math.min(TOTAL_ROWS, logicalRow + Math.max(visibleCount, SEARCH_WINDOW))

  for (let row = windowStart; row < windowEnd; row++) {
    const found = getRowResultIfMatches(row, digits)
    if (found) return found
  }

  if (windowStart > 0) {
    for (let row = 0; row < Math.min(EDGE_SEARCH_COUNT, TOTAL_ROWS); row++) {
      const found = getRowResultIfMatches(row, digits)
      if (found) return found
    }
  }

  for (let row = Math.max(0, TOTAL_ROWS - EDGE_SEARCH_COUNT); row < TOTAL_ROWS; row++) {
    const found = getRowResultIfMatches(row, digits)
    if (found) return found
  }

  return null
}

export function NumberSearchDialog({ isOpen, onClose, logicalRow, visibleCount }: NumberSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SearchResult | null>(emptyResult)
  const [donationAmount, setDonationAmount] = useState('25')
  const [donationRecurring, setDonationRecurring] = useState(false)
  const [donationStatus, setDonationStatus] = useState<DonationStatus>('idle')
  const donationTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const donationStarted = useRef(false)

  const clearDonationTimers = () => {
    donationTimers.current.forEach(clearTimeout)
    donationTimers.current = []
  }

  const showDonation = !error && query.trim() !== '' && result === null

  // Auto-"press" the donate button once the donation panel appears, without any user interaction.
  useEffect(() => {
    if (!showDonation || donationStarted.current) {
      return
    }

    donationStarted.current = true
    donationTimers.current.push(setTimeout(() => setDonationStatus('processing'), 300))
    donationTimers.current.push(setTimeout(() => setDonationStatus('thanks'), 300 + 2500))
  }, [showDonation])

  useEffect(() => () => clearDonationTimers(), [])

  if (!isOpen) {
    return null
  }

  const resetDonation = () => {
    clearDonationTimers()
    donationStarted.current = false
    setDonationAmount('25')
    setDonationRecurring(false)
    setDonationStatus('idle')
  }

  const handleQueryChange = (value: string) => {
    const digits = value.replace(/\D/g, '')
    setQuery(formatCardNumberInput(digits))
    resetDonation()

    if (!digits) {
      setError(null)
      setResult(emptyResult)
      return
    }

    const validationError = validateCardNumber(digits)
    setError(validationError)

    if (validationError) {
      setResult(emptyResult)
      return
    }

    setResult(
      findResultInDisplayedRows(digits, logicalRow, visibleCount)
      ?? findRememberedCard(digits)
      ?? null
    )
  }

  const handleClose = () => {
    setQuery('')
    setError(null)
    setResult(emptyResult)
    resetDonation()
    onClose()
  }

  return (
    <dialog className="modal modal-open" aria-labelledby="number-search-dialog-title">
      <div className="modal-box max-w-lg">
        <div className="-mx-6 -mt-6 mb-4 rounded-t-box bg-base-300 px-6 py-4">
          <h2 id="number-search-dialog-title" className="text-2xl font-semibold">Search by Card Number</h2>
        </div>
        <div className="mt-4 space-y-4">
          <label className="fieldset-label mb-1">Card Number</label>
          <label className="input w-full">
            <input
              type="text"
              placeholder="Enter a card number"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
            />
          </label>
          <div className="min-h-5 text-sm text-error">{error}</div>

          {result && (
            <div className="space-y-2 rounded-box bg-base-200 p-4">
              <div className="group flex items-center justify-between">
                <span className="text-sm font-semibold opacity-70">Name</span>
                <span className="result-value inline-flex items-center gap-0.5">{result.name}<CopyButton text={result.name} /></span>
              </div>
              <div className="group flex items-center justify-between">
                <span className="text-sm font-semibold opacity-70">CVV</span>
                <span className="result-value inline-flex items-center gap-0.5">{result.cvv}<CopyButton text={result.cvv} /></span>
              </div>
              <div className="group flex items-center justify-between">
                <span className="text-sm font-semibold opacity-70">Expires</span>
                <span className="result-value inline-flex items-center gap-0.5">{result.expires}<CopyButton text={result.expires} /></span>
              </div>
              <div className="group flex items-center justify-between">
                <span className="text-sm font-semibold opacity-70">Zip</span>
                <span className="result-value inline-flex items-center gap-0.5">{result.zip}<CopyButton text={result.zip} /></span>
              </div>
            </div>
          )}

          {showDonation && (
            <div className="space-y-3 rounded-box bg-base-200 p-4">
              {donationStatus === 'thanks' ? (
                <div className="space-y-3 text-center">
                  <p className="font-semibold">Thanks for your donation!</p>
                  <button type="button" className="btn" onClick={handleClose}>Continue</button>
                </div>
              ) : (
                <>
                  <label className="input w-full">
                    <span className="label">$</span>
                    <input
                      type="number"
                      min="1"
                      value={donationAmount}
                      readOnly
                    />
                  </label>
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={donationRecurring}
                      onClick={e => e.preventDefault()}
                      readOnly
                    />
                    <span className="label-text">Make this a monthly donation</span>
                  </label>
                  <div className="btn btn-primary w-full pointer-events-none">
                    {donationStatus === 'processing'
                      ? <><span className="loading loading-spinner loading-sm"></span> Processing...</>
                      : 'Donate'}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="modal-action">
          {!showDonation && <button type="button" className="btn" onClick={handleClose}>Close</button>}
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Close card number search dialog" onClick={handleClose}>
        Close
      </button>
    </dialog>
  )
}
