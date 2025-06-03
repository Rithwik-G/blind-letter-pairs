import { useState, useEffect } from 'react'

function App() {
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    // Test if environment variables are loaded
    console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL)
    console.log('Supabase Key:', process.env.REACT_APP_SUPABASE_ANON_KEY)
    
    if (process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY) {
      setStatus('Environment variables loaded')
    } else {
      setStatus('Environment variables missing')
    }
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>App Status Check</h1>
      <p>Status: {status}</p>
      <p>URL: {process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Missing'}</p>
      <p>Key: {process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
    </div>
  )
}

export default App