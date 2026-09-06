import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Spreadsheet from './Spreadsheet'
import './account.css'

const STORAGE_KEY = 'memo_spreadsheet_data';

const normalizeSpreadsheetData = (data) => {
  if (Array.isArray(data)) {
    return {
      content: data,
      colors: Array.from({ length: 26 }, () => Array(26).fill('white'))
    };
  }

  return data;
};

export default function Account({ session = null, storageMode = 'local' }) {
  const [loading, setLoading] = useState(true);
  const [spreadsheetData, setSpreadsheetData] = useState(null);
  const isLocal = storageMode === 'local';

  const loadSpreadsheetData = useCallback(async () => {
    try {
      setLoading(true);

      if (isLocal) {
        const savedData = window.localStorage.getItem(STORAGE_KEY);

        if (savedData) {
          setSpreadsheetData(normalizeSpreadsheetData(JSON.parse(savedData)));
        }

        return;
      }

      const { user } = session;

      const { data, error } = await supabase
        .from('spreadsheets')
        .select('data')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('Error loading spreadsheet:', error);
      } else if (data) {
        setSpreadsheetData(normalizeSpreadsheetData(JSON.parse(data.data)));
      }
    } catch (error) {
      console.error('Error loading spreadsheet:', error);
    } finally {
      setLoading(false);
    }
  }, [isLocal, session]);

  useEffect(() => {
    loadSpreadsheetData();
  }, [loadSpreadsheetData]); // only runs when the session changes because of useCallback

  async function handleSaveSpreadsheet(data) {
    try {
      if (isLocal) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
            <p>{isLocal ? 'Saved in this browser' : session.user.email}</p>
          </div>
        </div>
        {!isLocal && (
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
