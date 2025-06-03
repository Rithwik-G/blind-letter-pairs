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
  const [loading, setLoading] = useState(false)

  // Load CSV from Supabase, parse CSV text into 2D array for Spreadsheet
  useEffect(() => {
  async function loadCsv() {
    console.log('Loading CSV for user:', userId)
    
    // First, let's test if the table exists and we can query it at all
    try {
      const { data: testData, error: testError } = await supabase
        .from('user_csv_data')
        .select('*')
        .limit(1)
      
      console.log('Test query result:', testData)
      console.log('Test query error:', testError)
      
      if (testError) {
        console.error('Table query failed:', testError)
        return
      }
    } catch (err) {
      console.error('Table access error:', err)
      return
    }
    
    // Now try the actual query
    try {
      const { data: csvData, error } = await supabase
        .from('user_csv_data')
        .select('csv_content, filename')
        .eq('user_id', userId)
        .maybeSingle()

      console.log('CSV data loaded:', csvData)
      console.log('Query error:', error)
      
      if (error) {
        console.error('Error loading CSV:', error)
      } else if (csvData && csvData.csv_content) {
        setFilename(csvData.filename || 'spreadsheet.csv')
        const parsed = Papa.parse(csvData.csv_content, { header: false })
        const rows = parsed.data
        const newData = Array.from({ length: 26 }, (_, r) =>
          Array.from({ length: 26 }, (_, c) => (rows[r] && rows[r][c]) || '')
        )
        setData(newData)
      } else {
        console.log('No data found for user')
      }
    } catch (err) {
      console.error('Unexpected error loading CSV:', err)
    }
  }
  loadCsv()
}, [userId])

  // Save CSV content to Supabase by converting data array to CSV string
  async function saveCsv() {
    setLoading(true)
    try {
      const csvText = Papa.unparse(data)

      // Check if record exists first
      const { data: existingData, error: checkError } = await supabase
        .from('user_csv_data')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (checkError) {
        throw new Error('Error checking existing data: ' + checkError.message)
      }

      if (existingData) {
        // Record exists, update it
        const { error: updateError } = await supabase
          .from('user_csv_data')
          .update({
            filename,
            csv_content: csvText,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (updateError) {
          throw new Error('Error updating CSV: ' + updateError.message)
        }
      } else {
        // No record exists, insert new one
        const { error: insertError } = await supabase
          .from('user_csv_data')
          .insert([{
            user_id: userId,
            filename,
            csv_content: csvText,
          }])
        
        if (insertError) {
          throw new Error('Error inserting CSV: ' + insertError.message)
        }
      }

      alert('CSV saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert(error.message || 'Error saving CSV')
    } finally {
      setLoading(false)
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

      <button 
        onClick={saveCsv} 
        disabled={loading}
        style={{ 
          marginTop: 10, 
          padding: '8px 16px',
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Saving...' : 'Save CSV to Supabase'}
      </button>
    </div>
  )
}