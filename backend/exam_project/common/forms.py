from django import forms
from exam_project.common.models import BoughtGame, GameComment


class BoughtGameForm(forms.ModelForm):
    class Meta:
        model = BoughtGame
        fields = '__all__'


class GameCommentForm(forms.ModelForm):
    class Meta:
        model = GameComment
        fields = ['text']
        widgets = {
            'text': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Leave your comment...'}),
        }
