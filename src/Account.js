import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Spreadsheet from './Spreadsheet'
import './account.css'

export default function Account({ session, preview = false }) {
  const [loading, setLoading] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState(null);

  const loadSpreadsheetData = useCallback(async () => {
    try {
      setLoading(true);
      if (preview) return;
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
  }, [preview, session]);

  useEffect(() => {
    loadSpreadsheetData();
  }, [loadSpreadsheetData]); // only runs when the session changes because of useCallback

  async function handleSaveSpreadsheet(data) {
    try {
      if (preview) {
        setSpreadsheetData(data);
        return;
      }
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
    <div className="workspace">
      <header className="workspace-header">
        <div className="workspace-title">
          <span className="wordmark">memo</span>
          <div>
            <h1>Blind Letter Pairs</h1>
            <p>{preview ? 'Preview workspace' : session.user.email}</p>
          </div>
        </div>
        {!preview && (
          <button className="sign-out" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        )}
      </header>
      
      {loading ? (
        <div className="loading-state">Loading letter pairs…</div>
      ) : (
        <Spreadsheet 
          initialData={spreadsheetData} 
          onSave={handleSaveSpreadsheet}
        />
      )}
    </div>
  );
}

