import React, { useState, useRef, useEffect } from 'react';
import './Spreadsheet.css';

const ROWS = 26; // A-Z
const COLS = 26; // A-Z 


const getCSVData = (data) => {
    const headers = ',' + Array.from({length: COLS}, (_, i) => String.fromCharCode(65 + i)).join(',');
    const rows = data.map((row, r) => [String.fromCharCode(65 + r), ...row].join(',')).join('\n');
    const csvContent = headers + '\n' + rows;
    return csvContent;
  }
  
const Spreadsheet = () => {
  


  const [data, setData] = useState(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  );
  const [editing, setEditing] = useState(null);
  const inputRef = useRef(null);

  
  const exportToCSV = () => {
    const csvContent = getCSVData();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'spreadsheet.csv');

    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
    console.log('CSV exported successfully');
  }

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
      <table className="spreadsheet">
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
                >
                  {editing && editing.row === r && editing.col === c ? (
                    <input
                      ref={inputRef}
                      value={cell}
                      onChange={e => handleChange(e, r, c)}
                      onBlur={() => setEditing(null)}
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
      <button onClick={exportToCSV}>Export CSV</button>
    </>
  );
};

export default Spreadsheet;
