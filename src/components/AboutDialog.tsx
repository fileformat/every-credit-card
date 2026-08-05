type AboutDialogProps = {
  isOpen: boolean
  onClose: () => void
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <dialog className="modal modal-open" aria-labelledby="about-dialog-title">
      <div className="modal-box max-w-lg">
        <div className="-mx-6 -mt-6 mb-4 rounded-t-box bg-base-300 px-6 py-4">
          <h2 id="about-dialog-title" className="text-2xl font-semibold">About Every Credit Card</h2>
        </div>
        <div className="mt-4 space-y-4 text-sm leading-6">
          <p>
            It is a joke!  No actual credit cards were harmed in the 
            making of this site.
          </p>
          <p>
            Directly inspired by (and some code borrowed from):<br/>
            <a className="link link-primary" href="https://everyuuid.com/">
              Every UUID
            </a>
          </p>
          <p>
            Check out the{' '}
            <a className="link link-primary" href="https://github.com/fileformat/every-credit-card" target="_blank" rel="noreferrer">
               Source
            </a>!
          </p>
        </div>
        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Close about dialog" onClick={onClose}>
        Close
      </button>
    </dialog>
  )
}
