from django import forms
from exam_project.games.models import GameModel


class GameBaseForm(forms.ModelForm):
    class Meta:
        model = GameModel
        fields = '__all__'


# Frontend form (exclude user, because we set it in the view)
class GameAddForm(GameBaseForm):
    class Meta:
        model = GameModel
        exclude = ('user',)
        labels = {
            'title': 'Title',
            'game_picture': 'Picture',
        }
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Write title'}),
            'game_picture': forms.ClearableFileInput(attrs={'class': 'form-control file-input'}),
        }


# Admin form (include user, so staff can assign manually)
class GameAdminForm(GameBaseForm):
    class Meta:
        model = GameModel
        fields = '__all__'


class GameDetailsForm(GameBaseForm):
    pass


class GameEditForm(GameBaseForm):
    class Meta:
        model = GameModel
        fields = '__all__'
        exclude = ('user',)


class GameDeleteForm(GameBaseForm):
    class Meta:
        model = GameModel
        exclude = ('category', 'user',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__set_disabled_fields()

    def save(self, commit=True):
        if commit:
            self.instance.delete()
        return self.instance

    def __set_disabled_fields(self):
        for _, field in self.fields.items():
            field.widget.attrs['readonly'] = 'readonly'


class GameBuyForm(GameBaseForm):
    class Meta:
        model = GameModel
        fields = '__all__'
        exclude = ('user',)
