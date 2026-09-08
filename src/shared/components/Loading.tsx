export function Spinner({ small = false }: { small?: boolean }) {
  return <span className={small ? 'spinner spinner-sm' : 'spinner'} aria-hidden="true" />
}

export function LoadingBlock({ message = 'Cargando…' }: { message?: string }) {
  return (
    <div className="loading-block" role="status">
      <Spinner />
      <p>{message}</p>
    </div>
  )
}
