export default function AdminPageHeader({ heading, highlight, subtitle, action }) {
  const head = heading
  const tail = highlight

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 pt-6 md:flex-row md:items-end">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          <span className="text-white">{head}</span>
          {tail ? (
            <>
              {' '}
              <span className="text-white/30">·</span>{' '}
              <span className="bg-gradient-to-r from-[#D4A017] to-[#E5B82F] bg-clip-text text-transparent">
                {tail}
              </span>
            </>
          ) : null}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  )
}
