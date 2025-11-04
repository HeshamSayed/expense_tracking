import 'package:dio/dio.dart';

class ApiService {
  final Dio _dio;

  ApiService(this._dio);

  // Auth endpoints
  Future<Response> login(Map<String, dynamic> data) {
    return _dio.post('/api/v1/auth/login/', data: data);
  }

  Future<Response> register(Map<String, dynamic> data) {
    return _dio.post('/api/v1/auth/register/', data: data);
  }

  Future<Response> getProfile() {
    return _dio.get('/api/v1/auth/profile/');
  }

  Future<Response> updateProfile(Map<String, dynamic> data) {
    return _dio.patch('/api/v1/auth/profile/', data: data);
  }

  // Expense endpoints
  Future<Response> getExpenses({Map<String, dynamic>? queryParameters}) {
    return _dio.get('/api/v1/expenses/expenses/', queryParameters: queryParameters);
  }

  Future<Response> createExpense(Map<String, dynamic> data) {
    return _dio.post('/api/v1/expenses/expenses/', data: data);
  }

  Future<Response> updateExpense(int id, Map<String, dynamic> data) {
    return _dio.patch('/api/v1/expenses/expenses/$id/', data: data);
  }

  Future<Response> deleteExpense(int id) {
    return _dio.delete('/api/v1/expenses/expenses/$id/');
  }

  Future<Response> getExpenseSummary({Map<String, dynamic>? queryParameters}) {
    return _dio.get('/api/v1/expenses/expenses/summary/', queryParameters: queryParameters);
  }

  // Income endpoints
  Future<Response> getIncomes({Map<String, dynamic>? queryParameters}) {
    return _dio.get('/api/v1/expenses/incomes/', queryParameters: queryParameters);
  }

  Future<Response> createIncome(Map<String, dynamic> data) {
    return _dio.post('/api/v1/expenses/incomes/', data: data);
  }

  Future<Response> updateIncome(int id, Map<String, dynamic> data) {
    return _dio.patch('/api/v1/expenses/incomes/$id/', data: data);
  }

  Future<Response> deleteIncome(int id) {
    return _dio.delete('/api/v1/expenses/incomes/$id/');
  }

  // Category endpoints
  Future<Response> getCategories({Map<String, dynamic>? queryParameters}) {
    return _dio.get('/api/v1/categories/categories/', queryParameters: queryParameters);
  }

  Future<Response> createCategory(Map<String, dynamic> data) {
    return _dio.post('/api/v1/categories/categories/', data: data);
  }

  // Budget endpoints
  Future<Response> getBudgets({Map<String, dynamic>? queryParameters}) {
    return _dio.get('/api/v1/budgets/budgets/', queryParameters: queryParameters);
  }

  Future<Response> createBudget(Map<String, dynamic> data) {
    return _dio.post('/api/v1/budgets/budgets/', data: data);
  }

  Future<Response> updateBudget(int id, Map<String, dynamic> data) {
    return _dio.patch('/api/v1/budgets/budgets/$id/', data: data);
  }

  Future<Response> deleteBudget(int id) {
    return _dio.delete('/api/v1/budgets/budgets/$id/');
  }

  Future<Response> getBudgetSummary() {
    return _dio.get('/api/v1/budgets/budgets/summary/');
  }

  // Analytics endpoints
  Future<Response> getDashboard({Map<String, dynamic>? queryParameters}) {
    return _dio.get('/api/v1/analytics/dashboard/', queryParameters: queryParameters);
  }

  Future<Response> getSpendingTrends({Map<String, dynamic>? queryParameters}) {
    return _dio.get('/api/v1/analytics/spending-trends/', queryParameters: queryParameters);
  }

  Future<Response> getCategoryAnalysis({Map<String, dynamic>? queryParameters}) {
    return _dio.get('/api/v1/analytics/category-analysis/', queryParameters: queryParameters);
  }

  Future<Response> getIncomeVsExpense({Map<String, dynamic>? queryParameters}) {
    return _dio.get('/api/v1/analytics/income-vs-expense/', queryParameters: queryParameters);
  }
}
