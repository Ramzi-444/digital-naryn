from django import forms
from django.db import models
from django.forms import ClearableFileInput
from django.utils.translation import gettext_lazy as _

class MultipleFileInput(ClearableFileInput):
    allow_multiple_selected = True

class MultipleFileField(forms.FileField):
    widget = MultipleFileInput

    def clean(self, data, initial=None):
        single_file_clean = super().clean
        if isinstance(data, (list, tuple)):
            result = [single_file_clean(d, initial) for d in data]
        else:
            result = single_file_clean(data, initial)
        return result

class Category(models.Model):
    name = models.CharField(max_length=100)

    icon = models.ImageField(upload_to='category_icons/', blank=True, null=True)  # New field for icon


    def __str__(self):
        return self.name

class Item(models.Model):
    category = models.ForeignKey(Category, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    working_hours = models.JSONField(default=dict)
    whatsapp_number = models.CharField(max_length=20, blank=True)
    phone_numbers = models.CharField(max_length=255, blank=True)
    avatar_photo = models.ImageField(upload_to='avatars/', blank=True, null=True)
    photos = models.JSONField(default=list, blank=True) # store multiple paths as json

    def __str__(self):
      return self.name

class ItemForm(forms.ModelForm):
    photo_uploads = MultipleFileField(required=False)

    class Meta:
        model = Item
        fields = '__all__'
        exclude = ('photos',) # exclude photos field, because we will handle it in save method.

    def save(self, commit=True):
        instance = super().save(commit=False)
        if commit:
            instance.save()
        if self.cleaned_data['photo_uploads']:
            photos = []
            for file in self.cleaned_data['photo_uploads']:
                filename = f"photos/{instance.pk}-{file.name}" # generate unique filename
                with open(f"media/{filename}", 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
                photos.append(filename)
            instance.photos = photos
            instance.save()
        return instance