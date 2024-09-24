/*!
 * project : unseal
 * author : LINOFFICE
 * 봉인해제주문서
 */

let unseal_singleton = null;
let unseal_singletonEnforcer = 'singletonEnforcer';
class Unseal {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== unseal_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!unseal_singleton) unseal_singleton = new Unseal(unseal_singletonEnforcer);
		return unseal_singleton;
	}

	// 초기 설정
	init() {
		const _ = this;

		_.param = {
			email : undefined,
			count : undefined,
			password : undefined
		};
		_.regist_lock = false;

		_.wrap_step1 = document.querySelector('.section-unseal-request.step1');
		_.wrap_step2 = document.querySelector('.section-unseal-request.step2');
		_.wrap_authkey = document.querySelector('#section_input_authkey');
		_.wrap_result = document.querySelector('#section_auth_result');

		$(document).on('click', '.custom-count li', function(e){
			var _selected_count = $(this).attr('data-value');
			$('#itemCount').val(_selected_count);
			$(this).parent().parent().find('.result-amount strong').text($(this).text());
			$(this).parent().parent().find('.result-amount strong').val($(this).attr('data-value'));
			if(!($(this).hasClass('selected'))){
				$(this).addClass('selected').siblings().removeClass('selected');
			}
		});

		// 신청 확인 버튼 클릭 이벤트
		document.querySelector('.section-unseal-request.step2 .wrap-button .button.layer-popup').addEventListener('click', e => {
			_.authkey();
		});
		// 신청 취소 버튼 클릭 이벤트
		document.querySelector('.section-unseal-request.step2 .wrap-button .button.cancel').addEventListener('click', e => {
			location.href='index';
		});

		// 인증 번호 확인 버튼 클릭 이벤트
		document.querySelector('#section_input_authkey .wrap-button .button.auth').addEventListener('click', e => {
			_.result();
		});
		// 인증 번호 취소 버튼 클릭 이벤트
		document.querySelector('#section_input_authkey .wrap-button .button.cancel').addEventListener('click', e => {
			_.wrap_authkey.style.display = 'none';
			_.wrap_step1.style.display = _.wrap_step2.style.display = '';
		});
	}

	authkey() {
		const _ = this;

		_.param.email = _.param.count = undefined;
		_.param.email = $('#input_email').val();
		_.param.count = $('#itemCount').val();
		if (!_.param.email) {
			ncuim_modal_show('이메일을 입력하십시오.');
			return;
		}
		if (!is_email_check(_.param.email)) {
			ncuim_modal_show('이메일이 올바르지 않습니다.');
			return;
		}
		if (!_.param.count) {
			ncuim_modal_show('수량을 선택하십시오.');
			return;
		}
		if (!account || !account.ingame) {
			ncuim_modal_show('인게임에서 신청할 수 있습니다.');
			return;
		}

		if (_.regist_lock) {
			return;
		}
		_.regist_lock = true;
		getDatasWithOption([{
			type: 'POST',
			url: '/define/unseal/request',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: _.param
		}], (data) => {
			switch (data) {
			case 1:
				_.wrap_step1.style.display = _.wrap_step2.style.display = 'none';
				_.wrap_authkey.style.display = '';
				break;
			case 2:
				ncuim_modal_show('인게임에서 신청할 수 있습니다.');
				break;
			case 3:
				ncuim_modal_show('계정 정보를 찾을 수 없습니다.');
				break;
			case 4:
				ncuim_modal_show('대표 캐릭터를 찾을 수 없습니다.');
				break;
			case 5:
				ncuim_modal_show('월드 내 캐릭터를 찾을 수 없습니다.');
				break;
			case 6:
				ncuim_modal_show('현재 해당 서비스는 사용하지 않습니다.');
				break;
			case 7:
				ncuim_modal_show('파라미터가 누락되었습니다.');
				break;
			case 8:
				ncuim_modal_show('인증메일 전송에 실패하였습니다.');
				break;
			case 9:
				ncuim_modal_show('보안인증이 되어있지 않습니다.</br>인게임에서 인증 완료 후 진행하십시오.');
				break;
			default:
				ncuim_modal_show('알 수 없는 이유로 실패하였습니다.');
				break;
			}
			_.regist_lock = false;// 해재
		}, (data) => {
			_.regist_lock = false;// 해재
		});
	}

	result() {
		const _ = this;

		_.param.password = $('#authKey').val();
		if (!_.param.password) {
			ncuim_modal_show('인증번호를 입력하십시오.');
			return;
		}

		if (_.regist_lock) {
			return;
		}
		_.regist_lock = true;
		getDatasWithOption([{
			type: 'POST',
			url: '/define/unseal/authkey',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: _.param
		}], (data) => {
			switch (data) {
			case 1:
				_.wrap_authkey.style.display = 'none';
				_.wrap_result.style.display = '';
				break;
			case 2:
				ncuim_modal_show('인게임에서 신청할 수 있습니다.');
				break;
			case 3:
				ncuim_modal_show('계정 정보를 찾을 수 없습니다.');
				break;
			case 4:
				ncuim_modal_show('대표 캐릭터를 찾을 수 없습니다.');
				break;
			case 5:
				ncuim_modal_show('월드 내 캐릭터를 찾을 수 없습니다.');
				break;
			case 6:
				ncuim_modal_show('파라미터가 누락되었습니다.');
				break;
			case 7:
				ncuim_modal_show('인증 시간이 초과되었습니다.');
				break;
			case 8:
				ncuim_modal_show('인증 번호가 일치하지 않습니다.');
				break;
			default:
				ncuim_modal_show('알 수 없는 이유로 실패하였습니다.');
				break;
			}
			_.regist_lock = false;// 해재
		}, (data) => {
			_.regist_lock = false;// 해재
		});
	}
}

Unseal.instance;