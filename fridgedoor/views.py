from django.shortcuts import render, redirect
from fridgedoor.models import Door, Word, WordList, Magnet
from django.http import JsonResponse, Http404
import json
from .utils import *

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
	myName = randomString(50)
	while Door.objects.filter(name=myName).exists():
		myName = randomString(50)
	myDoor = Door(name=myName)
	myDoor.save()

	

	return redirect(myDoor.get_absolute_url())

def door(request, door):

	try:
		myDoor = Door.objects.get(name=door)
	except Door.DoesNotExist:
		raise Http404()

	if request.method == "POST":
		data = json.loads(request.body)

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
