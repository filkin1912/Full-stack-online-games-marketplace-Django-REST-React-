from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from exam_project.games.models import GameModel
from exam_project.common.models import GameComment

UserModel = get_user_model()


class CommentTests(TestCase):
    def setUp(self):
        self.user = UserModel.objects.create_user(email='commenter@example.com', password='StrongPass123!')
        self.client.login(username='commenter@example.com', password='StrongPass123!')
        self.game = GameModel.objects.create(title='Commentable', category='ACTION', price='20.00', user=self.user)

    def test_add_comment(self):
        response = self.client.post(reverse('game details', args=[self.game.pk]), {
            'text': 'Nice game!',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(GameComment.objects.filter(user=self.user, game=self.game).exists())

    def test_prevent_multiple_comments(self):
        GameComment.objects.create(user=self.user, game=self.game, text='First comment')
        response = self.client.post(reverse('game details', args=[self.game.pk]), {
            'text': 'Second comment',
        })
        self.assertEqual(response.status_code, 200)  # form not submitted
        self.assertEqual(GameComment.objects.filter(user=self.user, game=self.game).count(), 1)

    def test_delete_own_comment(self):
        comment = GameComment.objects.create(user=self.user, game=self.game, text='To be deleted')
        response = self.client.post(reverse('delete comment', args=[comment.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(GameComment.objects.filter(pk=comment.pk).exists())
