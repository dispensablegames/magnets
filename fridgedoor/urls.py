from django.urls import path
from . import views

urlpatterns = [
	path('words/', views.wordListJSON, name='wordListJSON'),
	path('', views.index, name='index')
]