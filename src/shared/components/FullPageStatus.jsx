export function FullPageStatus({ message }) {
  return <main className="full-page-status" role="status"><div className="spinner" aria-hidden="true" /><p>{message}</p></main>
}
