# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
from fb.views import *

urlpatterns = patterns('fb.views',
    (r'^tab/$',  Tab.as_view()),
    (r'^$', Index.as_view()),
    (r'^upload/$', Upload.as_view()),
    (r'^rules/$', Rules.as_view()),
    (r'^send/$', Send.as_view()),
    (r'^sent/$', Sent.as_view()),
    (r'^prizes/$', Prizes.as_view()),
    (r'^travelmenu/$', TravelMenu.as_view()),
    (r'^gallery/$', Gallery.as_view()),
    (r'^v3xV41YD52JSeREXTP/gallery_top/$', GalleryTop.as_view()),
    (r'^cards-(?P<id>\d+)/$', Cards.as_view()),
    (r'^choose_friends/$', ChooseFriends.as_view())
)