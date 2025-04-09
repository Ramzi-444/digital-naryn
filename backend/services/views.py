from django.shortcuts import render
from rest_framework import viewsets
from .models import Category, Item
from .serializers import CategorySerializer, ItemSerializer, CategorySimpleSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return CategorySimpleSerializer
        return CategorySerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer