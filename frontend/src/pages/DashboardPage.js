import React, { useState, useEffect, useMemo } from 'react';
import { 
  getExpenses, 
  getMonthlyTotal, 
  getCategorySummary, 
  getYearToDateSummary, 
  deleteExpense,
  getCategories,
  getMonthlyTrend
} from '../api';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { useNavigate, useLocation } from 'react-router-dom';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

const rupee = '\u20B9';

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: 24,
  marginBottom: 24,
  minWidth: 0,
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
};

const DashboardPage = () => {
  console.log('DashboardPage: Today is', new Date().toLocaleDateString('en-CA'));
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // State for data
  const [expenses, setExpenses] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [categorySummary, setCategorySummary] = useState({});
  const [yearToDateSummary, setYearToDateSummary] = useState({});
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [monthlyTrend, setMonthlyTrend] = useState([]);

  const [filteredResults, setFilteredResults] = useState([]);
  const [resultsOpen, setResultsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // On mount, restore filters from query params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const monthParam = params.get('month');
    const yearParam = params.get('year');
    if (monthParam && yearParam) {
      setCurrentMonth(parseInt(monthParam));
      setCurrentYear(parseInt(yearParam));
    } else {
      const now = new Date();
      setCurrentMonth(now.getMonth() + 1);
      setCurrentYear(now.getFullYear());
    }
  }, [location.search]);

  // Fetch data when month or year changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [expensesData, monthlyTotalData, categorySummaryData, yearToDateData] = await Promise.all([
          getExpenses(currentMonth, currentYear),
          getMonthlyTotal(currentMonth, currentYear),
          getCategorySummary(currentMonth, currentYear),
          getYearToDateSummary(currentYear)
        ]);

        setExpenses(expensesData);
        setMonthlyTotal(monthlyTotalData.total || 0);
        setCategorySummary(categorySummaryData);
        setYearToDateSummary(yearToDateData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, currentYear]);

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

  // Delete expense handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    setLoading(true);
    try {
      await deleteExpense(id);
      // Refresh data
      const [expensesData, monthlyTotalData, categorySummaryData, yearToDateData] = await Promise.all([
        getExpenses(currentMonth, currentYear),
        getMonthlyTotal(currentMonth, currentYear),
        getCategorySummary(currentMonth, currentYear),
        getYearToDateSummary(currentYear)
      ]);
      setExpenses(expensesData);
      setMonthlyTotal(monthlyTotalData.total || 0);
      setCategorySummary(categorySummaryData);
      setYearToDateSummary(yearToDateData);
      alert('Expense deleted successfully.');
    } catch (err) {
      alert('Failed to delete expense.');
    } finally {
      setLoading(false);
    }
  };

  // Inline edit handlers
  const handleEdit = (expense) => {
    setEditId(expense.id);
    setEditForm({ ...expense });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  const handleEditSave = async () => {
    // Call API to update expense (implement in api.js if not present)
    setLoading(true);
    try {
      await import('../api').then(api => api.updateExpense(editForm));
      setEditId(null);
      // Refresh data
      const [expensesData, monthlyTotalData, categorySummaryData, yearToDateData] = await Promise.all([
        getExpenses(currentMonth, currentYear),
        getMonthlyTotal(currentMonth, currentYear),
        getCategorySummary(currentMonth, currentYear),
        getYearToDateSummary(currentYear)
      ]);
      setExpenses(expensesData);
      setMonthlyTotal(monthlyTotalData.total || 0);
      setCategorySummary(categorySummaryData);
      setYearToDateSummary(yearToDateData);
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

  // Filtering logic
  const filteredExpenses = expenses.filter(exp => {
    let match = true;
    if (filterCategory && exp.category !== filterCategory) match = false;
    if (filterStartDate && new Date(exp.date) < new Date(filterStartDate)) match = false;
    if (filterEndDate && new Date(exp.date) > new Date(filterEndDate)) match = false;
    return match;
  });

  // Handler for card/chart clicks
  const handleCardClick = (type, params = {}) => {
    // Always pass current filters in query
    const searchParams = new URLSearchParams({
      ...params,
      month: currentMonth,
      year: currentYear
    }).toString();
    navigate(`/details/${type}${searchParams ? `?${searchParams}` : ''}`);
  };

  // Handler for navigating back to dashboard with filters
  const goToDashboard = () => {
    const searchParams = new URLSearchParams({
      month: currentMonth,
      year: currentYear
    }).toString();
    navigate(`/?${searchParams}`);
  };

  // Fetch monthly trend when year changes
  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const trend = await getMonthlyTrend(currentYear);
        setMonthlyTrend(trend);
      } catch (e) {
        setMonthlyTrend([]);
      }
    };
    fetchTrend();
  }, [currentYear]);

  const handleRefresh = () => {
    const filtered = expenses.filter(exp => {
      let match = true;
      if (filterCategory && exp.category !== filterCategory) match = false;
      if (filterStartDate && new Date(exp.date) < new Date(filterStartDate)) match = false;
      if (filterEndDate && new Date(exp.date) > new Date(filterEndDate)) match = false;
      return match;
    });
    setFilteredResults(filtered);
    setResultsOpen(true);
  };

  // Chart data calculations - must be before any conditional returns
  const pieData = useMemo(() => {
    if (selectedCategory) {
      // Show subcategories for selected category
      const subcategoryMap = {};
      expenses
        .filter(exp => exp.category === selectedCategory)
        .forEach(expense => {
          if (!subcategoryMap[expense.subCategory]) {
            subcategoryMap[expense.subCategory] = 0;
          }
          subcategoryMap[expense.subCategory] += expense.amount;
        });

      const labels = Object.keys(subcategoryMap);
      const data = Object.values(subcategoryMap);
      const colors = [
        '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab',
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
      ];

      return {
        labels,
        datasets: [{
          data,
          backgroundColor: data.map((_, i) => colors[i % colors.length]),
          borderWidth: 1
        }]
      };
    } else {
      // Show all categories
      return {
        labels: Object.keys(categorySummary),
        datasets: [{
          data: Object.values(categorySummary),
          backgroundColor: [
            '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
          ],
          borderWidth: 1
        }]
      };
    }
  }, [expenses, categorySummary, selectedCategory]);

  // Bar chart data for monthly summary (category-wise with subcategories, one dataset per category)
  const barData = useMemo(() => {
    if (selectedCategory) {
      // Show subcategories for selected category
      const subcategoryMap = {};
      expenses
        .filter(exp => exp.category === selectedCategory)
        .forEach(expense => {
          if (!subcategoryMap[expense.subCategory]) {
            subcategoryMap[expense.subCategory] = 0;
          }
          subcategoryMap[expense.subCategory] += expense.amount;
        });
      const labels = Object.keys(subcategoryMap);
      const colors = [
        '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab',
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
      ];
      return {
        labels,
        datasets: [
          {
            label: selectedCategory,
            data: Object.values(subcategoryMap),
            backgroundColor: colors.slice(0, labels.length),
            borderRadius: 6
          }
        ]
      };
    } else {
      // Show all categories, one dataset per category
      const categories = Object.keys(categorySummary);
      const labels = categories;
      const colors = [
        '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
      ];
      return {
        labels,
        datasets: categories.map((cat, i) => ({
          label: cat,
          data: labels.map(l => (l === cat ? categorySummary[cat] : 0)),
          backgroundColor: colors[i % colors.length],
          borderRadius: 6
        }))
      };
    }
  }, [expenses, categorySummary, selectedCategory]);

  // Helper for custom legend
  const allCategories = Object.keys(categorySummary);
  const legendColors = [
    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
  ];

  // Calculate Top Category by Spend
  const categoryTotals = {};
  const categoryCounts = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    categoryCounts[exp.category] = (categoryCounts[exp.category] || 0) + 1;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const topCategoryAmount = categoryTotals[topCategory] || 0;
  const mostFrequentCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const mostFrequentCount = categoryCounts[mostFrequentCategory] || 0;

  // Calculate % Change from Last Month
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const [prevMonthExpenses, setPrevMonthExpenses] = useState([]);
  useEffect(() => {
    const fetchPrevMonth = async () => {
      try {
        const data = await getExpenses(prevMonth, prevYear);
        setPrevMonthExpenses(data);
      } catch {}
    };
    fetchPrevMonth();
  }, [currentMonth, currentYear]);
  const prevTotal = prevMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const thisTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const percentChange = prevTotal === 0 ? 0 : ((thisTotal - prevTotal) / prevTotal) * 100;

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1 style={{ fontWeight: 700, letterSpacing: 1 }}>Expense Dashboard</h1>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h1 style={{ fontWeight: 700, letterSpacing: 1 }}>Expense Dashboard</h1>
        <div style={{ color: 'red', padding: 10, border: '1px solid red', borderRadius: 5 }}>
          {error}
        </div>
      </div>
    );
  }

  const yearToDateTotal = Object.values(yearToDateSummary).reduce((sum, val) => sum + val, 0);

  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Monthly Trend chart data
  const trendBarColor = '#1976d2';
  const trendLineColor = '#ffc107';
  const monthlyTrendData = {
    labels: monthLabels.map(m => `${m} ${currentYear}`),
    datasets: [
      {
        type: 'bar',
        label: 'Total Spent',
        data: monthlyTrend,
        backgroundColor: trendBarColor,
        borderRadius: 6,
        yAxisID: 'y',
        order: 2,
        barPercentage: 0.7,
        categoryPercentage: 0.6
      },
      {
        type: 'line',
        label: 'Trend',
        data: monthlyTrend,
        borderColor: trendLineColor,
        backgroundColor: trendLineColor,
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: trendLineColor,
        yAxisID: 'y',
        order: 1,
        borderDash: []
      }
    ]
  };
  const monthlyTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 15 },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Monthly Trend',
        font: { size: 22, weight: 'bold' }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Month', font: { size: 16 } },
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 30,
          font: { size: 13 }
        }
      },
      y: {
        title: { display: true, text: 'Total Spent (₹)', font: { size: 16 } },
        beginAtZero: true,
        grid: { color: '#eaeaea' },
        ticks: {
          callback: value => `₹${value.toLocaleString('en-IN')}`,
          font: { size: 13 }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      point: {
        radius: 5,
        backgroundColor: trendLineColor
      }
    }
  };

  return (
    <div style={{ padding: 32, background: '#f4f6fa', minHeight: '100vh', fontFamily: 'Roboto, Inter, Arial, sans-serif' }}>
      <h1 style={{ fontWeight: 700, letterSpacing: 1, color: '#222', marginBottom: 32 }}>Expense Dashboard</h1>
      {/* Month/Year Selector */}
      <div style={{ ...cardStyle, display: 'flex', gap: 24, alignItems: 'center', maxWidth: 500, margin: '0 auto 32px auto', cursor: 'default', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <label style={{ fontWeight: 500 }}>Month:
          <select value={currentMonth} onChange={e => setCurrentMonth(parseInt(e.target.value))} style={{ marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontWeight: 500 }}>Year:
          <input
            type="number"
            value={currentYear}
            onChange={e => setCurrentYear(parseInt(e.target.value))}
            min="2020"
            max="2030"
            style={{ marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc', width: 90 }}
          />
        </label>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{ ...cardStyle, textAlign: 'center', cursor: 'pointer' }} onClick={() => handleCardClick('year', { year: currentYear })}>
          <h3 style={{ margin: '0 0 8px 0', color: '#007bff', fontSize: 18 }}>Year-to-Date</h3>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#333' }}>{rupee} {yearToDateTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center', cursor: 'pointer' }} onClick={() => handleCardClick('month', { year: currentYear, month: currentMonth })}>
          <h3 style={{ margin: '0 0 8px 0', color: '#007bff', fontSize: 18 }}>This Month</h3>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#333' }}>{rupee} {monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#007bff', fontSize: 18 }}>Insights</h3>
          <div style={{ fontSize: 16, margin: '8px 0' }}>
            <b>Top Category:</b> {topCategory} <br />
            <span style={{ color: '#333' }}>{rupee} {topCategoryAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ fontSize: 16, margin: '8px 0' }}>
            <b>Most Frequent:</b> {mostFrequentCategory} <br />
            <span style={{ color: '#333' }}>{mostFrequentCount} transactions</span>
          </div>
          <div style={{ fontSize: 16, margin: '8px 0' }}>
            <b>Change from Last Month:</b> <br />
            <span style={{ color: percentChange > 0 ? 'green' : percentChange < 0 ? 'red' : '#333' }}>
              {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{ ...cardStyle }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: 18 }}>
            Category Distribution
            {selectedCategory && (
              <span style={{ fontSize: 14, color: '#007bff', marginLeft: 12 }}>
                - {selectedCategory}
                <button onClick={() => setSelectedCategory(null)} style={{ marginLeft: 8, padding: '2px 8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Back to All</button>
              </span>
            )}
          </h3>
          <div style={{ height: 300 }}>
            <Pie data={pieData} options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              onClick: (e, elements, chart) => {
                if (elements && elements.length > 0) {
                  const idx = elements[0].index;
                  const label = chart.data.labels[idx];
                  if (selectedCategory) {
                    // Viewing subcategories: navigate to detail page for subcategory
                    handleCardClick('category', {
                      year: currentYear,
                      month: currentMonth,
                      category: selectedCategory,
                      subcategory: label
                    });
                  } else {
                    // Viewing categories: navigate to detail page for category
                    handleCardClick('category', {
                      year: currentYear,
                      month: currentMonth,
                      category: label
                    });
                  }
                }
              }
            }} />
          </div>
          {/* Custom Legend for Pie Chart */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '12px 0' }}>
            {!selectedCategory && allCategories.map((cat, i) => (
              <button
                key={cat}
                style={{
                  background: selectedCategory === cat ? '#007bff' : legendColors[i % legendColors.length],
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div style={{ ...cardStyle }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: 18 }}>
            Monthly Summary
            {selectedCategory && (
              <span style={{ fontSize: 14, color: '#007bff', marginLeft: 12 }}>
                - {selectedCategory}
                <button onClick={() => setSelectedCategory(null)} style={{ marginLeft: 8, padding: '2px 8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Back to All</button>
              </span>
            )}
          </h3>
          <div style={{ height: 300 }}>
            <Bar data={barData} options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              layout: { padding: { left: 10, right: 10, top: 10, bottom: 10 } },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.raw;
                    return `${label}: ${rupee} ${value.toLocaleDateString('en-IN', { minimumFractionDigits: 2 })}`;
                  }
                }
              },
              scales: {
                x: {
                  offset: true,
                  ticks: {
                    maxRotation: 45,
                    minRotation: 30,
                    font: { size: selectedCategory ? 10 : 12 }
                  }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: value => `₹${value.toLocaleString('en-IN')}`,
                    font: { size: 11 }
                  }
                }
              },
              onClick: (e, elements, chart) => {
                if (elements && elements.length > 0) {
                  const idx = elements[0].index;
                  const label = chart.data.labels[idx];
                  if (selectedCategory) {
                    // Viewing subcategories: navigate to detail page for subcategory
                    handleCardClick('category', {
                      year: currentYear,
                      month: currentMonth,
                      category: selectedCategory,
                      subcategory: label
                    });
                  } else {
                    // Viewing categories: navigate to detail page for category
                    handleCardClick('category', {
                      year: currentYear,
                      month: currentMonth,
                      category: label
                    });
                  }
                }
              }
            }} />
          </div>
          {/* Custom Legend for Bar Chart */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '12px 0' }}>
            {!selectedCategory && allCategories.map((cat, i) => (
              <button
                key={cat}
                style={{
                  background: selectedCategory === cat ? '#007bff' : legendColors[i % legendColors.length],
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: 18 }}>Monthly Trend</h3>
        <div style={{ height: 300 }}>
          <Bar data={monthlyTrendData} options={monthlyTrendOptions} />
        </div>
      </div>

      {/* Recent Expenses */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: 18 }}>Recent Expenses</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
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
              {filteredExpenses.map(expense => (
                editId === expense.id ? (
                  <tr key={expense.id} style={{ borderBottom: '1px solid #f0f0f0', background: '#f3f8ff' }}>
                    <td style={{ padding: 10 }}><input type="date" name="date" value={editForm.date} onChange={handleEditChange} /></td>
                    <td style={{ padding: 10 }}>
                      <select name="category" value={editForm.category} onChange={handleEditChange}>
                        {categories.map(cat => (
                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: 10 }}>
                      <select name="subCategory" value={editForm.subCategory} onChange={handleEditChange}>
                        {(categories.find(c => c.name === editForm.category)?.subCategories || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </td>
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
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Category:
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
              <option value="">All</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </label>
          <label style={{ fontWeight: 500 }}>Start Date:
            <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} style={{ marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
          </label>
          <label style={{ fontWeight: 500 }}>End Date:
            <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} style={{ marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
          </label>
          <button onClick={handleRefresh} style={{ marginLeft: 12, padding: '8px 18px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>Refresh</button>
        </div>
        
        {/* Results Section */}
        {filteredResults.length > 0 && (
          <div style={{ borderTop: '1px solid #eaeaea', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 12 }} onClick={() => setResultsOpen(o => !o)}>
              <span style={{ fontWeight: 600, fontSize: 16, color: '#007bff', marginRight: 12 }}>
                {resultsOpen ? '▼' : '►'} Results ({filteredResults.length})
              </span>
              <span style={{ color: '#888', fontSize: 13 }}>(Click to {resultsOpen ? 'collapse' : 'expand'})</span>
            </div>
            {resultsOpen && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eaeaea', background: '#f8fafc' }}>
                      <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Category</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Subcategory</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Description</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Amount ({rupee})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map(expense => (
                      <tr key={expense.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: 8 }}>{expense.date}</td>
                        <td style={{ padding: 8 }}>{expense.category}</td>
                        <td style={{ padding: 8 }}>{expense.subCategory}</td>
                        <td style={{ padding: 8 }}>{expense.description}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{rupee} {expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
