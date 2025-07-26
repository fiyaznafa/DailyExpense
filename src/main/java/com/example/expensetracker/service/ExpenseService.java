package com.example.expensetracker.service;

import com.example.expensetracker.model.Expense;
import com.example.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    // Add a new expense, return null if duplicate
    public Expense addExpense(Expense expense) {
        Expense duplicate = expenseRepository.findDuplicate(
            expense.getDate(),
            expense.getCategory(),
            expense.getSubCategory(),
            expense.getAmount(),
            expense.getDescription()
        );
        if (duplicate != null) {
            return null; // Duplicate found
        }
        return expenseRepository.save(expense);
    }

    // Add multiple expenses, return summary
    public ImportSummary addExpensesWithSummary(List<Expense> expenses) {
        int imported = 0;
        int skipped = 0;
        int failed = 0;
        for (Expense expense : expenses) {
            try {
                Expense duplicate = expenseRepository.findDuplicate(
                    expense.getDate(),
                    expense.getCategory(),
                    expense.getSubCategory(),
                    expense.getAmount(),
                    expense.getDescription()
                );
                if (duplicate != null) {
                    skipped++;
                    continue;
                }
                expenseRepository.save(expense);
                imported++;
            } catch (Exception e) {
                failed++;
            }
        }
        return new ImportSummary(imported, skipped, failed);
    }

    public static class ImportSummary {
        public int imported;
        public int skipped;
        public int failed;
        public ImportSummary(int imported, int skipped, int failed) {
            this.imported = imported;
            this.skipped = skipped;
            this.failed = failed;
        }
    }

    // Get all expenses
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    // Get all expenses for a given month (YYYY-MM)
    public List<Expense> getExpensesByMonth(int year, int month) {
        return expenseRepository.findByYearAndMonth(year, month);
    }

    // Get category-wise summary for a given month (returns Map<Category, TotalAmount>)
    public Map<String, Double> getCategorySummaryByMonth(int year, int month) {
        List<Expense> expenses = expenseRepository.findByYearAndMonth(year, month);
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)
                ));
    }

    // Get category-wise summary for the current year up to now (returns Map<Category, TotalAmount>)
    public Map<String, Double> getCategorySummaryForYearToDate(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<Expense> expenses = expenseRepository.findByDateBetween(start, end);
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)
                ));
    }

    // Get all recurring expense templates
    public List<Expense> getRecurringTemplates() {
        return expenseRepository.findByIsRecurringTrue();
    }

    // (Optional) Generate recurring expenses (to be called by a scheduled job)
    @Scheduled(cron = "0 0 2 * * *") // Runs daily at 2 AM
    public void generateRecurringExpenses() {
        List<Expense> templates = getRecurringTemplates();
        LocalDate today = LocalDate.now();
        for (Expense template : templates) {
            if (template.getRecurrenceEndDate() != null && today.isAfter(template.getRecurrenceEndDate())) {
                continue;
            }
            LocalDate lastDate = template.getDate();
            List<Expense> generated = expenseRepository.findByParentExpenseId(template.getId());
            if (!generated.isEmpty()) {
                lastDate = generated.stream().map(Expense::getDate).max(LocalDate::compareTo).orElse(lastDate);
            }
            int interval = template.getRecurrenceInterval() != null ? template.getRecurrenceInterval() : 1;
            LocalDate nextDue = lastDate;
            switch (template.getRecurrenceType()) {
                case "MONTHLY":
                    nextDue = lastDate.plusMonths(interval);
                    break;
                case "YEARLY":
                    nextDue = lastDate.plusYears(interval);
                    break;
                case "CUSTOM":
                    nextDue = lastDate.plusMonths(interval); // Default to months for custom
                    break;
                default:
                    nextDue = lastDate.plusMonths(interval);
            }
            while (!nextDue.isAfter(today)) {
                Expense newExpense = new Expense();
                newExpense.setDate(nextDue);
                newExpense.setCategory(template.getCategory());
                newExpense.setSubCategory(template.getSubCategory());
                newExpense.setDescription(template.getDescription());
                newExpense.setAmount(template.getAmount());
                newExpense.setIsRecurring(false); // Generated instance is not a template
                newExpense.setRecurrenceType(null);
                newExpense.setRecurrenceInterval(null);
                newExpense.setRecurrenceEndDate(null);
                newExpense.setParentExpenseId(template.getId());
                expenseRepository.save(newExpense);
                nextDue = nextDue.plusMonths(interval); // Only supports monthly/yearly/custom (months)
            }
        }
    }

    // Delete an expense by id
    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    // Get total expenses for a given month
    public double getMonthlyTotal(int year, int month) {
        List<Expense> expenses = expenseRepository.findByYearAndMonth(year, month);
        return expenses.stream().mapToDouble(Expense::getAmount).sum();
    }

    // Get monthly trend for a year (total spent per month)
    public List<Double> getMonthlyTrend(int year) {
        List<Double> monthlyTotals = new java.util.ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            double total = getMonthlyTotal(year, month);
            monthlyTotals.add(total);
        }
        return monthlyTotals;
    }
} 