/*!
 * project : bank
 * author : LINOFFICE
 * 계좌 등록
 */

let bank_singleton = null;
let bank_singletonEnforcer = 'singletonEnforcer';
class Bank {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== bank_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!bank_singleton) bank_singleton = new Bank(bank_singletonEnforcer);
		return bank_singleton;
	}

	// 초기 설정
	init() {
		const _ = this;

		includeHTML(document.querySelector('#svg-container'), 'https://cdn.jsdelivr.net/gh/cckiss/web/svg.html', cacheVersion);

		_.param = {
			bank_name : undefined,
			bank_number : undefined,
			owner_name : undefined,
			phone : undefined
		};
		_.regist_lock = false;

		_.init_progress();
	}

	// 안내 화면 출력
	init_progress() {
		const _ = this;

		let tpl = `<section class="init_section">` +
		`<div class="message_area"><h1>계좌 등록 안내</h1><ul>${regist_message}</ul></div>` +
		`<div class="btn_wrap"><button type="button" class="btn"><span>다음</span></button></div>` +
		`</section>`;
		$('.regist_container').html(tpl);

		// 다음 버튼 클릭 이벤트
		document.querySelector('.init_section .btn_wrap .btn').addEventListener('click', e => {
			_.setting_progress();
		});
	}

	// 입력 화면 출력
	setting_progress() {
		const _ = this;

		_.param.bank_name = _.param.bank_number = _.param.owner_name = _.param.phone = undefined;

		let tpl = '<section class="setting_section">' +
		'<div class="message_area"><p>계좌를 설정하십시오.</p></div>' +
		'<div class="input_area">' +
		'<div class="input_box"><label>은행명</label><input type="text" autocomplete="off" placeholder="은행명을 입력해주세요" id="reg_bank_name" maxlength="10"></div>' +
		'<div class="input_box"><label>계좌번호</label><input type="text" autocomplete="off" placeholder="계좌번호를 입력해주세요" id="reg_bank_number" maxlength="20"></div>' +
		'<div class="input_box"><label>계좌주</label><input type="text" autocomplete="off" placeholder="계좌주를 입력해주세요" id="reg_owner_name" maxlength="10"></div>' +
		'<div class="input_box"><label>연락처</label><input type="text" autocomplete="off" placeholder="연락처를 입력해주세요" id="reg_phone" maxlength="13" onKeyup="OnCheckPhone(this);"></div>' +
		'</div>' +
		'<div class="btn_wrap"><button type="button" class="btn left"><span>이전</span></button><button type="button" class="btn right"><span>다음</span></button></div>' +
		'</section>';
		$('.regist_container').html(tpl);

		// 이미 등록되어 있는 정보 설정
		if (bank) {
			$('#reg_bank_name').val(bank.bank_name);
			$('#reg_bank_number').val(bank.bank_number);
			$('#reg_owner_name').val(bank.owner_name);
			$('#reg_phone').val(bank.phone);
		}

		// 이전 버튼 클릭 이벤트
		document.querySelector('.setting_section .btn_wrap .btn.left').addEventListener('click', e => {
			_.init_progress();
		});

		// 다음 버튼 클릭 이벤트
		document.querySelector('.setting_section .btn_wrap .btn.right').addEventListener('click', e => {
			_.finish_progress();
		});
	}

	// 완료하기 화면 출력
	finish_progress() {
		const _ = this;

		let reg_bank_name = $('#reg_bank_name').val();
		if (!reg_bank_name) {
			ncuim_modal_show('은행명이 설정되지 않았습니다.');
			return;
		}
		let reg_bank_number = $('#reg_bank_number').val();
		if (!reg_bank_number) {
			ncuim_modal_show('계좌번호가 설정되지 않았습니다.');
			return;
		}
		let reg_owner_name = $('#reg_owner_name').val();
		if (!reg_owner_name) {
			ncuim_modal_show('계좌주가 설정되지 않았습니다.');
			return;
		}
		let reg_phone = $('#reg_phone').val();
		if (!reg_phone || reg_phone.length != 13) {
			ncuim_modal_show('연락처가 설정되지 않았습니다.');
			return;
		}

		if (bank 
			&& reg_bank_name == bank.bank_name 
			&& reg_bank_number == bank.bank_number
			&& reg_owner_name == bank.owner_name
			&& reg_phone == bank.phone) {
			ncuim_modal_show('변경된 데이터가 없습니다.');
			return;
		}

		_.param.bank_name = reg_bank_name;
		_.param.bank_number = reg_bank_number;
		_.param.owner_name = reg_owner_name;
		_.param.phone = reg_phone;

		let tpl = `<section class="finish_section">` +
		`<div class="message_area"><p>${!bank ? `정보를 확인 후 등록 버튼을 눌러주세요.` : `정보를 확인 후 변경 버튼을 눌러주세요.`}</p></div>` +
		`<div class="finish_area">` +
		`<div class="seller_bank txt">은행: <span>${_.param.bank_name}</span></div>` +
		`<div class="seller_bank_number txt">계좌번호: <span>${_.param.bank_number}</span></div>` +
		`<div class="seller_banker txt">계좌주: <span>${_.param.owner_name}</span></div>` +
		`<div class="seller_phone txt">연락처: <span>${_.param.phone}</span></div>` +
		`</div>` +
		`<div class="btn_wrap"><button type="button" class="btn left"><span>이전</span></button><button type="button" class="btn right"><span>${!bank ? `등록` : `변경`}</span></button></div>` +
		`</section>`;
		$('.regist_container').html(tpl);

		// 이전 버튼 클릭 이벤트
		document.querySelector('.finish_section .btn_wrap .btn.left').addEventListener('click', e => {
			_.setting_progress();
		});

		// 다음 버튼 클릭 이벤트
		document.querySelector('.finish_section .btn_wrap .btn.right').addEventListener('click', e => {
			_.regist();
		});
	}

	regist() {
		const _ = this;

		if (_.regist_lock) {
			return;
		}
	
		_.regist_lock = true;
		getDatasWithOption([{
			type: 'POST',
			url: '/define/bank/regist',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: _.param
		}], (data) => {
			switch (data) {
			case 1:
				ncuim_modal_show( (!bank ? '정상적으로 등록되었습니다.' : '정상적으로 변경되었습니다.'), null, 'window.opener.location.reload();window.self.close();' );
				break;
			case 2:
				ncuim_modal_show('계정을 찾을 수 없습니다.');
				break;
			default:
				ncuim_modal_show( (!bank ? '등록에 실패하였습니다.' : '변경에 실패하였습니다.') );
				break;
			}
			_.regist_lock = false;// 해재
		}, (data) => {
			_.regist_lock = false;// 해재
		});
	}
}

Bank.instance;