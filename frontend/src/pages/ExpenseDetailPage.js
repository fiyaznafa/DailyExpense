import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { getExpenses, getAllExpenses, deleteExpense } from '../api';

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
      } catch (err) {
        setError('Failed to load expenses.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, year, month, category]);

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
    setEditForm(f => ({ ...f, [name]: value }));
  };

  const handleEditSave = async () => {
    setLoading(true);
    try {
      await import('../api').then(api => api.updateExpense(editForm));
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
      alert('Expense deleted successfully.');
    } catch (err) {
      alert('Failed to delete expense.');
    } finally {
      setLoading(false);
    }
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eaeaea', background: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: 10 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Category</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Subcategory</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Description</th>
                  <th style={{ textAlign: 'right', padding: 10 }}>Amount ({rupee})</th>
                  <th style={{ textAlign: 'center', padding: 10 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
                  editId === expense.id ? (
                    <tr key={expense.id} style={{ borderBottom: '1px solid #f0f0f0', background: '#f3f8ff' }}>
                      <td style={{ padding: 10 }}><input type="date" name="date" value={editForm.date} onChange={handleEditChange} /></td>
                      <td style={{ padding: 10 }}><input type="text" name="category" value={editForm.category} onChange={handleEditChange} /></td>
                      <td style={{ padding: 10 }}><input type="text" name="subCategory" value={editForm.subCategory} onChange={handleEditChange} /></td>
                      <td style={{ padding: 10 }}><input type="text" name="description" value={editForm.description} onChange={handleEditChange} /></td>
                      <td style={{ padding: 10, textAlign: 'right' }}><input type="number" name="amount" value={editForm.amount} onChange={handleEditChange} min="0" step="0.01" /></td>
                      <td style={{ padding: 10, textAlign: 'center' }}>
                        <button onClick={handleEditSave} style={{ marginRight: 8, padding: '4px 8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Save</button>
                        <button onClick={handleEditCancel} style={{ padding: '4px 8px', background: '#aaa', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={expense.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: 10 }}>{expense.date}</td>
                      <td style={{ padding: 10 }}>{expense.category}</td>
                      <td style={{ padding: 10 }}>{expense.subCategory}</td>
                      <td style={{ padding: 10 }}>{expense.description}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{rupee} {expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: 10, textAlign: 'center' }}>
                        <button onClick={() => handleEdit(expense)} style={{ marginRight: 8, padding: '4px 8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                        <button onClick={() => handleDelete(expense.id)} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetailPage; 