#!/bin/bash

# MoneyGuard Local Development Setup Script
# This script sets up and runs the MoneyGuard application locally

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MoneyGuard Local Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed${NC}"
    echo "Please install docker-compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if .env file exists
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}No .env file found. Creating from .env.example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
    echo -e "${YELLOW}Please edit backend/.env and add your API keys before continuing${NC}"
    echo ""
    read -p "Press Enter to continue..."
fi

# Build Docker images
echo -e "${BLUE}Building Docker images...${NC}"
docker-compose build

# Start services
echo -e "${BLUE}Starting services...${NC}"
docker-compose up -d db redis

# Wait for database to be ready
echo -e "${BLUE}Waiting for database to be ready...${NC}"
sleep 5

# Run migrations
echo -e "${BLUE}Running database migrations...${NC}"
docker-compose run --rm backend python manage.py migrate

# Create default categories
echo -e "${BLUE}Creating default categories...${NC}"
docker-compose run --rm backend python manage.py shell << EOF
from finance.models import Category

# Default expense categories
expense_categories = [
    {'name': 'Food & Dining', 'icon': '🍽️', 'color': '#FF6B6B'},
    {'name': 'Transportation', 'icon': '🚗', 'color': '#4ECDC4'},
    {'name': 'Shopping', 'icon': '🛍️', 'color': '#FFE66D'},
    {'name': 'Entertainment', 'icon': '🎬', 'color': '#95E1D3'},
    {'name': 'Bills & Utilities', 'icon': '💡', 'color': '#F38181'},
    {'name': 'Healthcare', 'icon': '⚕️', 'color': '#AA96DA'},
    {'name': 'Education', 'icon': '📚', 'color': '#FCBAD3'},
    {'name': 'Other', 'icon': '📦', 'color': '#A8DADC'},
]

# Default income categories
income_categories = [
    {'name': 'Salary', 'icon': '💰', 'color': '#2ECC71'},
    {'name': 'Freelance', 'icon': '💼', 'color': '#3498DB'},
    {'name': 'Investment', 'icon': '📈', 'color': '#9B59B6'},
    {'name': 'Other Income', 'icon': '💵', 'color': '#1ABC9C'},
]

for cat in expense_categories:
    Category.objects.get_or_create(
        name=cat['name'],
        type='expense',
        user=None,  # Global category
        defaults={'icon': cat['icon'], 'color': cat['color']}
    )

for cat in income_categories:
    Category.objects.get_or_create(
        name=cat['name'],
        type='income',
        user=None,  # Global category
        defaults={'icon': cat['icon'], 'color': cat['color']}
    )

print("✓ Default categories created")
EOF

# Collect static files
echo -e "${BLUE}Collecting static files...${NC}"
docker-compose run --rm backend python manage.py collectstatic --noinput

# Create superuser
echo -e "${BLUE}Creating superuser...${NC}"
echo -e "${YELLOW}Please enter superuser details:${NC}"
docker-compose run --rm backend python manage.py createsuperuser || echo -e "${YELLOW}Superuser creation skipped${NC}"

# Start all services
echo -e "${BLUE}Starting all services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Services running:${NC}"
echo -e "  • Backend API:      ${BLUE}http://localhost:8000${NC}"
echo -e "  • API Docs:         ${BLUE}http://localhost:8000/api/docs/${NC}"
echo -e "  • Django Admin:     ${BLUE}http://localhost:8000/admin/${NC}"
echo -e "  • PostgreSQL:       ${BLUE}localhost:5432${NC}"
echo -e "  • Redis:            ${BLUE}localhost:6379${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  • View logs:        ${BLUE}docker-compose logs -f${NC}"
echo -e "  • Stop services:    ${BLUE}docker-compose down${NC}"
echo -e "  • Restart:          ${BLUE}docker-compose restart${NC}"
echo -e "  • Shell access:     ${BLUE}docker-compose exec backend python manage.py shell${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
