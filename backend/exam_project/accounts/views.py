from django.contrib import messages
from django.contrib.auth import views as auth_views, get_user_model, login
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse_lazy
from django.views import generic as views
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_POST

from exam_project.accounts.forms import ProfileCreateForm

UserModel = get_user_model()


class SignUpView(views.CreateView):
    form_class = ProfileCreateForm
    template_name = "profile/create-profile.html"
    success_url = reverse_lazy("index")

    def form_valid(self, form):
        response = super().form_valid(form)
        login(self.request, self.object)
        return response

    def form_invalid(self, form):
        print(form.errors)
        return super().form_invalid(form)


class SignInView(auth_views.LoginView):
    template_name = 'profile/login_profile.html'


class SignOutView(auth_views.LogoutView):
    next_page = reverse_lazy('index')


class ProfileDetailsView(views.DetailView):
    template_name = 'profile/details-profile.html'
    model = UserModel

    def dispatch(self, request, *args, **kwargs):
        obj = self.get_object()

        if request.user != obj:
            messages.error(request, "You do not have permission to view this profile.")
            return redirect('index')

        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['games_count'] = self.object.gamemodel_set.count()
        return context


@method_decorator(require_POST, name='dispatch')
class ProfileDeleteView(views.DeleteView):
    model = UserModel
    success_url = reverse_lazy('index')

    def dispatch(self, request, *args, **kwargs):
        obj = self.get_object()

        if obj != request.user:
            messages.error(request, "You do not have permission to delete this profile.")
            return redirect('index')

        return super().dispatch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        messages.success(request, "Your profile has been deleted.")
        return super().delete(request, *args, **kwargs)


class ProfileEditView(views.UpdateView):
    template_name = 'profile/edit-profile.html'
    model = UserModel
    fields = ('first_name', 'last_name', 'email', 'money', 'profile_picture')

    def get_success_url(self):
        return reverse_lazy('profile details', kwargs={
            'pk': self.request.user.pk,
        })
