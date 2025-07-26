package com.example.expensetracker.repository;

import com.example.expensetracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    // Custom query method to find expenses between two dates
    List<Expense> findByDateBetween(LocalDate start, LocalDate end);

    // Find expenses by category
    List<Expense> findByCategory(String category);

    // Find expenses by subCategory
    List<Expense> findBySubCategory(String subCategory);

    // Find expenses by category and date between (for monthly/category reports)
    List<Expense> findByCategoryAndDateBetween(String category, LocalDate start, LocalDate end);

    // Find expenses by month (using date's year and month)
    // Note: This requires a custom @Query if you want to filter by month only
    // Example for filtering by month and year:
    @Query("SELECT e FROM Expense e WHERE YEAR(e.date) = :year AND MONTH(e.date) = :month")
    List<Expense> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // Find all recurring expense templates
    List<Expense> findByIsRecurringTrue();

    // Find all expenses generated from a recurring template
    List<Expense> findByParentExpenseId(Long parentExpenseId);

    // Find a duplicate expense by all unique fields
    @Query("SELECT e FROM Expense e WHERE e.date = :date AND e.category = :category AND e.subCategory = :subCategory AND e.amount = :amount AND e.description = :description")
    Expense findDuplicate(@Param("date") LocalDate date, @Param("category") String category, @Param("subCategory") String subCategory, @Param("amount") double amount, @Param("description") String description);
} 