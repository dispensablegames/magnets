from django.urls import path
from . import views

urlpatterns = [
	path('words/', views.wordListJSON, name='wordListJSON'),
	path('<slug:door>/magnets', views.magnetsJSON, name='magnetsJSON'),
	path('', views.index, name='index')
]