from django.conf.urls.defaults import patterns, include, url
from django.conf.urls.static import static
import settings
import fb.urls

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^app/', include(fb.urls)),
    url(r'^admin/', include(admin.site.urls)),
)

print settings.STATIC_URL
if settings.DEBUG:
    urlpatterns += patterns('',
        ( r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),
        ( r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT})
    ) 