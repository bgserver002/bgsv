var GoUrl = {
	index : function() {
		location.href = '/';
	},
	coupon : function() {
		openCouponPopup();
	},
	login : function() {
		login();
	},
	location : function(locationParam) {
		location.href = locationParam;
	}
}

var messageFunction = {
    'default' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '알림 메세지 입니다.',
        'btn' : ['확인']
    },
    'type_account_not_login' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '로그인 후 이용하실 수 있습니다.',
        'btn' : ['확인'],
        'function' : ['GoUrl.login()']
    },
    'type_account_not_login_confirm' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '로그인 후 이용하실 수 있습니다.<br/>로그인 페이지로 이동 하시겠습니까?',
        'btn' : ['예','아니오'],
        'function' : ['GoUrl.login()']
    },
    'type_account_webblock' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '웹 제재 상태입니다. 관리자에게 문의해주시길 바랍니다.',
        'btn' : ['확인']
    },
    'type_account_gameblock' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '고객님은 현재 게임 내 제재 상태이기 때문에<br/>구매가 불가능합니다.',
        'btn' : ['확인']
    },
    'type_account_no_game_character' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '아직 생성된 캐릭터가 없습니다. 게임에 접속하셔서 캐릭터를 생성해 주세요.',
        'btn' : ['확인']
    },
    'type_goods_enabled_purchase' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '구매하실 수 없는 상품입니다.',
        'btn' : ['확인']
    },
    'type_goods_not_purchase_item_currently' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '현재 구매하실 수 없는 상품입니다.',
        'btn' : ['확인']
    },
    'type_goods_not_exist' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '존재하지 않는 상품입니다.',
        'btn' : ['확인']
    },
    'type_receiver_invalid_user' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '선택하신 캐릭터는 구매를 하실 수 없습니다.<br/>다시 확인해 주세요.',
        'btn' : ['확인']
    },
    // N코인 부족
    'order_lack_ncoin' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '보유하신 N코인이 부족해<br/> 이용하실 수 없습니다.',
        'btn' : ['확인']
    },
    // N포인트 부족
    'order_lack_npoint' : {
        'class' : 'default',
        'header' : '알림',
        'txt' : '보유하신 N포인트가 부족해<br/> 이용할 수 없습니다.',
        'btn' : ['확인']
    },

    'btnHTML' : {
        '확인' : function(btn,action) {
            return '<span class="type2"><a href="#none" onclick="javascript:'+action+'; return false;" class="close">확인</a></span>';
        },
        '예' : function(btn,action) {
            return '<span class="type2"><a href="#none" onclick="javascript:'+action+'; return false;" class="close">예</a></span>';
        },
        '아니요' : function(btn,action) {
            return '<span class="type1"><a href="#none" onclick="javascript:'+action+'; return false;" class="close">아니요</a></span>';
        },
        '닫기' : function(btn,action) {
            return '<span class="type1"><a href="#none" onclick="javascript:'+action+'; return false;" class="close">닫기</a></span>';
        },
        '취소' : function(btn,action) {
            return '<span class="type1"><a href="#none" onclick="javascript:'+action+'; return false;" class="close">취소</a></span>';
        },
        '아니오' : function(btn,action) {
            return '<span class="type1"><a href="#none" onclick="javascript:'+action+'; return false;" class="close">아니오</a></span>';
        }
    }
};

/* 레이어 */
var currentAlertId;
function currentAlert(id,data,txt,confirm,func,closeFunc) {
    
    if ($('#layer_modal').is(":visible")) {
	return;
    }
    var html = [];
    currentAlertId = id;

    if ($('#'+currentAlertId).css('display')==null) { 
	$(document.body).append('<div id="layer_alert"></div>');
    }
    if (data) {
        if (data['close']) {
            html.push('<div class="btn_close close" onclick="javascript:' + data['close'] + '">close</div>');
        } else {
            html.push('<div class="btn_close close">close</div>');
        }
        html.push('<div class="header">'+data['header']+'</div>');
        if (txt) html.push('<div class="conWrap"><div class="con">'+txt+'</div></div>');
        else html.push('<div class="conWrap"><div class="con">'+data['txt']+'</div></div>');
        html.push('<div class="btn_modal">')
        for (var i=0;i<data['btn'].length;i++) {
            var action = (data['function']) ? data['function'][i] : '' ;
            html.push(messageFunction['btnHTML'][data['btn'][i]](data['btn'][i], action));
        }
        html.push('</div>')
        $('#'+currentAlertId).attr('class',data['class']);
        $('#'+currentAlertId).html(html.join(''));
        $('.wrap_btn').children('img:first').focus();
    }

    if ($(".dimmed").attr("display","none")) {
        $(".dimmed").fadeIn();
    } else {
        $("body").append("<div class='dimmedAlert' />");
        $(".dimmedAlert").fadeIn();
    }
    $("button").blur();

    $('#'+currentAlertId).wrapInner( "<div class='wrapper'></div>").show(10, function(){
        if (!$('#layer_alert').parent('.layer_wrap').length) {
            $('#layer_alert').wrap('<div class="layer_wrap" />');
	    if ($('.subWrap .modal').is(':visible')) {
                $('.layer_wrap').addClass('hasdimmed');
            }
        }
    });


    $(document).on('click', '#layer_alert .btn_modal .close', function(event) {
        event.stopImmediatePropagation();
        if ($(this).closest('.layer_wrap').length) {
            if ($('.subWrap .modal').is(':visible')) {
                $(this).closest('.layer_wrap').remove();
                return;
            } else {
                $(this).closest('.layer_wrap').remove();
            }
        }

        $('#'+currentAlertId).remove();
        if ($(".dimmedAlert").length) {
            $(".dimmedAlert").remove();
            return;
        } else if(!$(".ifmLy").length) {
            $(".dimmed").fadeOut();
            return;
        }

    });
    $(document).on('click', '#layer_alert .btn_close', function(event) {
        if (data['closeFunction']) {
            eval(data['closeFunction'][0]);
        }
        event.stopImmediatePropagation();
        if ($(this).closest('.layer_wrap').length) {
            $(this).closest('.layer_wrap').remove();
        }
        $('#'+currentAlertId).remove();
        if ($(".dimmedAlert").length) {
            $(".dimmedAlert").remove();
            return;
        } else if (!$(".ifmLy").length) {
            $(".dimmed").fadeOut();
            return;
        }
    });
}