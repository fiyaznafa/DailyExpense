# Expense Tracker

A full-stack Expense Tracker application with a React frontend and Spring Boot backend. Track your daily expenses, visualize spending trends, and manage categories with ease.

## Features
- Add, edit, and delete expenses
- Categorize expenses with categories and subcategories
- Dashboard with recent expenses, summary charts, and trends
- Export dashboard summary and charts as PDF
- Advanced filtering and search
- Responsive, user-friendly UI

## Tech Stack
- **Frontend:** React, Chart.js, html2canvas, jsPDF
- **Backend:** Spring Boot, Java, H2 Database

## Getting Started

### Prerequisites
- Node.js & npm
- Java 11 or higher
- Maven

### Backend Setup
1. Navigate to the project root:
   ```sh
   cd "Expense Tracker"
   ```
2. Build and run the Spring Boot backend:
   ```sh
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the React app:
   ```sh
   npm start
   ```
   The frontend will start on `http://localhost:3000`.

## Usage
- Access the dashboard to view recent expenses and charts.
- Add daily expenses and assign categories/subcategories.
- Edit or delete expenses as needed.
- Download a PDF report of your dashboard summary and charts.

## Development
- Backend code: `src/main/java/com/example/expensetracker/`
- Frontend code: `frontend/src/`
- Database: H2 (in-memory by default)

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License. 
