from django.shortcuts import render
from fridgedoor.models import Door, Word, WordList, Magnet
from django.http import JsonResponse
import json
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

def door(request, door):
	if request.method == "POST":
		data = json.loads(request.body)
		print(data)

		myDoor = Door.objects.get(name=door)
		Magnet.objects.filter(door=myDoor).delete()

		myMagnets = data['magnets']

		for i in myMagnets:
			magnet = myMagnets[i]
			text = magnet['text']
			xpos = magnet['xpos']
			ypos = magnet['ypos']
			zpos = magnet['zpos']
			
			doneMagnet = Magnet(text=text, xpos=xpos, ypos=ypos, zpos=zpos, door=myDoor)
			doneMagnet.save()

		return JsonResponse({})

	else:
		return render(request, 'door.html', {})

def magnetsJSON(request, door):
	magnetList = Magnet.objects.filter(door=door)

	returnList = []
	for magnet in magnetList:
		newmagnet = {
			'text': magnet.text,
			'xpos': magnet.xpos,
			'ypos': magnet.ypos,
			'zpos': magnet.zpos,
			'pk': magnet.pk,
		}
		returnList.append(newmagnet)

	return JsonResponse({"magnets": returnList})
