from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect, get_object_or_404
from django.views import generic as views
from django.views.decorators.http import require_POST
from datetime import datetime

from exam_project.common.models import BoughtGame, GameComment
from exam_project.common.forms import GameCommentForm
from exam_project.games.forms import GameAddForm, GameEditForm
from exam_project.games.models import GameModel
from exam_project.games.pagination_sort import Pagination, SortingMixin


class IndexView(Pagination, SortingMixin, views.ListView):
    model = GameModel
    template_name = 'home-page.html'
    context_object_name = 'games'

    def get_queryset(self):
        queryset = GameModel.objects.all()
        query = self.request.GET.get('q')

        if query:
            queryset = queryset.filter(title__icontains=query)

        return self.apply_sorting(queryset)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        qs = self.get_queryset()

        if self.request.user.is_authenticated:
            context['user'] = self.request.user
            context['profile_money'] = self.request.user.money

        context.update({
            'search_query': self.request.GET.get('q', ''),
            'per_page': self.get_paginate_by(qs),
            'per_page_options': self.PER_PAGE_OPTIONS,
            'sort': self.request.GET.get('sort', 'newest'),
        })

        page_obj = context['page_obj']
        if page_obj.paginator.count == 0:
            context['no_games_yet'] = True
        elif context['search_query'] and not page_obj.object_list:
            context['no_match'] = True

        return context


class BoughtGamesView(Pagination, SortingMixin, LoginRequiredMixin, views.ListView):
    model = BoughtGame
    template_name = 'bought_games.html'
    context_object_name = 'bought_games'

    def get_queryset(self):
        qs = BoughtGame.objects.filter(user=self.request.user)
        return self.apply_sorting(qs, prefix="game__")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        qs = self.get_queryset()

        total_spent = sum(bg.game.price for bg in qs)

        context.update({
            'per_page': self.get_paginate_by(qs),
            'per_page_options': self.PER_PAGE_OPTIONS,
            'sort': self.request.GET.get('sort', 'newest'),
            'hide_buttons': True,
            'total_spent': total_spent,
        })

        return context


class MyGamesView(Pagination, SortingMixin, LoginRequiredMixin, views.ListView):
    model = GameModel
    template_name = 'my-games.html'
    context_object_name = 'games'

    def get_queryset(self):
        qs = GameModel.objects.filter(user=self.request.user)
        query = self.request.GET.get('q')

        if query:
            qs = qs.filter(title__icontains=query)

        return self.apply_sorting(qs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        qs = self.get_queryset()

        context.update({
            'search_query': self.request.GET.get('q', ''),
            'per_page': self.get_paginate_by(qs),
            'per_page_options': self.PER_PAGE_OPTIONS,
            'sort': self.request.GET.get('sort', 'newest'),
            'hide_button_buy': True,
        })

        page_obj = context['page_obj']
        if page_obj.paginator.count == 0:
            context['no_games_yet'] = True
        elif context['search_query'] and not page_obj.object_list:
            context['no_match'] = True

        return context


@login_required
def game_add(request):
    if request.method == 'GET':
        form = GameAddForm()
    else:
        form = GameAddForm(request.POST, request.FILES)
        if form.is_valid():
            game = form.save(commit=False)
            game.user = request.user
            game.save()
            return redirect('index')

    return render(request, 'game/create-game.html', {'form': form})


@login_required
def game_details(request, pk):
    game = (
        GameModel.objects
        .select_related("user")
        .prefetch_related("gamecomment_set__user")
        .get(pk=pk)
    )

    user = request.user
    is_owner = user == game.user
    is_bought = BoughtGame.objects.filter(user=user, game=game).exists()

    # All comments already prefetched
    comments = list(game.gamecomment_set.all())
    existing_comment = next((c for c in comments if c.user_id == user.id), None)

    # Handle comment submission
    if request.method == 'POST' and not existing_comment:
        form = GameCommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = user
            comment.game = game
            comment.save()
            return redirect('game details', pk=pk)
    else:
        form = None if existing_comment else GameCommentForm()

    context = {
        'game': game,
        'is_owner': is_owner,
        'is_bought': is_bought,
        'form': form,
        'existing_comment': existing_comment,
        'comments': comments,
    }
    return render(request, 'game/details-game.html', context)


@login_required
def game_buy(request, pk):
    game = get_object_or_404(GameModel, pk=pk)
    user = request.user

    if game.user == user:
        messages.error(request, "You cannot buy your own game.")
        return redirect("index")

    purchase, created = BoughtGame.objects.get_or_create(user=user, game=game)
    if not created:
        messages.warning(request, "You already own this game.")
        return redirect("index")

    if user.money < game.price:
        messages.error(request, "Not enough money to buy this game.")
        return redirect("index")

    user.money -= game.price
    user.save()

    messages.success(request, f"You bought {game.title} successfully!")
    return redirect("bought games")


@login_required
def game_edit(request, pk):
    game = get_object_or_404(GameModel, pk=pk)

    if request.method == 'GET':
        form = GameEditForm(instance=game)
    else:
        form = GameEditForm(request.POST, request.FILES, instance=game)
        if form.is_valid():
            form.save()
            return redirect('index')

    return render(request, 'game/edit-game.html', {'form': form, 'game': game})


@require_POST
def game_delete(request, pk):
    game = get_object_or_404(GameModel, pk=pk)

    if game.user != request.user:
        messages.error(request, "You do not have permission to delete this game.")
        return redirect('index')

    game.delete()
    messages.success(request, "Game deleted successfully.")
    return redirect('index')


@login_required
def seed_games(request):
    import random
    from decimal import Decimal

    categories = [c[0] for c in GameModel._meta.get_field("category").choices]
    now = datetime.now().strftime("%Y%m%d-%H%M%S")

    GameModel.objects.bulk_create([
        GameModel(
            title=f"Game {i} - {now}",
            category=random.choice(categories),
            price=Decimal(random.randrange(100, 150)),
            summary="Auto-generated",
            user=request.user,
        )
        for i in range(1, 20)
    ])

    return render(request, 'game/seed_games.html')
