import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Spreadsheet from './Spreadsheet' // Import your spreadsheet editor component
import Papa from 'papaparse' // CSV parser (install via npm install papaparse)

export default function Account({ session }) {
  const userId = session.user.id
  const [data, setData] = useState(
    Array.from({ length: 26 }, () => Array(26).fill(''))
  )
  const [filename, setFilename] = useState('spreadsheet.csv')

  // Load CSV from Supabase, parse CSV text into 2D array for Spreadsheet
  useEffect(() => {
    async function loadCsv() {
      const { data: csvData, error } = await supabase
        .from('user_csv_data')
        .select('csv_content, filename')
        .eq('user_id', userId)
        .order('inserted_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading CSV:', error)
      } else if (csvData && csvData.csv_content) {
        setFilename(csvData.filename || 'spreadsheet.csv')
        const parsed = Papa.parse(csvData.csv_content, { header: false })
        // Convert parsed data (array of arrays) into 26x26 array, filling missing cells with ''
        const rows = parsed.data
        const newData = Array.from({ length: 26 }, (_, r) =>
          Array.from({ length: 26 }, (_, c) => (rows[r] && rows[r][c]) || '')
        )
        setData(newData)
      }
    }
    loadCsv()
  }, [userId])

  // Save CSV content to Supabase by converting data array to CSV string
  async function saveCsv() {
    const csvText = Papa.unparse(data)

    const { error } = await supabase
      .from('user_csv_data')
      .upsert([{
        user_id: userId,
        filename,
        csv_content: csvText,
      }], {
        onConflict: 'user_id' // Assuming user_id is unique
      })

    if (error) {
      alert('Error saving CSV: ' + error.message)
    } else {
      alert('CSV saved successfully!')
    }
  }

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

      <Spreadsheet data={data} setData={setData} />

      <button onClick={saveCsv} style={{ marginTop: 10, padding: '8px 16px' }}>
        Save CSV to Supabase
      </button>
    </div>
  )
}
