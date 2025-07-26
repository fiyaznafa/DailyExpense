package com.example.expensetracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Data
@Table(
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"date", "category", "sub_category", "amount", "description"}
    )
)
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String category;
    private String description;
    private double amount;
    @Column(name = "sub_category")
    private String subCategory;
    private Boolean isRecurring = false; // Is this a recurring expense?
    private String recurrenceType; // e.g., MONTHLY, YEARLY, CUSTOM
    private Integer recurrenceInterval; // e.g., every 1 month, every 6 months
    private LocalDate recurrenceEndDate; // When should recurrence stop?
    private Long parentExpenseId; // If generated from a recurring template, link to original
} 