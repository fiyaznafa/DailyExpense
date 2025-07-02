import React, { useState, useEffect } from 'react';
import { addExpense, addRecurringExpense, getCategories, addCategory, addSubCategory } from '../api';

const rupee = '\u20B9';

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  padding: 40,
  margin: '40px auto',
  maxWidth: 420,
  fontFamily: 'Roboto, Inter, Arial, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  gap: 18
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 16,
  marginBottom: 0,
  background: '#f8fafc',
  transition: 'border 0.2s'
};

const labelStyle = {
  fontWeight: 500,
  marginBottom: 6,
  display: 'block',
  color: '#333',
  fontSize: 15
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(90deg, #007bff 60%, #4e79a7 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 18,
  cursor: 'pointer',
  marginTop: 10,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
};

const addBtnStyle = {
  width: '100%',
  padding: '8px',
  background: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 15,
  cursor: 'pointer',
  marginTop: 6,
  marginBottom: 0
};

const sectionDivider = {
  border: 'none',
  borderTop: '1px solid #eee',
  margin: '18px 0 10px 0'
};

const DailyEntryPage = () => {
  const [form, setForm] = useState({
    date: new Date().toLocaleDateString('en-CA'),
    category: '',
    subCategory: '',
    description: '',
    amount: '',
    isRecurring: false,
    recurrenceType: 'MONTHLY',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    recurrenceEndType: 'endDate',
    numOccurrences: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    // Force a full reset of the form state
    const today = new Date().toLocaleDateString('en-CA');
    setForm({
      date: today,
      category: '',
      subCategory: '',
      description: '',
      amount: '',
      isRecurring: false,
      recurrenceType: 'MONTHLY',
      recurrenceInterval: 1,
      recurrenceEndDate: '',
      recurrenceEndType: 'endDate',
      numOccurrences: '',
    });
    console.log('FORCED RESET: Form date set to', today);
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'radio') {
      setForm({ ...form, [name]: value });
      return;
    }
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
    if (name === 'category') {
      setForm(f => ({ ...f, subCategory: '' }));
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const cat = await addCategory(newCategory.trim());
    setNewCategory('');
    await fetchCategories();
    setForm(f => ({ ...f, category: cat.name, subCategory: '' }));
  };

  const handleAddSubCategory = async () => {
    if (!form.category || !newSubCategory.trim()) return;
    const cat = await addSubCategory(form.category, newSubCategory.trim());
    setNewSubCategory('');
    await fetchCategories();
    setForm(f => ({ ...f, subCategory: newSubCategory.trim() }));
  };

  const resetForm = () => {
    setForm({
      date: new Date().toLocaleDateString('en-CA'),
      category: '',
      subCategory: '',
      description: '',
      amount: '',
      isRecurring: false,
      recurrenceType: 'MONTHLY',
      recurrenceInterval: 1,
      recurrenceEndDate: '',
      recurrenceEndType: 'endDate',
      numOccurrences: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const expenseData = {
        date: form.date,
        category: form.category,
        subCategory: form.subCategory,
        description: form.description,
        amount: parseFloat(form.amount)
      };

      if (form.isRecurring) {
        const recurringData = {
          ...expenseData,
          recurrenceType: form.recurrenceType,
          recurrenceInterval: parseInt(form.recurrenceInterval),
          recurrenceEndDate: form.recurrenceEndType === 'endDate' ? form.recurrenceEndDate : null,
          numOccurrences: form.recurrenceEndType === 'occurrences' ? parseInt(form.numOccurrences) : null
        };
        await addRecurringExpense(recurringData);
        setMessage({ type: 'success', text: 'Recurring expense added successfully!' });
      } else {
        await addExpense(expenseData);
        setMessage({ type: 'success', text: 'Expense added successfully!' });
      }

      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error('Error adding expense:', error);
      setMessage({ type: 'error', text: 'Failed to add expense. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const subCategories = categories.find(c => c.name === form.category)?.subCategories || [];

 
  return (
    <div style={cardStyle}>
      <h2 style={{ fontWeight: 700, color: '#222', marginBottom: 18, textAlign: 'center', fontSize: 28 }}>Add Expense</h2>
      {message.text && (
        <div style={{
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required style={inputStyle} />
        </div>
        <hr style={sectionDivider} />
        <div>
          <label style={labelStyle}>Category</label>
          <select name="category" value={form.category} onChange={handleChange} required style={inputStyle}>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input type="text" placeholder="New category" value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ ...inputStyle, width: '70%' }} />
            <button type="button" onClick={handleAddCategory} style={{ ...addBtnStyle, width: '30%' }} disabled={!newCategory.trim()}>+ Add</button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Subcategory</label>
          <select name="subCategory" value={form.subCategory} onChange={handleChange} style={inputStyle}>
            <option value="">Select Subcategory</option>
            {subCategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input type="text" placeholder="New subcategory" value={newSubCategory} onChange={e => setNewSubCategory(e.target.value)} style={{ ...inputStyle, width: '70%' }} />
            <button type="button" onClick={handleAddSubCategory} style={{ ...addBtnStyle, width: '30%' }} disabled={!newSubCategory.trim() || !form.category}>+ Add</button>
          </div>
        </div>
        <hr style={sectionDivider} />
        <div>
          <label style={labelStyle}>Description</label>
          <input type="text" name="description" value={form.description} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Amount ({rupee})</label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} required min="0" step="0.01" style={inputStyle} />
        </div>
        <div style={{ marginTop: 6, marginBottom: 6 }}>
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', marginBottom: 0, fontWeight: 400 }}>
            <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} style={{ marginRight: 8 }} />
            Recurring Expense
          </label>
        </div>
        {form.isRecurring && (
          <div style={{ marginBottom: 6 }}>
            <label style={labelStyle}>Recurring Frequency:</label>
            <select
              name="recurrenceType"
              value={form.recurrenceType}
              onChange={handleChange}
              style={{ ...inputStyle, marginBottom: 0 }}
            >
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="SEMI_ANNUALLY">Semi-Annually</option>
            </select>
            <div style={{ marginTop: 10, marginBottom: 0 }}>
              <label style={{ marginRight: 16 }}>
                <input
                  type="radio"
                  name="recurrenceEndType"
                  value="endDate"
                  checked={form.recurrenceEndType === 'endDate'}
                  onChange={handleChange}
                  style={{ marginRight: 6 }}
                />
                End Date
              </label>
              <label>
                <input
                  type="radio"
                  name="recurrenceEndType"
                  value="occurrences"
                  checked={form.recurrenceEndType === 'occurrences'}
                  onChange={handleChange}
                  style={{ marginRight: 6 }}
                />
                Number of Occurrences
              </label>
            </div>
            {form.recurrenceEndType === 'endDate' && (
              <div style={{ marginTop: 8 }}>
                <input
                  type="date"
                  name="recurrenceEndDate"
                  value={form.recurrenceEndDate}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            )}
            {form.recurrenceEndType === 'occurrences' && (
              <div style={{ marginTop: 8 }}>
                <input
                  type="number"
                  name="numOccurrences"
                  min="1"
                  value={form.numOccurrences}
                  onChange={handleChange}
                  placeholder="Number of Occurrences"
                  style={inputStyle}
                />
              </div>
            )}
          </div>
        )}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default DailyEntryPage;
