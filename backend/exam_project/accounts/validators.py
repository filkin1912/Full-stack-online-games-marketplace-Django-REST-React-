from django.contrib.auth.password_validation import (
    UserAttributeSimilarityValidator,
    MinimumLengthValidator,
    CommonPasswordValidator,
    NumericPasswordValidator,
)
from django.core.exceptions import ValidationError


# 1) Custom Similarity Validator
class CustomUserAttributeSimilarityValidator(UserAttributeSimilarityValidator):
    message = "Your password is too similar to your email address."

    def validate(self, password, user=None):
        if not user:
            return

        for attribute_name in self.user_attributes:
            value = getattr(user, attribute_name, None)
            if not value or not isinstance(value, str):
                continue

            if value.lower() in password.lower():
                raise ValidationError(self.message, code="password_too_similar")


# 2) Custom Minimum Length Validator
class CustomMinimumLengthValidator(MinimumLengthValidator):
    message = "Password must be at least %(min_length)d characters long."

    def validate(self, password, user=None):
        if len(password) < self.min_length:
            raise ValidationError(
                self.message % {"min_length": self.min_length},
                code="password_too_short",
            )


# 3) Custom Common Password Validator
class CustomCommonPasswordValidator(CommonPasswordValidator):
    message = "This password is too common. Please choose something more secure."

    def validate(self, password, user=None):
        if password.lower().strip() in self.passwords:
            raise ValidationError(self.message, code="password_too_common")


# 4) Custom Numeric Password Validator
class CustomNumericPasswordValidator(NumericPasswordValidator):
    message = "Your password cannot consist only of numbers."

    def validate(self, password, user=None):
        if password.isdigit():
            raise ValidationError(self.message, code="password_entirely_numeric")
