export default function PincodeChecker({
  id,
  pincode,
  result,
  onPincodeChange,
  onCheck,
}) {
  const resultIsCurrent = result?.pincode === pincode.trim()

  return (
    <form
      className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault()
        onCheck()
      }}
    >
      <label htmlFor={id} className="block text-sm font-medium text-stone-900">
        Check delivery to your area
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(event) => onPincodeChange(event.target.value)}
          placeholder="6-digit pincode"
          aria-describedby={`${id}-result`}
          className="min-w-0 flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
        >
          Check
        </button>
      </div>
      <p
        id={`${id}-result`}
        className={`mt-3 min-h-5 text-sm ${
          resultIsCurrent
            ? result.serviceable
              ? 'text-emerald-800'
              : 'text-rose-700'
            : 'text-stone-500'
        }`}
        role="status"
        aria-live="polite"
      >
        {resultIsCurrent
          ? result.message
          : 'We currently deliver to selected areas in Karnataka.'}
      </p>
    </form>
  )
}
