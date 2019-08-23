from django.db import models
from django.urls import reverse

class Word(models.Model):
	
	text = models.CharField(max_length=50, primary_key=True)

	wordList = models.ManyToManyField('WordList')

	class Meta:
		ordering = ['text']

	def __str__(self):
		return self.text

class WordList(models.Model):
	
	name = models.CharField(max_length=50, primary_key=True)
	
	def __str__(self):
		return self.name

class Magnet(models.Model):
	
	text =  models.CharField(max_length=50)

	xpos = models.FloatField()
	ypos = models.FloatField()

	zpos = models.SmallIntegerField()

	door = models.ForeignKey('Door', on_delete=models.CASCADE)
	
	class Meta:
		ordering = ['zpos']

	def __str__(self):
		return self.text

class Door(models.Model):
	
	name = models.CharField(max_length=50, primary_key=True)

	def get_absolute_url(self):
		return reverse("door", args=[str(self.name)])

	def __str__(self):
		return self.name

