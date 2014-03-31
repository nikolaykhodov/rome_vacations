# -*- coding: utf-8 -*-
from django.db import models
from django.conf import settings

class Card(models.Model):

    user_id = models.BigIntegerField(db_index=True)

    image = models.ImageField(upload_to='uploads/', blank=True)
    thumbnail = models.ImageField(upload_to='uploads/', blank=True)

    posted = models.BooleanField(default=False)
    
    def __unicode__(self):
        return u'%d' % self.id
    
class Top(models.Model):
    
    card = models.ForeignKey(Card)
    rank = models.PositiveIntegerField(unique=True, blank=True)