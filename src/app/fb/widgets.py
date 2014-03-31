# -*- coding: utf-8 -*-

from django import forms
from django.utils.safestring import mark_safe
from fb.models import Card

class CardImageWidget(forms.widgets.Widget):
    '''
    Класс виджета для отображения открытки как картинки
    '''
    def render(self, name, value, attrs=None):
        card = Card.objects.get(id=value)
        output = []
        if value > 0:
            output.append('<img src="%s"/>' % card.image.url)
        return mark_safe(u''.join(output))