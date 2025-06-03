import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Account({ session }) {
  const [csvContent, setCsvContent] = useState('')
  const [filename, setFilename] = useState('spreadsheet.csv')
  const userId = session.user.id

  // Load CSV data from Supabase on mount
  useEffect(() => {
    async function loadCsv() {
      const { data, error } = await supabase
        .from('user_csv_data')
        .select('csv_content, filename')
        .eq('user_id', userId)
        .order('inserted_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading CSV:', error)
      } else if (data) {
        setCsvContent(data.csv_content)
        setFilename(data.filename || 'spreadsheet.csv')
      }
    }

    loadCsv()
  }, [userId])

  // Save CSV content to Supabase
  async function saveCsv() {
    const { data, error } = await supabase
      .from('user_csv_data')
      .insert([
        {
          user_id: userId,
          filename,
          csv_content: csvContent,
        },
      ])

    if (error) {
      alert('Error saving CSV: ' + error.message)
    } else {
      alert('CSV saved successfully!')
    }
  }

  // Simple CSV textarea editor for demonstration
  return (
    <div>
      <h2>Welcome, {session.user.email}</h2>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Filename"
          style={{ padding: 8, width: '300px' }}
        />
      </div>
      <textarea
        rows={15}
        cols={80}
        value={csvContent}
        onChange={(e) => setCsvContent(e.target.value)}
        placeholder="Paste or edit your CSV content here"
        style={{ fontFamily: 'monospace', fontSize: 14, padding: 10 }}
      />
      <br />
      <button onClick={saveCsv} style={{ marginTop: 10, padding: '8px 16px' }}>
        Save CSV to Supabase
      </button>
    </div>
  )
}
