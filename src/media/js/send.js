function save() {
    var card = $('#i')[0];

    CardEditor.unselectAll();
    $('#next_button').attr('onclick', 'return false;');

    Preloader.range('100%');
    Preloader.value('Загрузка...');
    Preloader.show();

    $.ajax({
        type: 'POST',
        url: '../upload/',
        data: {image: card.toDataURL('image/png')},
        success: function(xhr) {
            var answer = eval('(' + xhr + ')');
            if(answer.error) {
                alert(answer.description);
            } else {
                postOnWall(answer.img_url, function(posted) {
                    window.location.href = '../choose_friends/?' + '&id='+answer.id+'&posted='+posted.toString();
                }, null, $('#title').attr('value'), true);
            }
        }
    })
}
function load() {
    $('.tabs__labels li',$('.send-card__bottom-panel')).each(function(i){
        $(this).live("click",function(){
            $('.tabs__labels').find('.active').removeClass('active');
            $(this).addClass('active');
            $('.tabs__content-wrap').find('.active').removeClass('active');
            $('.tabs__content-wrap > div:eq('+i+')').addClass('active');
        })
    });
    $('.tabs__content').each(function(){
        $(this).find('ul').css({"width" : $(this).find('li').length * 145});
    });
    $('.tabs__content').jScrollPane({showArrows: true, horizontalGutter: 0});

    /*
     * Настройка выбора цветов
     */
    $('#title-colorpicker').ColorPicker({
        color: '#000000',
        onChange: function(hsb, hex, rgb) {
            $('#title-colorpicker').css({backgroundColor: '#' + hex});
            CardEditor.set('title', {fill: '#' + hex});
        }
    });

    $('#text-colorpicker').ColorPicker({
        color: '#000000',
        onChange: function(hsb, hex, rgb) {
            $('#text-colorpicker').css({backgroundColor: '#' + hex});
            CardEditor.set('text', {fill: '#' + hex});
        }
    });

    /*
     * Настройка канвы и выбор белого фона (он первый в списке файлов) по умолчанию
     */
    CardEditor.init();
    CardEditor.loadBackground($($('img[srctoload*="/media/"]')[0]).attr('srctoload'));
}

var CardEditor = new (function() {
    var canvas, title, text, background, frame, decorator = null;

    var initialized = false;
    

    function init() {
        if(initialized) {
            return;
        }

        canvas = new fabric.Canvas('i');
        title = new fabric.Text('\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a', { left: 230, top: 20, color:'#000000', fontFamily: 'Quake_Cyr'});
        text = new fabric.Text('\u0422\u0435\u043a\u0441\u0442', { left: 230, top: 150, color:'#000000', fontFamily: 'Quake_Cyr'});
        canvas.add(title, text);

        initialized = true;
    }
    this.init = init;

    function update() {
        if(frame) canvas.bringToFront(frame);
        if(decorator) canvas.bringToFront(decorator);
        canvas.bringToFront(text);
        canvas.bringToFront(title);

        canvas.renderAll();
    }

    this.set = function(target, obj) {
        var elem = {'title': title, 'text': text, 'background': background}[target];
        for(var key in obj) {
            elem.set(key, obj[key]);
        }

        update();
    };
    
    var italic = false;
    this.toggleItalic = function() {
        italic = !italic;
        text.set('fontStyle', italic ? 'italic' : '');
        update();
    };
    
    var underline = false;
    this.toggleUnderline = function() {
        underline = !underline;
        text.set('textDecoration', underline ? 'underline' : '');
        update();
    };

    this.loadBackground = function(url) {
        fabric.Image.fromURL(url, function(img) {
            if(background)
                canvas.remove(background);

            img.getNormalizedSize(img, 465, 350);

            background = img;

            background.set('left', 455/2);
            background.set('top', 350/2);
            background.scaleToWidth(455);
            background.selectable = false;
            canvas.add(background);

            update();
        }, {maxwidth: 465, maxheight: 350});
    };
    
    this.loadFrame = function(url) {
        fabric.Image.fromURL(url, function(img) {
            if(frame)
                canvas.remove(frame);

            img.getNormalizedSize(img, 465, 350);

            frame = img;

            frame.set('left', 455/2);
            frame.set('top', 350/2);
            frame.scaleToWidth(455);
            frame.selectable = false;
            canvas.add(frame);
            
            update();
        }, {maxwidth: 465, maxheight: 350});
    };
    
    this.loadDecorator = function(url) {
        fabric.Image.fromURL(url, function(img) {
            if(decorator)
                canvas.remove(decorator);

            img.getNormalizedSize(img, 465, 350);

            decorator = img;

            decorator.set('left', 455/2);
            decorator.set('top', 350/2);
            //decorator.scaleToWidth(455);
            decorator.selectable = true;
            canvas.add(decorator);
            
            update();
        }, {maxwidth: 465, maxheight: 350})
    };

    this.unselectAll = function() {
        canvas.deactivateAll();
        canvas.renderAll();
    };
    
})();

function preload(imgs, onAllLoaded, onLoad) {
    var loader = {
        loaded: 1,
        triggerValue: imgs.length,
        
        onAllLoaded: onAllLoaded,
        
        onLoad: function() {
            this.loaded++;
            
            if(this.loaded >= this.triggerValue) {
                onAllLoaded(this);
            }
        }
    };

    for(var i = 0; i < imgs.length; i++) {
        var img = new Image();
        img.onload = function() { if(onLoad) onLoad(loader); loader.onLoad() };
        img.src = imgs[i];
    }   
}
