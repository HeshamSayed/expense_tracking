#!/bin/bash
# Quick setup script for demo

echo "🚀 Setting up Expense Tracker Backend..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and set your database credentials!"
    echo "   Minimum required: DB_PASSWORD"
    echo ""
    read -p "Press enter to continue after editing .env..."
fi

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo ""
echo "👤 Creating superuser account..."
echo "   (You'll be prompted for email, username, and password)"
python manage.py createsuperuser

# Load default data
echo ""
echo "💰 Loading default currencies..."
python manage.py setup_currencies

echo ""
echo "📁 Loading default categories..."
python manage.py setup_categories

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now start the server with:"
echo "   python manage.py runserver"
echo ""
echo "📚 Then visit:"
echo "   Admin Panel: http://localhost:8000/admin/"
echo "   API Docs:    http://localhost:8000/api/docs/"
echo ""
