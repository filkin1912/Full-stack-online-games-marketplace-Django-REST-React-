from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth import get_user_model

UserModel = get_user_model()


class ProfileCreateForm(UserCreationForm):
    class Meta:
        model = UserModel
        fields = ("email", "password1", "password2")
        widgets = {
            "email": forms.EmailInput(attrs={"placeholder": "Email", "class": "form-control"}),
            "password1": forms.PasswordInput(attrs={"placeholder": "Password", "class": "form-control"}),
            "password2": forms.PasswordInput(attrs={"placeholder": "Repeat password", "class": "form-control"}),
        }


class ProfileEditForm(forms.ModelForm):
    profile_picture = forms.ImageField(
        required=False,
        label="Profile picture",
        widget=forms.FileInput(attrs={
            "class": "custom-file-input",
            "accept": "image/*"
        })
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["first_name"].widget.attrs["placeholder"] = "Enter your first name"
        self.fields["last_name"].widget.attrs["placeholder"] = "Enter your last name"
        self.fields["email"].widget.attrs["placeholder"] = "Enter your email"
        self.fields["money"].widget.attrs["placeholder"] = "Enter amount"

    class Meta:
        model = UserModel
        fields = ("first_name", "last_name", "email", "money", "profile_picture")
