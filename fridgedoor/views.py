from django.shortcuts import render
from fridgedoor.models import Door, Word, WordList, Magnet
from django.http import JsonResponse
# Create your views here.

def wordListJSON(request):
	
	wLists = WordList.objects.all()

	returnList = {}


	for wList in wLists:
		wListName = wList.name
		returnList[wListName] = []
		for word in list(Word.objects.filter(wordList=wList)):
			text = word.text
			returnList[wListName].append(text)

	return JsonResponse(returnList)

def index(request):
	num_words = Word.objects.all().count()

	num_wordLists = WordList.objects.all().count()

	num_doors = Door.objects.all().count()

	context = {
		'num_words': num_words,
		'num_wordLists': num_wordLists,
		'num_doors': num_doors
	}

	return render(request, 'index.html', context)