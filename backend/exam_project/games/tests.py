from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from exam_project.games.models import GameModel
from exam_project.common.models import BoughtGame

UserModel = get_user_model()


class GameTests(TestCase):
    def setUp(self):
        self.user = UserModel.objects.create_user(email='owner@example.com', password='StrongPass123!', money=100)
        self.client.login(username='owner@example.com', password='StrongPass123!')

    def test_create_game(self):
        response = self.client.post(reverse('game create'), {
            'title': 'Test Game',
            'category': 'ACTION',
            'price': '20.00',
            'summary': 'Fun game',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(GameModel.objects.filter(title='Test Game').exists())

    def test_edit_game(self):
        game = GameModel.objects.create(title='Old Title', category='ACTION', price='20.00', user=self.user)
        response = self.client.post(reverse('game edit', args=[game.pk]), {
            'title': 'New Title',
            'category': 'ACTION',
            'price': '25.00',
            'summary': 'Updated',
        })
        game.refresh_from_db()
        self.assertEqual(game.title, 'New Title')

    def test_delete_game(self):
        game = GameModel.objects.create(title='Delete Me', category='ACTION', price='20.00', user=self.user)
        response = self.client.post(reverse('game delete', args=[game.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(GameModel.objects.filter(pk=game.pk).exists())

    def test_successful_purchase(self):
        seller = UserModel.objects.create_user(email='seller@example.com', password='StrongPass123!', money=0)
        game = GameModel.objects.create(title='Buyable', category='ACTION', price='30.00', user=seller)
        self.client.login(username='owner@example.com', password='StrongPass123!')
        response = self.client.post(reverse('game buy', args=[game.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertTrue(BoughtGame.objects.filter(user=self.user, game=game).exists())
        self.user.refresh_from_db()
        seller.refresh_from_db()
        self.assertEqual(self.user.money, 70)
        self.assertEqual(seller.money, 30)

    def test_duplicate_purchase_blocked(self):
        game = GameModel.objects.create(title='Unique Game', category='ACTION', price='20.00', user=self.user)
        BoughtGame.objects.create(user=self.user, game=game)
        response = self.client.post(reverse('game buy', args=[game.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(BoughtGame.objects.filter(user=self.user, game=game).count(), 1)

    def test_insufficient_funds(self):
        poor_user = UserModel.objects.create_user(email='poor@example.com', password='StrongPass123!', money=5)
        game = GameModel.objects.create(title='Expensive', category='ACTION', price='50.00', user=self.user)
        self.client.login(username='poor@example.com', password='StrongPass123!')
        response = self.client.post(reverse('game buy', args=[game.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(BoughtGame.objects.filter(user=poor_user, game=game).exists())
