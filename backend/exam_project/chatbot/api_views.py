from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from exam_project.games.models import GameModel
from .services import ask_llm, clear_memory


class ChatbotAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        message = request.data.get("message", "")

        # Fetch game data for the LLM
        games = GameModel.objects.all().values(
            "title", "summary", "price", "category"
        )

        reply = ask_llm(user=user, message=message, game_data=list(games))

        return Response({"reply": reply})


# ---------------------------------------
# CLEAR MEMORY ENDPOINT (moved here)
# ---------------------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def clear_chat_memory(request):
    clear_memory(request.user)
    return Response({"status": "cleared"})
