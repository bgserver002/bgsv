/*!
 * project : support
 * author : LINOFFICE
 * 후원
 */

var sending_msg = false;// 전송 딜레이 체크를 위한 변수
function agree_progres(){
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	if ($('#agree_check').is(':checked')) {
		getDatas([
			'/define/support/agree'
		], (data) => {
			if (data) {
				$('.account-binding').after('<span class="agree_txt">&nbsp;[<i class="xi-shield-checked-o"></i>&nbsp;약관동의 완료]</span>');
				$('.support_container').html(data);
				popupShow('약관 동의가 완료되었습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);

				const complete_input = $('#support_complete_msg');
				if (complete_input) {
					setInputToComma(complete_input);
				}
			}
		}, (data) => {
			throw new Error("agree_progres support.js Error");
		});
	} else {
		popupShow('약관동의 후 진행할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
	}
}

function support_bank_request(){
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	if (!account.firstChar) {
		popupShow('대표 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (!account.ingame) {
		popupShow('인게임에서 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (sending_msg) {
		return;
	}
	sending_msg = true;
	$('.dimmed').css('display', 'block');
	$('#send_delay').css('display', 'block');
	getDatas([
		'/define/support/request'
	], (data) => {
		$('#send_delay').css('display', 'none');
		switch (data) {
		case 1:
			popupShow('정상적으로 요청 되었습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 2:
			popupShow('인게임에서 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 3:
			popupShow('계정 정보를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 4:
			popupShow('대표 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 5:
			popupShow('인게임 내 케릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		default:
			popupShow('요청에 실패하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		}
		sending_msg = false;
	}, (data) => {
		$('.dimmed').css('display', 'none');
		$('#send_delay').css('display', 'none');
		sending_msg = false;
		popupShow('오류가 발생하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
	});
}

function sendGmMessage(){
	const sendMsg = $('#support_complete_msg').val();
	if (!sendMsg || !sendMsg.length) {
		popupShow('입금 금액을 입력하세요.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	if (!account.firstChar) {
		popupShow('대표 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (!account.ingame) {
		popupShow('인게임에서 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if ((Number(commaRemove(sendMsg)) % 10000) != 0) {
		popupShow('10,000원 단위로 입력하셔야 합니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (sending_msg) {
		return;
	}
	sending_msg = true;
	$('.dimmed').css('display', 'block');
	$('#send_delay').css('display', 'block');
	getDatasWithOption([{
		type: 'POST',
		url: '/define/support/msg',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: { "msg" : sendMsg }
	}], (data) => {
		$('#send_delay').css('display', 'none');
		switch (data) {
		case 1:
			$('#support_complete_msg').val('');
			popupShow('정상적으로 처리되었습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 2:
			popupShow('인게임에서 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 3:
			popupShow('계정 정보를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 4:
			popupShow('대표 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 5:
			popupShow('인게임 내 케릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 6:
			popupShow('정상적으로 데이터가 저장되었습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		default:
			popupShow('전송에 실패하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		}
		sending_msg = false;
	}, (data) => {
		$('.dimmed').css('display', 'none');
		$('#send_delay').css('display', 'none');
		sending_msg = false;
		popupShow('오류가 발생하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
	});
}

class SUPPORT_WEBSOCKET {
	constructor() {}

	/*
	 * 채널 연결 이벤트
	 */
	on_open(e) {
	}

	/*
	 * 데이터 수신 이벤트
	 */
	on_message(e) {
		let msg = e.data;
		let idx = msg.indexOf('{');
		if (idx == -1) {
			console.log('not found protocol delimiter ' + msg);
			return;
		}
		var data = JSON.parse(msg);
		if (!data) {
			console.log('not found protocol object ' + msg);
			return;
		}
		if (!account || !account.name || !data.user_name || account.name != data.user_name) {
			return;
		}

		switch (data.type) {
		case 'BANK_RESPONSE':
			ncuim_modal_show(`입금 계좌 정보</br></br>${data.message}</br></br>완료 후 입금금액 보내기를 진행해주십시오.`);
			break;
		case 'BANK_PAY_FINISH':
			ncuim_modal_show(data.message);
			break;
		default:
			break;
		}
	}

	/*
	 * 채널 비활성화 이벤트
	 */
	on_close(e) {
	}
}

$(function () {
	$('#agree_checkbox').on('click', function(e){
		const agreeCheck = $('#agree_check');
		agreeCheck.prop('checked', agreeCheck.is(':checked') ? false : true);
	});

	// 인풋값 처리
	const complete_input = $('#support_complete_msg');
	if (complete_input) {
		setInputToComma(complete_input);
	}

	ws_handler = new WebSocketHandler(ws_config, new SUPPORT_WEBSOCKET());
	ws_handler.connect();
});