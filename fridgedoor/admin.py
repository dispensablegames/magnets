from django.contrib import admin

from fridgedoor.models import Magnet, Door, WordList, Word

admin.site.register(Magnet)
admin.site.register(Door)
admin.site.register(WordList)
admin.site.register(Word)