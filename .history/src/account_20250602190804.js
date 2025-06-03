import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Spreadsheet from './Spreadsheet'

export default function Account({ session }) {

  // useEffect(() => {
  //   let ignore = false
  //   async function getProfile() {
  //     setLoading(true)
  //     const { user } = session

  //     const { data, error } = await supabase
  //       .from('user_csv_data')
  //       .select(`username, website, avatar_url`)
  //       .eq('id', user.id)
  //       .single()

  //     if (!ignore) {
  //       if (error) {
  //         console.warn(error)
  //       } else if (data) {
  //         setUsername(data.username)
  //         setWebsite(data.website)
  //         setAvatarUrl(data.avatar_url)
  //       }
  //     }

  //     setLoading(false)
  //   }

  //   getProfile()

  //   return () => {
  //     ignore = true
  //   }
  // }, [session])

  async function updateCSV(event, avatarUrl) {
    event.preventDefault()

    const { user } = session

    const updates = {
      id: user.id,
      csv_content: JSON.stringify(Spreadsheet.getCSVData()), // Assuming Spreadsheet has a method to get data
      updated_at: new Date(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)
  }

  return (
    <>
      <Spreadsheet/>

      <div>
        <button className="button block" type="button" onClick={() => updateCSV()}>
          Save CSV
        </button>
      </div>
      <div>
        <button className="button block" type="button" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>
    </>
  )
}