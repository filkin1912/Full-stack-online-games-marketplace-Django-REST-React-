from django.urls import path
from exam_project.games.api_views import (
    GamesListCreateApiView,
    GameRetrieveUpdateDeleteApiView,
    MyGamesListApiView,
    GameBuyApiView,
    BoughtGamesListApiView,
    SeedGamesApiView,
)

urlpatterns = [
    path('', GamesListCreateApiView.as_view(), name='games_list_create'),
    path('mine/', MyGamesListApiView.as_view(), name='games_mine'),
    path('<int:pk>/', GameRetrieveUpdateDeleteApiView.as_view(), name='games_detail'),
    path('<int:pk>/buy/', GameBuyApiView.as_view(), name='games_buy'),
    path('bought-games/', BoughtGamesListApiView.as_view(), name='bought_games_list'),
    path('seed/', SeedGamesApiView.as_view(), name='games_seed'),

]
