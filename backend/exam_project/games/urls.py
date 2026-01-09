from django.urls import path, include
from exam_project.games.views import game_add, game_details, game_edit, game_delete, \
    game_buy, IndexView, BoughtGamesView, seed_games, MyGamesView, load_games

urlpatterns = (
    path('', IndexView.as_view(), name='index'),
    path('seed_games', seed_games, name='seed games'),
    path("load_games/", load_games, name="load games"),

    path('dashboard/', BoughtGamesView.as_view(), name='bought games'),
    path('my-games/<int:pk>/', MyGamesView.as_view(), name='my games'),
    path('game/', include([
        path('create/', game_add, name='game create'),
        path('details/<int:pk>/', game_details, name='game details'),
        path('edit/<int:pk>/', game_edit, name='game edit'),
        path('delete/<int:pk>/', game_delete, name='game delete'),
        path('buy/<int:pk>/', game_buy, name='game buy')
    ]))
)
