export function FullPageStatus({ message }: { message: string }) {
  return <main className="full-page-status" role="status"><div className="spinner" aria-hidden="true" /><p>{message}</p></main>
}
