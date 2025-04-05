# Generated by Django 5.2 on 2025-04-05 17:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0002_itemphoto_remove_item_phone_number_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Photo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='photos/')),
            ],
        ),
        migrations.DeleteModel(
            name='ItemPhoto',
        ),
        migrations.AlterField(
            model_name='item',
            name='photos',
            field=models.ManyToManyField(blank=True, related_name='items', to='services.photo'),
        ),
    ]
