var friendsInfo = {};

function loadFriends() {
    FB.api('/fql', {q: 'SELECT id,name,pic_square FROM  profile WHERE  id IN (SELECT uid2  FROM friend WHERE uid1 = me())'}, function(response) {
        var friends = response.data;
        for(var i = 0; i < friends.length; i++) {
            var friend = friends[i];
            $('#friends').append('<li id="friend%id"><input type="checkbox" onclick="chooseFriend(this);"/><img src="%pic" width="50" height="50"/><span>%name</span></li>'.
                replace('%id', friend.id).replace('%pic', friend.pic_square).replace('%name', friend.name)
            );

            friendsInfo[friend.id] = {
                id: friend.id,
                li: $('#friend' + friend.id),
                name: friend.name,
                chosen: false,
                pic_square: friend.pic_square
            };
        }

        // update GUI
        $('.userlist-wrap').jScrollPane({showArrows: true, verticalGutter: 10});
        Preloader.hide();
        findFriends();
    });
}

function chooseFriend(checkbox) {
    if($('li[id*="chosen_friend"]').length >= 3) {
        return;
    }

    var id = $(checkbox.parentNode).attr('id').match(/\d+/)[0];

    friendsInfo[id].chosen = true;
    $(friendsInfo[id].li).hide();
    
    $('#chosen_friends').append('<li id="chosen_friend%id"><img src="%pic"/><span>%name</span><a href="#" class="button_small" onclick="unchooseFriend(this); return false;">Удалить</a></li>'.
        replace('%id', friendsInfo[id].id).replace('%pic', friendsInfo[id].pic_square).replace('%name', friendsInfo[id].name)
    );

    // update scroll bar
    $('.userlist-wrap').jScrollPane({showArrows: true, verticalGutter: 10});

    // update counter
    updateCounter();
}

function unchooseFriend(a) {
    var id = $(a.parentNode).attr('id').match(/\d+/)[0];

    friendsInfo[id].chosen = false;
    $(friendsInfo[id].li).find('input[type=checkbox]').attr('checked', false);

    var filter = $('#filter').attr('value').toLowerCase();
    if(friendsInfo[id].name.toLowerCase().indexOf(filter) >= 0) {
        $(friendsInfo[id].li).show();
    }

    $(a.parentNode).remove();

    // update scroll bar
    $('.userlist-wrap').jScrollPane({showArrows: true, verticalGutter: 10});

    // update counter
    updateCounter();
}

function updateCounter() {
    var count = $('li[id*="chosen_friend"]').length;
    var forms = {
        '0': 'друзей',
        '1': 'друга',
        "2": "друзей", "3": "друзей", "4": "друзей", "5": "друзей", "6": "друзей", "7": "друзей","8": "друзей", "9": "друзей"
    };

    $('p#counter').html('Вы выбрали <span>%count</span> %form для отправки открытки'.
        replace('%count', count).replace('%form', forms[count % 10])
    );
}

function findFriends() {
    var filter = $('#filter').attr('value').toLowerCase();

    for(var i in friendsInfo) {
        if(!friendsInfo[i].chosen && friendsInfo[i].name.toLowerCase().indexOf(filter) >= 0) {
            $(friendsInfo[i].li).show();
        } else {
            $(friendsInfo[i].li).hide();
        }
    }

    // update scroll bar
    $('.userlist-wrap').jScrollPane({showArrows: true, verticalGutter: 10});
}

function post() {
    var ids = [];

    $('li[id*="chosen_friend"]').each(function(){
        ids.push($(this).attr('id').match(/\d+/));
    });

    var length = ids.length;
    var percent = 0;
    var card_id = $('.button.button_next').attr('card_id');
    var posted = $('.button.button_next').attr('posted') == 'true';

    function doPost() {
        var to_id = ids.pop();
        if(!to_id) {
            window.location.href = '../sent/?id='+card_id+'&posted='+posted.toString();
            return;
        }

        percent += Math.round(1.0/length * 100);
        Preloader.value(percent+'%').range(percent).show();

        postOnWall($('.button.button_next').attr('img_url'), function(p){
            posted = p || posted;

            doPost();
        }, to_id);
    }

    doPost();
}



$(document).ready(function() {
    jQuery('.userlist-wrap').jScrollPane({showArrows: true, verticalGutter: 10});

    var filterValue = '';
    setInterval(function() {
        if($('#filter').attr('value') != filterValue) {
            findFriends();
            filterValue = $('#filter').attr('value');
        }
    }, 1500);

    Preloader.value('Загрузка... ');
    Preloader.range('100%');
    Preloader.show();
});
