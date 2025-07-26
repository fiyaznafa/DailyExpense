package com.example.expensetracker.controller;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ExpenseController {
    private final ExpenseService expenseService;

    @Autowired
    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    // Endpoint to add a new expense
    @PostMapping("/expenses")
    public Expense addExpense(@RequestBody Expense expense) {
        return expenseService.addExpense(expense);
    }

    // Endpoint to get expenses by month
    // Example: /api/expenses?year=2024&month=6
    @GetMapping("/expenses")
    public List<Expense> getExpensesByMonth(@RequestParam int year, @RequestParam int month) {
        return expenseService.getExpensesByMonth(year, month);
    }

    // Endpoint to get all expenses (for dashboard)
    @GetMapping("/expenses/all")
    public List<Expense> getAllExpenses() {
        return expenseService.getAllExpenses();
    }

    // Endpoint to get category summary for a month
    // Example: /api/expenses/category-summary?year=2024&month=6
    @GetMapping("/expenses/category-summary")
    public Map<String, Double> getCategorySummary(@RequestParam int year, @RequestParam int month) {
        return expenseService.getCategorySummaryByMonth(year, month);
    }

    // Endpoint to get category summary for the year till now
    // Example: /api/expenses/year-to-date?year=2024
    @GetMapping("/expenses/year-to-date")
    public Map<String, Double> getCategorySummaryForYearToDate(@RequestParam int year) {
        return expenseService.getCategorySummaryForYearToDate(year);
    }

    // Monthly total summary
    // Example: /api/expenses/monthly-total?year=2024&month=6
    @GetMapping("/expenses/monthly-total")
    public Map<String, Double> getMonthlyTotal(@RequestParam int year, @RequestParam int month) {
        double total = expenseService.getMonthlyTotal(year, month);
        return Map.of("total", total);
    }

    // Get all recurring expense templates
    @GetMapping("/expenses/recurring")
    public List<Expense> getRecurringTemplates() {
        return expenseService.getRecurringTemplates();
    }

    // Add a new recurring expense template
    @PostMapping("/expenses/recurring")
    public Expense addRecurringTemplate(@RequestBody Expense expense) {
        expense.setIsRecurring(true);
        return expenseService.addExpense(expense);
    }

    // Update a recurring expense template
    @PutMapping("/expenses/recurring/{id}")
    public Expense updateRecurringTemplate(@PathVariable Long id, @RequestBody Expense updated) {
        updated.setId(id);
        updated.setIsRecurring(true);
        return expenseService.addExpense(updated);
    }

    // Delete a recurring expense template
    @DeleteMapping("/expenses/recurring/{id}")
    public void deleteRecurringTemplate(@PathVariable Long id) {
        expenseService.deleteExpense(id);
    }

    // Delete a single expense by ID
    @DeleteMapping("/expenses/{id}")
    public void deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
    }

    // Update a single expense by ID
    @PutMapping("/expenses/{id}")
    public Expense updateExpense(@PathVariable Long id, @RequestBody Expense updated) {
        updated.setId(id);
        return expenseService.addExpense(updated);
    }

    // Endpoint to get monthly trend for a year
    // Example: /api/expenses/monthly-trend?year=2024
    @GetMapping("/expenses/monthly-trend")
    public List<Double> getMonthlyTrend(@RequestParam int year) {
        return expenseService.getMonthlyTrend(year);
    }

    // Bulk import endpoint
    @PostMapping("/expenses/import")
    public ExpenseService.ImportSummary importExpenses(@RequestBody List<Expense> expenses) {
        return expenseService.addExpensesWithSummary(expenses);
    }
} 