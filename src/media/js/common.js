function postPublish(params) {
    params.title = params.title || "C Рождеством";
    params.link = params.link || 'http://www.facebook.com/samsungru?sk=app_109661849150534';
    
    FB.ui({
            target_id: params.to_id,
            method: 'stream.publish',
            message: params.title,
            attachment: {
                name: params.title,
                caption: '{*actor*} поздравляет друзей и близких!',
                description: 'Поздравь и ты. Выиграй Римские каникулы и стильные подарки от Samsung Electronics!',
                href: params.link,
                media: [{type: 'image', src: params.img_url, href: params.link}]
            }
        },
        params.callback
    );
}

function postAPI(params) {
    params.title = params.title || "C Рождеством";
    params.link = params.link || 'http://www.facebook.com/samsungru?sk=app_109661849150534';

    var msg = {
        name: params.title,
        caption: '{*actor*} поздравляет друзей и близких!',
        link: params.link,
        description:  'Поздравь и ты. Выиграй Римские каникулы и стильные подарки от Samsung Electronics!',
        picture: params.img_url
    };
    FB.api('/'+(params.to_id || 'me')+'/feed', 'post', msg, params.callback);
}
function postOnWall(img_url, callback, to_id, title, only_publish) {
    var link = 'http://www.facebook.com/samsungru?sk=app_109661849150534';
    title = title || 'С Рождеством!';

    if(only_publish) {
        postPublish({img_url: img_url, link: link, title: title, to_id: to_id, callback: function(response) {
            if(!response || response.error) callback(false); else callback(true);
        }});
    } else {
        postAPI({img_url: img_url, link: link, title: title, to_id: to_id, callback: function(response) {
            if(!response || response.error) {
                postPublish({img_url: img_url, link: link, title: title, to_id: to_id,  callback: function(response) {
                    if(!response || response.error) callback(false); else callback(true);
                }});
            } else callback(true);
        }});
    }
}

var Preloader = {
    show: function() {
        $('#preloader').show();
        $('#wrap').hide();

        return this;
    },

    hide: function() {
        $('#preloader').hide();
        $('#wrap').show();

        return this;
    },

    value: function(val) {
        if(val) {
            $('.preloader__value').html(val);
            return this;
        } else {
            return $('.preloader__value').html();
        }
    },

    range: function(range) {
        range = parseInt(range);
        if(!isNaN(range)) {
            $('.preloader__range').css('width', Math.ceil(range/100 * $('.preloader__line').width()));
            return this;
        } else {
            return $('.preloader__range').css('width');
        }
    }
};