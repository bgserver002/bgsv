/*!
 * project : gift
 * author : LINOFFICE
 * N코인 선물하기
 */

if (!account || !account.ingame) {
	window.self.close();// 자신 종료
}

class Gift {
	// 생성자
	constructor() {
		$('#userNcoin').text(commaAdd(account.ncoin));

		this.nocin_amount = 0;
		this.friend_name = null;
		this.gift_sync = false;

		this.ncoin_input = $('#ncoinAmount');
		this.ncoin_msg = $('.ncoin_msg');
		this.friend_input = $('#friendName');
		this.friend_msg = $('.friend_msg');
		this.submit_btn = document.querySelector('#app .wrap .btn_wrap .btn');

		this.addEvents();
	}

	box_on(obj) {
		const input_box = $(obj).parent('.input_box');
		if ($(obj).val().length) {
			if (!input_box.hasClass('on')) {
				input_box.addClass('on');
			}
		} else {
			if (input_box.hasClass('on')) {
				input_box.removeClass('on');
			}
		}
	}

	ncoin_error_msg(msg) {
		this.ncoin_msg.text(msg);
		this.ncoin_msg.css('display', 'block');
	}

	friend_error_msg(msg) {
		this.friend_msg.text(msg);
		this.friend_msg.css('display', 'block');
	}

	confirm() {
		const _ = this;

		if (!_.ncoin_input.val()) {
			_.ncoin_error_msg('선물하실 금액을 입력해주세요.');
			return;
		}
		_.nocin_amount = Number(commaRemove(_.ncoin_input.val()));
		if (!account.ncoin || _.nocin_amount > account.ncoin) {
			_.ncoin_error_msg('보유중인 N코인이 부족합니다.');
			return;
		}
		if (_.nocin_amount < 10000) {
			_.ncoin_error_msg('10,000코인 이상 선물이 가능합니다.');
			return;
		}

		if (!_.friend_input.val()) {
			_.friend_error_msg('선물하실 캐릭터명을 입력해주세요.');
			return;
		}
		_.friend_name = $('#friendName').val();
		if (_.friend_name.length > 20) {
			_.friend_error_msg('캐릭터명이 올바르지 않습니다.');
			return;
		}
		var pattern = /\s/g;   // 공백 체크 정규표현식 - 탭, 스페이스
		if (_.friend_name.match(pattern)) {
			_.friend_error_msg('캐릭터명에는 공백이 들어갈 수 없습니다.');
			return;
		}
		const name_regex = /^[가-힣|a-z|A-Z|0-9|]+$/;
		if (!name_regex.test(_.friend_name)) {
			_.friend_error_msg('캐릭터명이 올바르지 않습니다.');
			return;
		}
		if (account.firstChar && account.firstChar.name == _.friend_name) {
			_.friend_error_msg('자기자신에게는 선물할 수 없습니다.');
			return;
		}
		popupShow('정말로 선물하시겠습니까?', `<span class="type2"><a href="#" class="close" id="send_excute">예</a></span>`, `<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>`);
		document.querySelector('#send_excute').addEventListener('click', (e) => {
			_.send();
			eventStop(e);
		});
	}

	send() {
		const _ = this;

		if (_.gift_sync) {
			return;
		}
		_.gift_sync = true;

		_.ncoin_msg.css('display', 'none');
		_.friend_msg.css('display', 'none');
		const sendData = {
			'ncoin_amount' : _.nocin_amount,
			'friend_name' : _.friend_name
		};
		getDatasWithOption([{
			type: 'POST',
			url: '/define/gift',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: sendData
		}], (data) => {
			switch (data) {
			case 1:
				popupShow('정상적으로 처리되었습니다.', '<span class="type2"><a href="#" class="close" id="success_close">닫기</a></span>', null);
				document.querySelector('#success_close').addEventListener('click', (e) => {
					popupClose();// 팝업 종료
					window.opener.location.reload();// 부모 윈도우 리로드
					window.self.close();// 자신 종료
					eventStop(e);
				});
				break;
			case 2:
				popupShow('인게임에서 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 3:
				popupShow('계정 정보를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 4:
				popupShow('대표 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 5:
				popupShow('인게임 내 케릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 6:
				popupShow('보유하신 N코인이 부족합니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 7:
				popupShow('선물 대상을 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 8:
				popupShow('자기 자신에게는 선물할 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			default:
				popupShow('선물에 실패하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			}
			_.gift_sync = false;
		}, (data) => {
			_.gift_sync = false;
			throw new Error("send_gift_excute from gift.js Error");
		});
	}

	addEvents() {
		const _ = this;

		const keyEventType = isIngame ? 'keyup' : 'keydown';

		// 엔코인 인풋 입력 이벤트
		setInputToComma(_.ncoin_input);
		_.ncoin_input.on(keyEventType, function(e) {
			_.box_on(this);
		});
		
		// 친구 이름 인풋 입력 이벤트
		$('#friendName').on(keyEventType, function(e) {
			_.box_on(this);
		});

		// 초기화 버튼 클릭 이벤트
		$('.chargeAmt-reset').on('click', function(event) {
			const input_box = $(this).parent('.input_box');
			input_box.removeClass('on');
			input_box.children('input').val('');

			const err_msg = input_box.parent('.present_amount').children('.error_msg');
			err_msg.text('');
			err_msg.css('display', 'none');
		});

		// 선물하기 버튼 클릭 이벤트
		_.submit_btn.addEventListener('click', (e) => {
			_.confirm();
		});

		// 스크롤바 활성화
		$('.scrollbar-macosx').scrollbar();
	}
}

new Gift();