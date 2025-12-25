from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect
from exam_project.common.models import GameComment


@login_required
def delete_comment(request, pk):
    comment = get_object_or_404(GameComment, pk=pk, user=request.user)
    game_id = comment.game.pk
    comment.delete()
    return redirect('game details', pk=game_id)
