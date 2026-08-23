import { AppProviders } from './providers/AppProviders.tsx'
import { AppRouter } from './router/AppRouter.tsx'

function App() {
  return <AppProviders><AppRouter /></AppProviders>
}

export default App
