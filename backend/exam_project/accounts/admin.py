from django.contrib import admin
from django.contrib.auth import admin as auth_admin, get_user_model
from exam_project.accounts.forms import ProfileCreateForm, ProfileEditForm

UserModel = get_user_model()


@admin.register(UserModel)
class UserAdmin(auth_admin.UserAdmin):
    form = ProfileEditForm
    add_form = ProfileCreateForm

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'profile_picture', 'money')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

    list_display = ('id', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'profile_picture')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
