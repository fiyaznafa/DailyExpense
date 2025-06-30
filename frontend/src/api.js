const API_BASE_URL = 'http://localhost:8080/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Try to read the error body for more info
      let errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    // If DELETE or No Content, just return
    if (response.status === 204 || options.method === 'DELETE') return;
    // If response has content, try to parse JSON
    const text = await response.text();
    if (!text) return;
    return JSON.parse(text);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Expense API functions
export const addExpense = async (expenseData) => {
  return apiCall('/expenses', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  });
};

export const getExpenses = async (month, year) => {
  return apiCall(`/expenses?month=${month}&year=${year}`);
};

export const getAllExpenses = async () => {
  return apiCall('/expenses/all');
};

// Summary API functions
export const getMonthlyTotal = async (month, year) => {
  return apiCall(`/expenses/monthly-total?month=${month}&year=${year}`);
};

export const getCategorySummary = async (month, year) => {
  return apiCall(`/expenses/category-summary?month=${month}&year=${year}`);
};

export const getYearToDateSummary = async (year) => {
  return apiCall(`/expenses/year-to-date?year=${year}`);
};

// Recurring expenses
export const addRecurringExpense = async (recurringExpenseData) => {
  return apiCall('/expenses/recurring', {
    method: 'POST',
    body: JSON.stringify(recurringExpenseData),
  });
};

export const getRecurringExpenses = async () => {
  return apiCall('/expenses/recurring');
};

export const deleteExpense = async (id) => {
  return apiCall(`/expenses/${id}`, {
    method: 'DELETE',
  });
};

export const getCategories = async () => {
  return apiCall('/categories');
};

export const addCategory = async (name) => {
  return apiCall('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const addSubCategory = async (categoryName, subCategory) => {
  return apiCall('/categories/add-subcategory', {
    method: 'POST',
    body: JSON.stringify({ categoryName, subCategory }),
  });
};

export const updateExpense = async (expense) => {
  return apiCall(`/expenses/${expense.id}`, {
    method: 'PUT',
    body: JSON.stringify(expense),
  });
};

export const getMonthlyTrend = async (year) => {
  return apiCall(`/expenses/monthly-trend?year=${year}`);
};
