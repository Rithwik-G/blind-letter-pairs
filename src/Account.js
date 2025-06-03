import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Spreadsheet from './Spreadsheet'
import './account.css'

export default function Account({ session }) {
  const [loading, setLoading] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState(null);

  const loadSpreadsheetData = useCallback(async () => {
    try {
      setLoading(true);
      const { user } = session;

      const { data, error } = await supabase
        .from('spreadsheets')
        .select('data')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('Error loading spreadsheet:', error);
      } else if (data) {
        const parsedData = JSON.parse(data.data);
        // Handle both old format (just array) and new format (object with content and colors)
        if (Array.isArray(parsedData)) {
          setSpreadsheetData({
            content: parsedData,
            colors: Array.from({ length: 26 }, () => Array(26).fill('white'))
          });
        } else {
          setSpreadsheetData(parsedData);
        }
      }
    } catch (error) {
      console.error('Error loading spreadsheet:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpreadsheetData();
  }, [loadSpreadsheetData]); // only runs when the session changes because of useCallback

  async function handleSaveSpreadsheet(data) {
    try {
      const { user } = session;

      const updates = {
        user_id: user.id,
        data: JSON.stringify(data),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('spreadsheets')
        .upsert(updates, {
          onConflict: 'user_id',
          returning: 'minimal'
        });

      if (error) {
        throw error;
      }

      setSpreadsheetData(data);
    } catch (error) {
      console.error('Error saving spreadsheet:', error);
      alert('Error saving spreadsheet. Please try again.');
    }
  }

  return (
    <div>
      <header>
        {/* <h1>Letter Pairs</h1> */}
      </header>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Spreadsheet 
          initialData={spreadsheetData} 
          onSave={handleSaveSpreadsheet}
        />
      )}
      <br />
      <button className="button" onClick={() => supabase.auth.signOut()}>
        Sign Out
      </button>
    </div>
  );
}


