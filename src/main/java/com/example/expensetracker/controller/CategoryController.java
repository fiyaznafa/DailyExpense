package com.example.expensetracker.controller;

import com.example.expensetracker.model.Category;
import com.example.expensetracker.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {
    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping
    public Category addCategory(@RequestBody Map<String, String> body) {
        return categoryService.addCategory(body.get("name"));
    }

    @PostMapping("/add-subcategory")
    public Category addSubCategory(@RequestBody Map<String, String> body) {
        return categoryService.addSubCategory(body.get("categoryName"), body.get("subCategory"));
    }

    @DeleteMapping("/{name}")
    public void deleteCategoryByName(@PathVariable String name) {
        categoryService.deleteCategoryByName(name);
    }
} 