# Generated by Django 5.2 on 2025-04-05 16:11

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('address', models.CharField(max_length=255)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('working_hours', models.CharField(blank=True, max_length=100)),
                ('phone_number', models.CharField(blank=True, max_length=20)),
                ('whatsapp_number', models.CharField(blank=True, max_length=20)),
                ('avatar_photo', models.ImageField(blank=True, null=True, upload_to='avatars/')),
                ('photos', models.ImageField(blank=True, null=True, upload_to='photos/')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='services.category')),
            ],
        ),
    ]
