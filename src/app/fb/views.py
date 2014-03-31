#-*- coding: utf-8 -*-

from django.core.files.base import ContentFile
from django.conf import settings
from django.views.generic.base import TemplateView
from django.views.generic.list import ListView
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.http import Http404

from fb.models import Card, Top
from fb.base import FacebookView

from cStringIO import StringIO
from PIL import Image

from base64 import b64decode

import json
import hashlib

import re

def get_card_url(id):
    return 'http://apps.facebook.com/rome_vacations%s/cards-%d/' % (
        '' if not settings.DEBUG else '_debug',
        id
    )

class Index(FacebookView, TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        return {
            'signed_request': self.signed_request
        }


class Tab(FacebookView, TemplateView):
    template_name = 'tab.html'

    def get_context_data(self, **kwargs):
        try:
            liked = self.signed_request['page']['liked'] is True
        except (KeyError, TypeError):
            liked = False

        return {
            'liked': liked,
            'DEBUG_POSTFIX' : '' if not settings.DEBUG else '_debug'
        }
class Upload(FacebookView):

    @staticmethod
    def answer(answer):
        return HttpResponse(json.dumps(answer))

    @staticmethod
    def load_image(content):
        return Image.open(StringIO(content))

    @staticmethod
    def make_png(image):
        from ImageOps import fit
        buffer = StringIO()

        image.save(buffer, 'png')

        buffer.seek(0)
        return buffer.read()

    @staticmethod
    def make_thumbnail(image):
        from ImageOps import fit
        buffer = StringIO()

        im = fit(image, (164, 124), Image.ANTIALIAS)
        im.save(buffer, 'png')

        buffer.seek(0)
        return buffer.read()

    def check_and_process(self, request):
        if self.user_id is None and settings.DEBUG is True:
            self.user_id = 1
            
        if 'image' not in request.POST or self.user_id is None:
            return self.answer({'error': 1, 'description': u'Неавторизованный пользователь'})

        if len(request.POST.get('image')) > 1000000:
            return self.answer({'error': 1, 'description': u'Файл превышает допустимый размер (1000кб)'})

        try:
            content = b64decode(request.POST.get('image').replace('data:image/png;base64,', ''))
            image = self.load_image(content)
        except (TypeError, IOError):
            return Upload.answer({'error': 1, 'description': u'Файл не может быть обработан'})

        if image.size[0] > 500 or image.size[1] > 500:
            return self.answer({'error': 1, 'description': u'Размер изображения превышает допустимые (500х500)'})

        self.image = self.make_png(image)
        self.thumbnail = self.make_thumbnail(image)

        return None

    def post(self, request):
        response = self.check_and_process(request)
        if response is not None:
            return response
        
        base_name = hashlib.sha1(self.image).hexdigest()

        card = Card.objects.create(user_id=self.user_id)
        card.image.save('%s_%s_image.png' % (self.user_id, base_name), ContentFile(self.image))
        card.thumbnail.save('%s_%s_thumbnail.png' % (self.user_id, base_name), ContentFile(self.thumbnail))
        
        return self.answer({
            'error': 0,
            'img_url': card.image.url,
            'id': card.id
        })
        
class Rules(FacebookView, TemplateView):
    template_name = 'rules.html'

class TravelMenu(FacebookView, TemplateView):
    template_name = 'travelmenu.html'

class Prizes(FacebookView, TemplateView):
    template_name = 'prizes.html'

class Send(FacebookView, TemplateView):
    template_name = 'send.html'

class Sent(FacebookView, TemplateView):
    template_name = 'sent.html'

    def change_posted(self, card, posted):
        if self.user_id is None and settings.DEBUG is True:
            self.user_id = 1

        # номер владельца открытки должен совпадать с номером отправителя запроса
        if card.user_id == self.user_id:
            card.posted = posted
            card.save()

    def get_context_data(self, **kwargs):
        try:
            id = int(self.request.GET.get('id', ''))
        except ValueError:
            raise Http404
        card = get_object_or_404(Card, id=id)
        
        self.change_posted(
            card,
            self.request.GET.get('posted', '') == 'true'
        )

        return {'next': get_card_url(card.id)}
        
class Gallery(FacebookView, ListView):
    template_name = 'gallery.html'
    context_object_name = 'card_list'
    paginate_by = 9

    @staticmethod
    def create_queryset(user_id=None):
        base_queryset = Card.objects.all().filter(posted=True)

        queryset = []
        if user_id is not None:
            queryset = base_queryset.filter(user_id=user_id).order_by('-id') | \
                       base_queryset.exclude(user_id=user_id).order_by('-id')
        else:
            queryset = base_queryset.order_by('-id')

        return queryset

    def get_queryset(self):
        return Gallery.create_queryset(self.user_id)

    def get_context_data(self, **kwargs):
        context = super(Gallery, self).get_context_data(**kwargs)
        context['user_id'] = self.user_id

        number = context['page_obj'].number
        last = context['paginator'].page_range[-1]

        context['pages'] = [
            n for n in xrange(number-5, number+5)
            if n >= 1 and n <= last
        ]
        return context

class GalleryTop(FacebookView, ListView):
    template_name = 'gallery_top.html'
    context_object_name = 'top_list'
    paginate_by = 20

    def get_queryset(self):
        return Top.objects.all()

class Cards(FacebookView, TemplateView):
    template_name = 'card.html'

    def get_context_data(self, **kwargs):
        gallery_page = self.request.session.get('gallery_page', '')

        matches = re.findall(r'gallery/\?page=(\d+)$', self.request.META.get('HTTP_REFERER', ''))
        if len(matches) > 0:
            gallery_page = int(matches[0])
            self.request.session['gallery_page'] = gallery_page
            
        card = get_object_or_404(Card, id=kwargs['id'])
        
        card_id = int(kwargs['id'])
        nexts = Card.objects.filter(posted=True).filter(id__gte=card_id+1)
        prevs = Card.objects.filter(posted=True).filter(id__lte=card_id-1)
        
        return {
            'user_id': card.user_id,
            'image_src': card.image.url,
            'prev': nexts[0].id if len(nexts) > 0 else None,
            'next': prevs[len(prevs)-1].id if len(prevs) > 0 else None,
            'gallery_page': gallery_page
        }

class ChooseFriends(FacebookView, TemplateView):
    template_name = 'choose_friends.html'

    def change_posted(self, card, posted):
        if self.user_id is None and settings.DEBUG is True:
            self.user_id = 1

        # номер владельца открытки должен совпадать с номером отправителя запроса
        if card.user_id == self.user_id:
            card.posted = posted
            card.save()

    def get_context_data(self, **kwargs):
        try:
            id = int(self.request.GET.get('id', ''))
        except ValueError:
            raise Http404
        card = get_object_or_404(Card, id=id)

        self.change_posted(
            card,
            self.request.GET.get('posted', '') == 'true'
        )

        return {
            'img_url': card.image.url,
            'card_id': card.id,
            'posted': self.request.GET.get('posted', '')
        }
