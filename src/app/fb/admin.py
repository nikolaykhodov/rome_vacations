# -*- coding: utf-8 -*-

from django.contrib import admin
from fb.models import *
from fb.widgets import CardImageWidget

class CardAdmin(admin.ModelAdmin):

    list_display = ('user_id', 'preview', 'posted', )
    search_fields = ('id', 'user_id', 'image', 'thumbnail',)
    list_filter = ('posted', )
    
    def preview(self, obj):
        return "<a id='thumbnail_%(id)s' href='%(image)s' target='_blank'><img src='%(thumbnail)s' /></a>" % {
            'image': obj.image.url,
            'thumbnail': obj.thumbnail.url,
            'id': obj.id
        }
    preview.allow_tags = True    
    
class TopAdmin(admin.ModelAdmin):
    list_display = ('link', 'preview', 'rank')
    list_editable = ('rank', )

    def formfield_for_dbfield(self, db_field, **kwargs):
        '''
        Переопредение виджета для поля card
        '''
        if db_field.name == 'card':
            kwargs['widget'] = CardImageWidget
        return super(TopAdmin, self).formfield_for_dbfield(db_field, **kwargs)
    
    def link(self, obj):
        return '<a href="http://apps.facebook.com/rome_vacations/cards-%s/" target="_blank">Открытка</a>' % (
            obj.card.id
        )
    link.allow_tags = True
    
    def preview(self, obj):
        return "<a id='thumbnail_%(id)s' href='%(image)s' target='_blank'><img src='%(thumbnail)s' /></a>" % {
            'image': obj.card.image.url,
            'thumbnail': obj.card.thumbnail.url,
            'id': obj.card.id
        }
    preview.allow_tags = True     

admin.site.register(Card, CardAdmin)
admin.site.register(Top, TopAdmin)
