import { useState } from 'react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { CopyButton } from './CopyButton'
import { GetCardInfo } from '../lib/GetCardInfo'
import { getCvv, getZip, getExpires } from '../lib/GetCardDetails'
import { GetNameStartingWith } from '../lib/GetName'
import { SeededRandom } from '../lib/SeededRandom'

type NameSearchDialogProps = {
  isOpen: boolean
  onClose: () => void
}

type SearchResult = {
  name: string
  cardNumber: string
  cvv: string
  expires: string
  zip: string
}

const emptyResult: SearchResult = { name: '', cardNumber: '', cvv: '', expires: '', zip: '' }
const notFoundResult: SearchResult = { name: 'Not found', cardNumber: '', cvv: '', expires: '', zip: '' }

const generateResult = (query: string, position: number): SearchResult => {
  const random = SeededRandom(`${query}:${position}`)
  const name = GetNameStartingWith(random, query)
  if (!name) {
    return notFoundResult
  }

  const cardInfo = GetCardInfo(random)
  const cvv = getCvv(random, cardInfo.cardBrand)
  const expires = getExpires(random)
  const zip = getZip(random)

  return { name, cardNumber: cardInfo.number, cvv, expires, zip }
}

export function NameSearchDialog({ isOpen, onClose }: NameSearchDialogProps) {
  const [query, setQuery] = useQueryState('name', parseAsString.withDefault(''))
  const [position, setPosition] = useQueryState('pos', parseAsInteger.withDefault(0))
  const [result, setResult] = useState<SearchResult>(query.trim() ? generateResult(query, position) : emptyResult)

  if (!isOpen) {
    return null
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setPosition(0)
    setResult(value.trim() ? generateResult(value, 0) : emptyResult)
  }

  const handlePrevious = () => {
    if (!query.trim() || position === 0) {
      return
    }
    const newPosition = position - 1
    setPosition(newPosition)
    setResult(generateResult(query, newPosition))
  }

  const handleNext = () => {
    if (!query.trim()) {
      return
    }
    const newPosition = position + 1
    setPosition(newPosition)
    setResult(generateResult(query, newPosition))
  }

  return (
    <dialog className="modal modal-open" aria-labelledby="name-search-dialog-title">
      <div className="modal-box max-w-lg">
        <div className="-mx-6 -mt-6 mb-4 rounded-t-box bg-base-300 px-6 py-4">
          <h2 id="name-search-dialog-title" className="text-2xl font-semibold">Search by Name</h2>
        </div>
        <div className="mt-4 space-y-4">
          <label className="fieldset-label mb-1">Name</label>
          <label className="input w-full">
            <input
              type="text"
              placeholder="Enter a name"
              className="uppercase placeholder:normal-case"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
            />
          </label>

          <div className="space-y-2 rounded-box bg-base-200 p-4">
            <div className="group flex items-center justify-between">
              <span className="text-sm font-semibold opacity-70">Name</span>
              <span className="result-value inline-flex items-center gap-0.5">{result.name}<CopyButton text={result.name} /></span>
            </div>
            <div className="group flex items-center justify-between">
              <span className="text-sm font-semibold opacity-70">Card Number</span>
              <span className="result-value inline-flex items-center gap-0.5">{result.cardNumber}<CopyButton text={result.cardNumber} /></span>
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

          <div className="flex justify-center gap-2">
            <button type="button" className="btn w-28" onClick={handlePrevious} disabled={position === 0}>‹ Previous</button>
            <button type="button" className="btn w-28" onClick={handleNext}>Next ›</button>
          </div>
        </div>
        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Close name search dialog" onClick={onClose}>
        Close
      </button>
    </dialog>
  )
}
