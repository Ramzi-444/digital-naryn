from django.contrib import admin
from .models import Category, Item, ItemForm

class ItemAdmin(admin.ModelAdmin):
    form = ItemForm

admin.site.register(Category)
admin.site.register(Item, ItemAdmin)