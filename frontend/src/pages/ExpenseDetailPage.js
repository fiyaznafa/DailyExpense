import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { getExpenses, getAllExpenses, deleteExpense, updateExpense, getCategories, addExpense, importExpenses } from '../api';
import { FaDownload, FaUpload, FaSpinner } from 'react-icons/fa';

const rupee = '\u20B9';

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: 24,
  marginBottom: 24,
  minWidth: 0
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ExpenseDetailPage = () => {
  const { type } = useParams();
  const query = useQuery();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [categories, setCategories] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Import/Export state
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Read filters from query params
  const year = query.get('year');
  const month = query.get('month');
  const category = query.get('category');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        if (type === 'month' && year && month) {
          data = await getExpenses(month, year);
        } else if (type === 'category' && year && month && category) {
          // Get all expenses for the month, then filter by category
          const all = await getExpenses(month, year);
          data = all.filter(e => e.category === category);
        } else if (type === 'year' && year) {
          // Get all expenses for the year
          const all = await getAllExpenses();
          data = all.filter(e => new Date(e.date).getFullYear() === parseInt(year));
        } else {
          // fallback: show all
          data = await getAllExpenses();
        }
        setExpenses(data);
        // Reset to first page when data changes
        setCurrentPage(1);
      } catch (err) {
        setError('Failed to load expenses.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, year, month, category]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      setCategories([]);
    }
  };

  let title = 'Expenses';
  if (type === 'month' && year && month) {
    title = `Expenses for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`;
  } else if (type === 'category' && year && month && category) {
    title = `Expenses for ${category} in ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`;
  } else if (type === 'year' && year) {
    title = `Expenses for Year ${year}`;
  }

  // Go to dashboard with filters
  const goToDashboard = () => {
    const params = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    navigate(`/?${params.join('&')}`);
  };

  const handleEdit = (expense) => {
    setEditId(expense.id);
    setEditForm({ ...expense });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    // Convert amount to number if it's the amount field
    const processedValue = name === 'amount' ? parseFloat(value) || 0 : value;
    setEditForm(f => ({ ...f, [name]: processedValue }));
  };

  const handleEditSave = async () => {
    setLoading(true);
    try {
      await updateExpense(editForm);
      setEditId(null);
      // Refresh data
      let data = [];
      if (type === 'month' && year && month) {
        data = await getExpenses(month, year);
      } else if (type === 'category' && year && month && category) {
        const all = await getExpenses(month, year);
        data = all.filter(e => e.category === category);
      } else if (type === 'year' && year) {
        const all = await getAllExpenses();
        data = all.filter(e => new Date(e.date).getFullYear() === parseInt(year));
      } else {
        data = await getAllExpenses();
      }
      setExpenses(data);
    } catch (err) {
      alert('Failed to update expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditForm({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    setLoading(true);
    try {
      await deleteExpense(id);
      // Refresh data
      let data = [];
      if (type === 'month' && year && month) {
        data = await getExpenses(month, year);
      } else if (type === 'category' && year && month && category) {
        const all = await getExpenses(month, year);
        data = all.filter(e => e.category === category);
      } else if (type === 'year' && year) {
        const all = await getAllExpenses();
        data = all.filter(e => new Date(e.date).getFullYear() === parseInt(year));
      } else {
        data = await getAllExpenses();
      }
      setExpenses(data);
      // Reset to first page after deletion
      setCurrentPage(1);
      alert('Expense deleted successfully.');
    } catch (err) {
      alert('Failed to delete expense.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Export current data to CSV
  const handleExportCSV = () => {
    try {
      // Create CSV content
      const headers = ['Date', 'Category', 'Subcategory', 'Description', 'Amount'];
      const csvContent = [
        headers.join(','),
        ...expenses.map(expense => [
          expense.date,
          `"${expense.category}"`,
          `"${expense.subCategory || ''}"`,
          `"${expense.description || ''}"`,
          expense.amount
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `expenses_${type}_${year || 'all'}_${month || ''}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Import data from CSV
  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please select a file smaller than 5MB.');
      return;
    }

    setImportLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const csvContent = e.target.result;
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Validate headers
        const expectedHeaders = ['Date', 'Category', 'Subcategory', 'Description', 'Amount'];
        const isValidFormat = expectedHeaders.every(header => 
          headers.some(h => h.toLowerCase() === header.toLowerCase())
        );
        
        if (!isValidFormat) {
          throw new Error('Invalid CSV format. Please use the exported format as template.');
        }

        // Parse CSV rows into expense objects
        const importedExpenses = [];
        let frontendDuplicateCount = 0;
        let parseErrorCount = 0;
        const existingSet = new Set(expenses.map(e => `${e.date}|${e.category}|${e.subCategory || ''}|${e.amount}|${e.description || ''}`));

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            // Parse CSV line (handle quoted values)
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
              const char = line[j];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());

            if (values.length >= 5) {
              const [date, category, subCategory, description, amount] = values;
              // Validate data
              if (!date || !category || !amount || isNaN(parseFloat(amount))) {
                parseErrorCount++;
                continue;
              }
              const key = `${date}|${category.replace(/"/g, '')}|${(subCategory || '').replace(/"/g, '')}|${parseFloat(amount)}|${(description || '').replace(/"/g, '')}`;
              if (existingSet.has(key)) {
                frontendDuplicateCount++;
                continue;
              }
              importedExpenses.push({
                date: date,
                category: category.replace(/"/g, ''),
                subCategory: (subCategory || '').replace(/"/g, ''),
                description: (description || '').replace(/"/g, ''),
                amount: parseFloat(amount)
              });
            }
          } catch (lineError) {
            parseErrorCount++;
            console.error(`Error processing line ${i + 1}:`, lineError);
          }
        }

        // Bulk import to backend
        let backendSummary = { imported: 0, skipped: 0, failed: 0 };
        if (importedExpenses.length > 0) {
          try {
            backendSummary = await importExpenses(importedExpenses);
          } catch (err) {
            alert('Import failed at backend: ' + (err.message || err));
            setImportLoading(false);
            return;
          }
        }

        // Refresh data after import
        let data = [];
        if (type === 'month' && year && month) {
          data = await getExpenses(month, year);
        } else if (type === 'category' && year && month && category) {
          const all = await getExpenses(month, year);
          data = all.filter(e => e.category === category);
        } else if (type === 'year' && year) {
          const all = await getAllExpenses();
          data = all.filter(e => new Date(e.date).getFullYear() === parseInt(year));
        } else {
          data = await getAllExpenses();
        }
        setExpenses(data);
        setCurrentPage(1);

        // Show results
        let summaryMsg = `Import completed!\n`;
        summaryMsg += `Imported: ${backendSummary.imported}\n`;
        summaryMsg += `Skipped as duplicates (frontend): ${frontendDuplicateCount}\n`;
        summaryMsg += `Skipped as duplicates (backend): ${backendSummary.skipped}\n`;
        if (backendSummary.failed > 0) summaryMsg += `Failed: ${backendSummary.failed}\n`;
        if (parseErrorCount > 0) summaryMsg += `Parse errors: ${parseErrorCount}\n`;
        alert(summaryMsg);

      } catch (error) {
        console.error('Import error:', error);
        alert(`Import failed: ${error.message}`);
      } finally {
        setImportLoading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ padding: 32, background: '#f4f6fa', minHeight: '100vh', fontFamily: 'Roboto, Inter, Arial, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <button onClick={goToDashboard} style={{
            background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 16, cursor: 'pointer', marginRight: 18
          }}>Back to Dashboard</button>
          <h2 style={{ fontWeight: 700, color: '#222', margin: 0 }}>{title}</h2>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading expenses...</div>
        ) : error ? (
          <div style={{ color: 'red', padding: 20 }}>{error}</div>
        ) : expenses.length === 0 ? (
          <div style={{ color: '#666', padding: 20 }}>No expenses found for this filter.</div>
        ) : (
          <div style={{ ...cardStyle, overflowX: 'auto' }}>
            <table className="wide-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eaeaea', background: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: 10 }} className="nowrap">Date</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Category</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Subcategory</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Description</th>
                  <th style={{ textAlign: 'right', padding: 10 }} className="nowrap">Amount ({rupee})</th>
                  <th style={{ textAlign: 'center', padding: 10, minWidth: 160, width: 160 }} className="table-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map(expense => (
                  editId === expense.id ? (
                    <tr key={expense.id} style={{ borderBottom: '1px solid #f0f0f0', background: '#f3f8ff' }}>
                      <td style={{ padding: 10 }} className="nowrap">
                        <input 
                          type="date" 
                          name="date" 
                          value={editForm.date} 
                          onChange={handleEditChange} 
                          className="table-edit-input" 
                        />
                      </td>
                      <td style={{ padding: 10 }}>
                        <select name="category" value={editForm.category} onChange={handleEditChange} className="table-edit-input">
                          {categories.map(cat => (
                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: 10 }}>
                        <select name="subCategory" value={editForm.subCategory} onChange={handleEditChange} className="table-edit-input">
                          {(categories.find(c => c.name === editForm.category)?.subCategories || []).map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: 10 }}><input type="text" name="description" value={editForm.description} onChange={handleEditChange} className="table-edit-input description" /></td>
                      <td style={{ padding: 10, textAlign: 'right' }} className="nowrap">
                        <input 
                          type="number" 
                          name="amount" 
                          value={editForm.amount} 
                          onChange={handleEditChange} 
                          className="table-edit-input" 
                          step="0.01" 
                          min="0"
                          style={{ textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ padding: 10, textAlign: 'center', minWidth: 160, width: 160 }} className="table-actions-col">
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                          <button onClick={handleEditSave} style={{ marginRight: 0, padding: '4px 8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Save</button>
                          <button onClick={handleEditCancel} style={{ padding: '4px 8px', background: '#aaa', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={expense.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: 10 }} className="nowrap">{new Date(expense.date).toLocaleDateString('en-CA')}</td>
                      <td style={{ padding: 10 }}>{expense.category}</td>
                      <td style={{ padding: 10 }}>{expense.subCategory}</td>
                      <td style={{ padding: 10 }}>{expense.description}</td>
                      <td style={{ padding: 10, textAlign: 'right' }} className="nowrap">{rupee} {expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: 10, textAlign: 'center' }} className="sticky-action-col">
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => handleEdit(expense)} style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500, minWidth: 60 }}>Edit</button>
                          <button onClick={() => handleDelete(expense.id)} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500, minWidth: 60 }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
            
            {/* Results Summary */}
            <div className="results-summary">
              Showing {startIndex + 1} to {Math.min(endIndex, expenses.length)} of {expenses.length} expenses
            </div>
            
            {/* Import/Export Buttons */}
            <div className="import-export-container">
              <button 
                onClick={handleExportCSV}
                className="import-export-button export-button"
                title="Export current data to CSV"
              >
                <FaDownload /> Export CSV
              </button>
              
              <button 
                onClick={handleImportClick}
                className="import-export-button import-button"
                disabled={importLoading}
                title="Import data from CSV file"
              >
                {importLoading ? <FaSpinner className="spinner" /> : <FaUpload />} 
                {importLoading ? 'Importing...' : 'Import CSV'}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
              />
            </div>
            
            {/* Help Text */}
            <div className="import-export-help">
              <small>
                💡 <strong>CSV Format:</strong> Date, Category, Subcategory, Description, Amount<br/>
                💡 <strong>Export:</strong> Downloads current filtered data as CSV<br/>
                💡 <strong>Import:</strong> Use exported CSV as template for importing new data
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetailPage; 