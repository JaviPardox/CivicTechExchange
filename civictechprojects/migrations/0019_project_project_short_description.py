# -*- coding: utf-8 -*-
# Generated by Django 1.10.7 on 2018-11-15 16:22
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('civictechprojects', '0018_auto_20181109_1844'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='project_short_description',
            field=models.CharField(blank=True, max_length=140),
        ),
    ]
