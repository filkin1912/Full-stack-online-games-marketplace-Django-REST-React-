from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import AppUserSerializer, AppUserUpdateSerializer

User = get_user_model()


class MeRetrieveUpdateApiView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return AppUserUpdateSerializer
        return AppUserSerializer


class UsersListApiView(generics.ListAPIView):
    serializer_class = AppUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()


class UserDetailApiView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppUserUpdateSerializer
    parser_classes = [MultiPartParser, FormParser]  # Accept file uploads


class SignUpApiView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")

        # Missing fields
        if not email or not password:
            return Response(
                {"email": ["Email is required."] if not email else None,
                 "password": ["Password is required."] if not password else None},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Password validation
        try:
            validate_password(password)
        except ValidationError as e:
            return Response(
                {"password": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Duplicate email check (IMPORTANT FIX)
        if User.objects.filter(email=email).exists():
            return Response(
                {"email": ["A user with that email already exists."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response(
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.full_name,
                "access": str(access),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class DeleteUserApiView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        user = User.objects.filter(id=pk).first()

        if not user:
            return Response({"detail": "User not found."}, status=404)
        if request.user.id != user.id:
            return Response({"detail": "Not allowed."}, status=403)

        user.delete()
        return Response(status=204)
