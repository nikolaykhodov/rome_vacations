# -*- coding: utf-8 -*-
from django.views.generic.base import View
from django.conf import settings
from base64 import b64decode
from facebook import GraphAPI, FQLAPI

from datetime import datetime, timedelta
import hmac
import time
import json
import hashlib


class FacebookView(View):

    def __init__(self, *args, **kwargs):
        super(FacebookView, self).__init__(*args, **kwargs)

        self.user_id = None
        self.access_token = None
        self.signed_request = None
        self.graph = None
        self.fql = None

        if hasattr(self, 'get'):
            self.post = self.get

    @staticmethod
    def base64_url_decode(str):
        str += '=' * (4 - len(str) %4 )
        return b64decode(str.replace('-', '+').replace('_', '/'))

    def load_signed_request(self, signed_request):
        """Load the user state from a signed_request value"""
        sig, payload = signed_request.split(u'.', 1)
        sig = self.base64_url_decode(sig)
        data = json.loads(self.base64_url_decode(payload))

        expected_sig = hmac.new(
            settings.FACEBOOK_SECRET_KEY, msg=payload, digestmod=hashlib.sha256).digest()

        # allow the signed_request to function for upto 1 day
        if sig == expected_sig and data[u'issued_at'] > (time.time() - 86400):
            try:
                self.signed_request = data
                self.user_id = int(data.get(u'user_id'))
                self.access_token = data.get(u'oauth_token')
            except TypeError:
                return False

            return True
        else:
            return False

    def init_facebook(self, request):
        """Sets up the request specific Facebook and User instance"""

        # initial facebook request comes in as a POST with a signed_request
        if u'signed_request' in request.POST:
            signed_request = request.POST.get('signed_request')
            if self.load_signed_request(signed_request):
                request.session['u'] = {
                    'signed_request': signed_request,
                    'expires': datetime.now() + timedelta(minutes=1440)
                }
        elif 'u' in request.session and request.session['u']['expires'] > datetime.now():
            self.load_signed_request(request.session['u']['signed_request'])

        if self.user_id:
            self.graph = GraphAPI(self.access_token)
            self.fql = FQLAPI(self.access_token)


    def dispatch(self, request, *args, **kwargs):
        self.init_facebook(request)
        return super(FacebookView, self).dispatch(request, *args, **kwargs)
