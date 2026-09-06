import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Account from './Account'

function App() {
  const [session, setSession] = useState(null)
  const isWorkspacePreview = process.env.NODE_ENV === 'development' &&
    new URLSearchParams(window.location.search).get('preview') === 'workspace'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="app-shell">
      {isWorkspacePreview ? (
        <Account preview session={{ user: { id: 'preview', email: 'preview@memo.local' } }} />
      ) : !session ? (
        <Auth />
      ) : (
        <Account key={session.user.id} session={session} />
      )}
    </div>
  )
}

export default App
