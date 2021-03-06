from django.urls import path
from . import views

urlpatterns = [
	path('words', views.wordListJSON, name='wordListJSON'),
	path('<slug:door>', views.door, name='door'),
	path('<slug:door>/magnets', views.magnetsJSON, name='magnetsJSON'),
	path('massaddnewwords/', views.massAddNewWords, name="massAddNewWords"),
	path('', views.index, name='index')
]
