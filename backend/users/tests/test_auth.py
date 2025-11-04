"""
Tests for user authentication endpoints.
"""
import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistration:
    """Tests for user registration."""

    def test_register_success(self):
        """Test successful user registration."""
        client = APIClient()
        url = reverse('users:register')
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
            'first_name': 'Test',
            'last_name': 'User',
        }

        response = client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert User.objects.filter(email='test@example.com').exists()

    def test_register_duplicate_email(self):
        """Test registration with existing email."""
        User.objects.create_user(email='existing@example.com', password='password')

        client = APIClient()
        url = reverse('users:register')
        data = {
            'email': 'existing@example.com',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
        }

        response = client.post(url, data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_password_mismatch(self):
        """Test registration with mismatched passwords."""
        client = APIClient()
        url = reverse('users:register')
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'password_confirm': 'Different123!',
        }

        response = client.post(url, data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_weak_password(self):
        """Test registration with weak password."""
        client = APIClient()
        url = reverse('users:register')
        data = {
            'email': 'test@example.com',
            'password': '12345',
            'password_confirm': '12345',
        }

        response = client.post(url, data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLogin:
    """Tests for user login."""

    def test_login_success(self):
        """Test successful login."""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!'
        )

        client = APIClient()
        url = reverse('users:token_obtain_pair')
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!',
        }

        response = client.post(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        User.objects.create_user(
            email='test@example.com',
            password='TestPass123!'
        )

        client = APIClient()
        url = reverse('users:token_obtain_pair')
        data = {
            'email': 'test@example.com',
            'password': 'WrongPassword',
        }

        response = client.post(url, data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self):
        """Test login with non-existent user."""
        client = APIClient()
        url = reverse('users:token_obtain_pair')
        data = {
            'email': 'nonexistent@example.com',
            'password': 'TestPass123!',
        }

        response = client.post(url, data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenRefresh:
    """Tests for token refresh."""

    def test_refresh_token_success(self):
        """Test successful token refresh."""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!'
        )

        client = APIClient()

        # Get initial tokens
        url = reverse('users:token_obtain_pair')
        response = client.post(url, {
            'email': 'test@example.com',
            'password': 'TestPass123!',
        })
        refresh_token = response.data['refresh']

        # Refresh token
        refresh_url = reverse('users:token_refresh')
        response = client.post(refresh_url, {'refresh': refresh_token})

        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_refresh_token_invalid(self):
        """Test token refresh with invalid token."""
        client = APIClient()
        url = reverse('users:token_refresh')
        response = client.post(url, {'refresh': 'invalid_token'})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserProfile:
    """Tests for user profile endpoints."""

    def test_get_profile_authenticated(self):
        """Test getting profile when authenticated."""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User',
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = reverse('users:profile')
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'test@example.com'
        assert response.data['first_name'] == 'Test'
        assert response.data['is_pro'] is False

    def test_get_profile_unauthenticated(self):
        """Test getting profile when not authenticated."""
        client = APIClient()
        url = reverse('users:profile')
        response = client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile(self):
        """Test updating profile."""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = reverse('users:profile')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'timezone': 'America/New_York',
        }

        response = client.patch(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == 'Updated'
        assert response.data['last_name'] == 'Name'

        user.refresh_from_db()
        assert user.first_name == 'Updated'


@pytest.mark.django_db
class TestPasswordChange:
    """Tests for password change."""

    def test_change_password_success(self):
        """Test successful password change."""
        user = User.objects.create_user(
            email='test@example.com',
            password='OldPass123!',
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = reverse('users:change_password')
        data = {
            'current_password': 'OldPass123!',
            'new_password': 'NewPass123!',
            'new_password_confirm': 'NewPass123!',
        }

        response = client.post(url, data)

        assert response.status_code == status.HTTP_200_OK

        # Verify new password works
        user.refresh_from_db()
        assert user.check_password('NewPass123!')

    def test_change_password_wrong_current(self):
        """Test password change with wrong current password."""
        user = User.objects.create_user(
            email='test@example.com',
            password='OldPass123!',
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = reverse('users:change_password')
        data = {
            'current_password': 'WrongPass123!',
            'new_password': 'NewPass123!',
            'new_password_confirm': 'NewPass123!',
        }

        response = client.post(url, data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_mismatch(self):
        """Test password change with mismatched new passwords."""
        user = User.objects.create_user(
            email='test@example.com',
            password='OldPass123!',
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = reverse('users:change_password')
        data = {
            'current_password': 'OldPass123!',
            'new_password': 'NewPass123!',
            'new_password_confirm': 'Different123!',
        }

        response = client.post(url, data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestAccountDeletion:
    """Tests for account deletion."""

    def test_delete_account_success(self):
        """Test successful account deletion."""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = reverse('users:delete_account')
        response = client.delete(url, {'password': 'TestPass123!'})

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not User.objects.filter(email='test@example.com').exists()

    def test_delete_account_wrong_password(self):
        """Test account deletion with wrong password."""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = reverse('users:delete_account')
        response = client.delete(url, {'password': 'WrongPassword'})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert User.objects.filter(email='test@example.com').exists()
