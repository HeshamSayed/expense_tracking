#!/usr/bin/env python3
"""
Automated API Testing Script
Tests all major endpoints without needing mobile app
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@demo.com",
    "username": "testuser",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "default_currency": "USD"
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name, passed, message=""):
    icon = f"{Colors.GREEN}✓{Colors.END}" if passed else f"{Colors.RED}✗{Colors.END}"
    print(f"{icon} {name}")
    if message:
        print(f"  → {message}")

def test_server_running():
    """Test if server is accessible"""
    try:
        response = requests.get(f"{BASE_URL}/api/docs/", timeout=5)
        print_test("Server is running", response.status_code == 200)
        return True
    except requests.exceptions.ConnectionError:
        print_test("Server is running", False, "Cannot connect to server. Is it running?")
        return False

def test_register():
    """Test user registration"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/register/",
            json=TEST_USER,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 201:
            data = response.json()
            print_test("User registration", True, f"User ID: {data['user']['id']}")
            return True
        elif response.status_code == 400:
            print_test("User registration", True, "User already exists (expected)")
            return True
        else:
            print_test("User registration", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("User registration", False, str(e))
        return False

def test_login():
    """Test user login and return token"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login/",
            json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            },
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            data = response.json()
            token = data.get('access')
            print_test("User login", True, f"Token: {token[:30]}...")
            return token
        else:
            print_test("User login", False, f"Status: {response.status_code}")
            return None
    except Exception as e:
        print_test("User login", False, str(e))
        return None

def test_get_profile(token):
    """Test getting user profile"""
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/auth/profile/",
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code == 200:
            data = response.json()
            print_test("Get user profile", True, f"User: {data['first_name']} {data['last_name']}")
            return True
        else:
            print_test("Get user profile", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Get user profile", False, str(e))
        return False

def test_get_currencies():
    """Test getting currencies"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/expenses/currencies/")

        if response.status_code == 200:
            data = response.json()
            count = data.get('count', len(data))
            print_test("Get currencies", True, f"Found {count} currencies")
            return True
        else:
            print_test("Get currencies", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Get currencies", False, str(e))
        return False

def test_get_categories(token):
    """Test getting categories"""
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/categories/categories/",
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code == 200:
            data = response.json()
            count = data.get('count', len(data.get('results', [])))
            print_test("Get categories", True, f"Found {count} categories")
            if count >= 23:
                print(f"  → {Colors.GREEN}Default categories loaded!{Colors.END}")
            return True
        else:
            print_test("Get categories", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Get categories", False, str(e))
        return False

def test_create_expense(token):
    """Test creating an expense"""
    try:
        expense_data = {
            "amount": "25.99",
            "currency": 1,
            "category": 1,
            "description": "Test expense from automated script",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "payment_method": "cash"
        }

        response = requests.post(
            f"{BASE_URL}/api/v1/expenses/expenses/",
            json=expense_data,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )

        if response.status_code == 201:
            data = response.json()
            print_test("Create expense", True, f"Expense ID: {data['id']}, Amount: ${data['amount']}")
            return data['id']
        else:
            print_test("Create expense", False, f"Status: {response.status_code}")
            return None
    except Exception as e:
        print_test("Create expense", False, str(e))
        return None

def test_create_budget(token):
    """Test creating a budget"""
    try:
        budget_data = {
            "name": "Test Monthly Budget",
            "amount": "500.00",
            "currency": 1,
            "period": "monthly",
            "start_date": "2025-11-01",
            "end_date": "2025-11-30",
            "category": 1
        }

        response = requests.post(
            f"{BASE_URL}/api/v1/budgets/budgets/",
            json=budget_data,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )

        if response.status_code == 201:
            data = response.json()
            print_test("Create budget", True, f"Budget: {data['name']}, Amount: ${data['amount']}")
            return True
        else:
            print_test("Create budget", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Create budget", False, str(e))
        return False

def test_dashboard(token):
    """Test dashboard analytics"""
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/analytics/dashboard/?period=month",
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code == 200:
            data = response.json()
            total_expenses = data['expenses']['total']
            total_income = data['income']['total']
            net_balance = data['net_balance']
            print_test("Dashboard analytics", True,
                      f"Expenses: ${total_expenses}, Income: ${total_income}, Balance: ${net_balance}")
            return True
        else:
            print_test("Dashboard analytics", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Dashboard analytics", False, str(e))
        return False

def main():
    print(f"\n{Colors.BLUE}{'='*60}")
    print("🧪 Expense Tracker API Test Suite")
    print(f"{'='*60}{Colors.END}\n")

    print(f"{Colors.YELLOW}Testing Backend API...{Colors.END}\n")

    # Run tests
    if not test_server_running():
        print(f"\n{Colors.RED}❌ Server not running. Start with: python manage.py runserver{Colors.END}\n")
        return

    print()
    test_register()

    token = test_login()
    if not token:
        print(f"\n{Colors.RED}❌ Cannot proceed without valid token{Colors.END}\n")
        return

    print()
    test_get_profile(token)
    test_get_currencies()
    test_get_categories(token)

    print()
    expense_id = test_create_expense(token)
    test_create_budget(token)

    print()
    test_dashboard(token)

    print(f"\n{Colors.BLUE}{'='*60}")
    print("✅ All Tests Complete!")
    print(f"{'='*60}{Colors.END}\n")

    print("Next steps:")
    print("  • Visit http://localhost:8000/admin/ to see data in admin panel")
    print("  • Visit http://localhost:8000/api/docs/ to test more endpoints")
    print("  • Run the mobile app to test the full UI\n")

if __name__ == "__main__":
    main()
