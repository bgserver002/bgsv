/*!
 * project : signin
 * author : LINOFFICE
 * 계정 로그인 페이지
 */

let signin_singleton = null;
let signin_singletonEnforcer = 'singletonEnforcer';
class Signin {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== signin_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!signin_singleton) signin_singleton = new Signin(signin_singletonEnforcer);
		return signin_singleton;
	}

	init() {
		this.input_email = $('.input-email #login_name');
		this.input_pwd = $('.input-pwd #password');
		this.message_email = $('.input-email .msg');
		this.message_pwd = $('.input-pwd .msg');
		this.btnLogin = document.querySelector('#btnPlayncLogin');

		this.login_sync = false;

		this.addEvents();
	}

	login(url) {
		if (!this.input_email.val()) {
			this.message_email.text('아이디를 입력해주세요.');
			this.input_email.focus();
			return;
		}
		if (!this.input_pwd.val()) {
			this.message_pwd.text('비밀번호를 입력해주세요.');
			this.input_pwd.focus();
			return;
		}

		if (this.login_sync) {
			return;
		}
		this.login_sync = true;
		const sendData = {
			'loginname' : this.input_email.val(),
			'password' : this.input_pwd.val()
		};
		getDatasWithOption([{
			type: 'POST',
			url: '/define/account/loginReCheck',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: sendData
		}], (data) => {
			this.login_sync = false;
			if (!data) {
				this.message_email.text('등록하지 않은 아이디이거나 비밀번호가 일치하지 않습니다.');
			} else {
				location.href = !url ? '/' : url;
			}
		}, (data) => {
			this.login_sync = false;
			throw new Error("loginCheck from account.js Error");
		});
	}

	keyup(obj) {
		const val = $(obj).val();
		if ($(obj).focus()) {
			if (!val) {
				$(obj).closest('div').find('.btn-delete').css('display', 'none');
			} else {
				$(obj).closest('div').find('.btn-delete').css('display', 'inline');
				$(obj).closest('div').find('.msg').text('');
			}
		}
	
		$(obj).focus(function() {
			$(obj).closest('div').find('.btn-delete').css('display', !val ? 'none' : 'inline');
		});
	}

	addEvents() {
		const _ = this;

		this.input_email.on('keyup', function(e) {
			_.keyup($(this))
		});

		this.input_pwd.on('keyup', function(e) {
			_.keyup($(this))
		});
		
		this.btnLogin.addEventListener('click', e => {
			_.login(this.btnLogin.getAttribute('data-url'));
		});

		const keypad = $('.keypad');
		const keypadBtn = $('.keypad-btn');
		const contents = $('.contents');
		keypadBtn.on('click', function(event) {
			$(this).toggleClass('on');
			if (contents.hasClass('moveDown')) {
				contents.removeClass('moveDown');
				contents.addClass('moveUp');
				keypad.removeClass('moveShow');
				keypad.addClass('moveHide');
			} else {
				contents.removeClass('moveUp');
				contents.addClass('moveDown');
				keypad.removeClass('moveHide');
				keypad.addClass('moveShow');
			}
		});
	
		$('.btn-delete').on('click', function(event) {
			const del = $(this).closest('div').find('input');
			del.val('');
			$(this).css('display', 'none');
		});

		$(window).resize(function (){
			let width_size = window.outerWidth;
			if (width_size > 972) {
				keypadBtn.removeClass('on');
				contents.removeClass('moveDown');
				keypad.removeClass('moveShow');
			}
		})
	}
}

Signin.instance;