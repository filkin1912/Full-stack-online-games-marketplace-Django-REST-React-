from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

UserModel = get_user_model()


class AccountsTests(TestCase):
    def test_user_can_register(self):
        response = self.client.post(reverse('profile create'), {
            'email': 'newuser@example.com',
            'password1': 'StrongPass123!',
            'password2': 'StrongPass123!',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(UserModel.objects.filter(email='newuser@example.com').exists())

    def test_user_can_login(self):
        UserModel.objects.create_user(email='login@example.com', password='StrongPass123!')
        response = self.client.post(reverse('profile login'), {
            'username': 'login@example.com',
            'password': 'StrongPass123!',
        })
        self.assertEqual(response.status_code, 302)
        self.assertIn('_auth_user_id', self.client.session)
