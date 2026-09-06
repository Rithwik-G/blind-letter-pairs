import React, { useState, useRef, useEffect } from 'react';
import './Spreadsheet.css';
import getCSVData from './csv_utils';

const ROWS = 26; // A-Z
const COLS = 26; // A-Z 
const nxt = {
  'white': 'lightgray',
  'lightgray': 'yellow',
  'yellow': 'red',
  'red': 'white',
}

const Spreadsheet = ({ initialData, onSave }) => {
  const [data, setData] = useState(() =>
    (initialData?.content) || Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  );

  const [color, setColor] = useState(() =>
    (initialData?.colors) || Array.from({ length: ROWS }, () => Array(COLS).fill('white'))
  );
  
  const [editing, setEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [updateQuery, setUpdateQuery] = useState('');
  const inputRef = useRef(null);
  const [buffer, setBuffer] = useState('');

  const saveSnapshot = (nextData = data, nextColors = color) => {
    if (onSave) {
      onSave({
        content: nextData,
        colors: nextColors
      });
    }
  };

  const handleSave = () => saveSnapshot();

  const exportToCSV = () => {
    const csvContent = getCSVData(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'spreadsheet.csv');

    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
    console.log('CSV exported successfully');
  }

  const exportToAnkiCSV = () => {
    let final_data = "front,back\n"
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        const cell = data[i][j];
        if (cell) {
          final_data += `${String.fromCharCode(65 + i)}${String.fromCharCode(65 + j)},${cell}\n`;
        }
      }
    }

    const blob = new Blob([final_data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'anki_flashcards.csv');

    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
    console.log('Anki CSV exported successfully');
  }

  function searchLetterPair(query) {
    if (query.length !== 2) {
      alert('Please enter a valid letter pair');
      return;
    }

    const letterPair = query.toUpperCase();
    const ind1 = letterPair.charCodeAt(0) - 65;
    const ind2 = letterPair.charCodeAt(1) - 65;

    if (ind1 >= 0 && ind1 < 26 && ind2 >= 0 && ind2 < 26) {
      setSearchResult(data[ind1][ind2] || 'No result found');
    } else {
      alert('Invalid letter pair');
    }
  };

  function setLetterPair(pair, newWord) {
    if (pair.length !== 2) {
      alert('Please enter a valid letter pair');
      return;
    }

    const letterPair = pair.toUpperCase();
    const ind1 = letterPair.charCodeAt(0) - 65;
    const ind2 = letterPair.charCodeAt(1) - 65;

    if (ind1 >= 0 && ind1 < 26 && ind2 >= 0 && ind2 < 26) {
      const newData = data.map(r => r.slice());
      newData[ind1][ind2] = newWord;
      setData(newData);
      saveSnapshot(newData, color);
      setSearchResult(newWord || 'No result found');
    } else {
      alert('Invalid letter pair');
    }
  }

  const uploadCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n');
      
      // Skip header row and create new data array
      const newData = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
      
      // Start from index 1 to skip header row
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split(',');
        if (cells.length > 1) { // Ensure row has data
          const rowIndex = cells[0].charCodeAt(0) - 65; // Convert 'A' to 0, 'B' to 1, etc.
          for (let j = 1; j < cells.length; j++) {
            if (rowIndex >= 0 && rowIndex < ROWS && j-1 < COLS) {
              newData[rowIndex][j-1] = cells[j].trim(); // like .strip() in python
            }
          }
        }
      }
      
      setData(newData);
      saveSnapshot(newData, color);
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleClick = (row, col) => {
    setEditing({ row, col });
  };

  const handleChange = (e, row, col) => {
    const newData = data.map(r => r.slice());
    newData[row][col] = e.target.value;
    setData(newData);
  };

  const handleContextMenu = (e, r, c) => {
    e.preventDefault();
    const newColor = color.map(row => [...row]);
    const currentColor = color[r][c];
    newColor[r][c] = nxt[currentColor];
    setColor(newColor);
    saveSnapshot(data, newColor);
  };

  const moveEditing = (row, col) => {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      setEditing({ row, col });
    } else {
      setEditing(null);
    }
  };

  const handleKeyDown = (e, row, col) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      moveEditing(row + 1, col);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      moveEditing(row, col + 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveEditing(row + 1, col);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveEditing(row - 1, col);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveEditing(row, col - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveEditing(row, col + 1);
    } else if (e.key === 'Escape') {
      setEditing(null);
    }
  };


  return (
    <>
      <div className="workspace-actions">
        <button onClick={handleSave} className="button button-primary">Save</button>
        <button onClick={exportToCSV} className="button button-secondary">Export CSV</button>
        <button onClick={exportToAnkiCSV} className="button button-secondary">Export Anki</button>
        <label className="button button-secondary file-button">
          Import CSV
          <input type="file" accept=".csv" onChange={uploadCSV} />
        </label>
      </div>

      <section className="pair-tools" aria-label="Letter pair tools">
        <div className="tool-group pair-search">
          <label htmlFor="pair-query">Letter pair</label>
          <div className="inline-controls">
            <input
              id="pair-query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && searchLetterPair(searchQuery)}
              placeholder="AB"
              maxLength={2}
            />
            <button className="button button-secondary" onClick={() => searchLetterPair(searchQuery)}>Find</button>
          </div>
          {searchResult && <div className="search-result"><span>{searchQuery.toUpperCase()}</span>{searchResult}</div>}
        </div>

        <div className="tool-group pair-update">
          <label htmlFor="pair-word">Mnemonic</label>
          <div className="inline-controls">
            <input
              id="pair-word"
              type="text"
              value={updateQuery}
              onChange={(e) => setUpdateQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setLetterPair(searchQuery, updateQuery)}
              placeholder="Baseball"
            />
            <button className="button button-secondary" onClick={() => setLetterPair(searchQuery, updateQuery)}>Update</button>
          </div>
        </div>

        <div className="tool-group buffer-tool">
          <label htmlFor="buffer">Buffer</label>
          <select id="buffer" value={buffer} onChange={(e) => setBuffer(e.target.value)}>
            <option value=''>All pairs</option>
            <option value='ARE'>ARE · ULB</option>
            <option value='CIM'>CIM · UFR</option>
          </select>
        </div>
      </section>

      <p className="grid-hint">Click a cell to edit · right-click to mark confidence</p>

      <div className="spreadsheet-container">
        <table className="spreadsheet" aria-label="Blindsolving letter pairs">
          <thead>
            <tr>
              <th></th>
              {Array.from({ length: COLS }, (_, i) => (
                <th key={i}>{String.fromCharCode(65 + i)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((rowData, r) => (
              <tr key={r}>
                <th>{String.fromCharCode(65+r)}</th>
                {rowData.map((cell, c) => (
                  <td
                    key={c}
                    onClick={() => handleClick(r, c)}
                    className={editing && editing.row === r && editing.col === c ? 'editing' : ''}
                    style={{
                      backgroundColor: (buffer.includes(String.fromCharCode(65 + r)) || buffer.includes(String.fromCharCode(65 + c))) ? 'lightgray' : color[r][c]
                    }}
                    onContextMenu={(e) => handleContextMenu(e, r, c)}
                  >
                    {editing && editing.row === r && editing.col === c ? (
                      <input
                        ref={inputRef}
                        value={cell}
                        onChange={e => handleChange(e, r, c)}
                        onBlur={() => {
                          setEditing(null);
                          handleSave();
                        }}
                        onKeyDown={e => handleKeyDown(e, r, c)}
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );
};

export default Spreadsheet;
