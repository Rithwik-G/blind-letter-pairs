const getCSVData = (data) => {
    const headers = ',' + Array.from({length: COLS}, (_, i) => String.fromCharCode(65 + i)).join(',');
    const rows = data.map((row, r) => [String.fromCharCode(65 + r), ...row].join(',')).join('\n');
    const csvContent = headers + '\n' + rows;
    return csvContent;
  }

export default CSVData;
