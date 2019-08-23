from django import forms
from fridgedoor.models import WordList

class MassAddWordForm(forms.Form):
	
	word_list = forms.CharField(widget=forms.Textarea)
	wordlist_list = forms.ModelChoiceField(WordList.objects.all())
	username = forms.CharField()
	password = forms.CharField(widget=forms.PasswordInput)