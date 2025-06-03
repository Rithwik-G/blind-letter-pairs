// import React, { useState, useRef, useEffect } from 'react';
import './Spreadsheet.css';

const ROWS = 26; // A-Z
const COLS = 26; // A-Z

const getCSVData = (data) => {
    const headers = ',' + Array.from({length: COLS}, (_, i) => String.fromCharCode(65 + i)).join(',');
    const rows = data.map((row, r) => [String.fromCharCode(65 + r), ...row].join(',')).join('\n');
    const csvContent = headers + '\n' + rows;
    return csvContent;
  }

export default getCSVData;
