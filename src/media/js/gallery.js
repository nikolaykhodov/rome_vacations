function popup_close() {
    $('#popup').hide();
    $('#popup_background').hide();
    return false;
}

function popup_show(a) {
    var image_src = $(a).attr('image_src');
    var permalink = $(a).attr('href');
    var name = $('.facebook_name[user_id="'+$(a).attr('user_id')+'"]').html();

    $('#popup_image').attr({src: image_src});
    $('#popup_name').html(name);

    $('#popup').show();
    $('#popup_background').show();
    return false;
}

function loadGalleryNames() {
    function lookup(response, uid) {
        for(var i = 0; i < response.data.length; i++) {
            if (response.data[i].id == uid) return response.data[i].name;
        }

        return '';
    }

    var uids = [];
    $('.facebook_name').each(function() {
        uids.push($(this).attr('user_id'));
    });

    FB.api('/fql?q='+('SELECT id,name FROM profile WHERE id IN ('+uids.join(',')+')'), function(response) {
        $('.facebook_name').each(function() {
            $(this).html(lookup(response, $(this).attr('user_id')));
        });
    });
}