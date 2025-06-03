async function saveCsv() {
  const csvText = Papa.unparse(data)

  // First, try to update existing record
  const { data: updateResult, error: updateError } = await supabase
    .from('user_csv_data')
    .update({
      filename,
      csv_content: csvText,
      // Remove updated_at line unless you're sure the column exists
    })
    .eq('user_id', userId)
    .select()

  // Check if update failed or no rows were affected
  if (updateError) {
    alert('Error saving CSV: ' + updateError.message)
    return
  }

  // If no rows were updated (user doesn't have existing data), insert new record
  if (!updateResult || updateResult.length === 0) {
    const { error: insertError } = await supabase
      .from('user_csv_data')
      .insert([{
        user_id: userId,
        filename,
        csv_content: csvText,
      }])
    
    if (insertError) {
      alert('Error saving CSV: ' + insertError.message)
      return
    }
  }

  alert('CSV saved successfully!')
}