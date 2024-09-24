/*!
 * project : coupon
 * author : LINOFFICE
 * 쿠폰함
 */

if (!account) {
	window.self.close();// 폼 종료
}

let coupon_singleton = null;
let coupon_singletonEnforcer = 'singletonEnforcer';
class Coupon {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== coupon_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!coupon_singleton) coupon_singleton = new Coupon(coupon_singletonEnforcer);
		return coupon_singleton;
	}

	// 초기 설정
	init() {
		const _ = this;

		_.enable_coupons = [];
		_.disable_coupons = [];
		_.coupon_sync = false;

		_.wrap_present = $('.list_coupon.present');
		_.wrap_msg = $('.list_msg');
		_.wrap_past = $('.list_coupon.past');
		_.no_coupon = $('.no_coupon');

		_.setInstance();
		
		_.addEvents();
	}

	setInstance() {
		const _ = this;

		const coupon_size = !account.coupons ? 0 : account.coupons.length;
		if (coupon_size) {
			let tpl_enable = '';
			let tpl_disable = '';
			$.each(account.coupons, function(key, item){
				const expire_time = item.expireTime;
				if (item.useTime) {// 사용 완료
					_.disable_coupons.push(item);
					tpl_disable += `<li><div class="coupon_info"><div class="coupon_info_content"><div class="flag lin"><span class="txt">리니지</span></div> <div class="info"><em class="tit">${_.get_title(item)}</em> <span class="sub">[리니지] ${item.descrption}</span></div></div> <div class="stamp complete"><span class="v_align"><em>사용완료</em> <time>${moment(new Date(item.useTime)).format('YYYY.MM.DD')}</time></span></div></div></li>`;
				} else if (expire_time && getTime >= new Date(expire_time).getTime()) {// 사용 기간 만료
					_.disable_coupons.push(item);
					tpl_disable += `<li><div class="coupon_info"><div class="coupon_info_content"><div class="flag lin"><span class="txt">리니지</span></div> <div class="info"><em class="tit">${_.get_title(item)}</em> <span class="sub">[리니지] ${item.descrption}</span></div></div> <div class="stamp expire"><span class="v_align"><em>기간만료</em> <time>${moment(new Date(expire_time)).format('YYYY.MM.DD')}</time></span></div></div></li>`;
				} else {
					_.enable_coupons.push(item);
					tpl_enable += `<li><div class="btn_area"><button class="btn btn_use" data-id="${item.number}"><em>사용하기</em></button></div><div class="coupon_info"><div class="coupon_info_content"><div class="flag lin"><span class="txt">리니지</span></div> <div class="info"><em class="tit">${_.get_title(item)}</em> <span class="sub">[리니지] ${item.descrption}</span></div><div class="time_area"><time>${moment(new Date(item.enableTime)).format('YYYY.MM.DD')}</time> ~ <time>${!expire_time ? `` : moment(new Date(expire_time)).format('YYYY.MM.DD')}</time></div><button type="button" class="btn_detail" data-id="${item.number}"><span>쿠폰 상세 정보</span></button></div></div></li>`;
				}
			});

			_.wrap_present.html(tpl_enable);
			_.wrap_past.html(tpl_disable);

			// 상세 보기 버튼 클릭 이벤트
			$('.list_coupon.present .btn_area .btn_detail').on('click', function(e) {
				_.open_modal_detail($(this).attr('data-id'));
			});

			// 사용 하기 버튼 클릭 이벤트
			$('.list_coupon.present .btn_area .btn_use').on('click', function(e) {
				_.use_coupon_confirm($(this).attr('data-id'));
			});
		}

		$('.coupon_list_wrap .coupon_count .num').text(_.enable_coupons.length);
		if (!_.enable_coupons.length) {
			_.no_coupon.css('display', '');
		} else {
			_.wrap_present.css('display', '');
		}
	}

	get_title(item) {
		const _ = this;

		switch (item.itemId) {
		case 0:
			return 'NCOIN 쿠폰';
		case -1:
			return 'NPOINT 쿠폰';
		default:
			return '아이템 쿠폰';
		}
	}

	// 쿠폰 등록
	regist_coupon() {
		const _ = this;

		if (_.coupon_sync) {
			return;
		}
		const coupon_number = $('.coupon_register input').val();
		if (!coupon_number) {
			_.open_modal('쿠폰 번호를 입력해 주시기 바랍니다.', false);
			return;
		}
		if (coupon_number.length != 12) {
			_.open_modal('쿠폰번호가 올바르지 않습니다.', false);
			return;
		}
		if (!account) {
			_.open_modal('계정을 찾을 수 없습니다.', false);
			return;
		}
		_.coupon_sync	= true;// 잠금
		const senddata	= { 'number' : coupon_number.toUpperCase() };
		getDatasWithOption([{
			type: 'POST',
			url: '/define/coupon/regist',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: senddata
		}], (data) => {
			switch(data){
			case 1:
				_.open_modal('정상적으로 등록되었습니다.', true);
				break;
			case 2:
				_.open_modal('계정을 찾을 수 없습니다.', false);
				break;
			case 3:
				_.open_modal('대표 캐릭터를 찾을 수 없습니다.', false);
				break;
			case 4:
				_.open_modal('10회 이상 실패하여 24시간 등록 제한되었습니다.', false);
				break;
			case 5:
				_.open_modal('일치하는 쿠폰번호가 없습니다.', false);
				break;
			case 6:
				_.open_modal('이미 사용이 완료된 쿠폰입니다.', false);
				break;
			case 7:
				_.open_modal('사용할 수 있는 기간이 아닙니다.', false);
				break;
			case 8:
				_.open_modal('기간이 지난 쿠폰입니다.', false);
				break;
			default:
				_.open_modal('등록에 실패하였습니다.', false);
				break;
			}
			_.coupon_sync = false;// 해재
		}, (data) => {
			_.coupon_sync = false;// 해재
		});
	}

	// 쿠폰 사용 컨펌
	use_coupon_confirm(coupon_number) {
		const _ = this;

		if (!account) {
			_.open_modal('계정을 찾을 수 없습니다.', false);
			return;
		}
		if (!account.ingame) {
			_.open_modal('인게임에서 사용할 수 있습니다.', false);
			return;
		}
		popupShow('정말로 사용하시겠습니까?', `<span class="type2" id="use_coupon_btn"><a class="close">예</a></span>`, `<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>`);

		document.querySelector('#use_coupon_btn').addEventListener('click', e => {
			_.use_coupon(coupon_number);
		});
	}

	// 쿠폰 사용
	use_coupon(coupon_number) {
		const _ = this;

		if (_.coupon_sync) {
			return;
		}
		_.coupon_sync	= true;// 잠금
		const senddata	= { "number" : coupon_number.toUpperCase() };
		getDatasWithOption([{
			type: 'POST',
			url: '/define/coupon/use',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: senddata
		}], (data) => {
			switch(data){
			case 1:
				_.open_modal('쿠폰 사용이 완료되었습니다.', true);
				break;
			case 2:
				_.open_modal('인게임에서 사용할 수 있습니다.', false);
				break;
			case 3:
				_.open_modal('계정을 찾을 수 없습니다.', false);
				break;
			case 4:
				_.open_modal('대표 캐릭터를 찾을 수 없습니다.', false);
				break;
			case 5:
				_.open_modal('인게임 내 캐릭터를 찾을 수 없습니다.', false);
				break;
			case 6:
				_.open_modal('일치하는 쿠폰번호가 없습니다.', false);
				break;
			case 7:
				_.open_modal('이미 사용이 완료된 쿠폰입니다.', false);
				break;
			case 8:
				_.open_modal('사용할 수 있는 기간이 아닙니다.', false);
				break;
			case 9:
				_.open_modal('소유중인 쿠폰이 아닙니다.', false);
				break;
			case 10:
				_.open_modal('디비 등록에 실패하였습니다.', false);
				break;
			case 11:
				_.open_modal('부가서비스 창고에 아이템을 생성하지 못하였습니다.', false);
				break;
			default:
				_.open_modal('등록에 실패하였습니다.', false);
				break;
			}
			_.coupon_sync = false;// 해재
		}, (data) => {
			_.coupon_sync = false;// 해재
		});
	}

	// 쿠폰 삭제 컨펌
	delete_coupon_confirm(coupon_number) {
		const _ = this;

		if (!account) {
			_.open_modal('계정을 찾을 수 없습니다.', false);
			return;
		}
		popupShow('정말로 삭제하시겠습니까?', `<span class="type2" id="delete_coupon_btn"><a class="close">예</a></span>`, `<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>`);

		document.querySelector('#delete_coupon_btn').addEventListener('click', e => {
			_.delete_coupon(coupon_number);
		});
	}

	// 쿠폰 삭제
	delete_coupon(coupon_number) {
		const _ = this;

		if (_.coupon_sync) {
			return;
		}
		_.coupon_sync	= true;// 잠금
		const senddata	= { "number" : coupon_number.toUpperCase() };
		getDatasWithOption([{
			type: 'POST',
			url: '/define/coupon/delete',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: senddata
		}], (data) => {
			switch(data){
			case 1:
				_.open_modal('쿠폰 삭제가 완료되었습니다.', true);
				break;
			case 2:
				_.open_modal('계정을 찾을 수 없습니다.', false);
				break;
			case 3:
				_.open_modal('일치하는 쿠폰번호가 없습니다.', false);
				break;
			case 4:
				_.open_modal('소유중인 쿠폰이 아닙니다.', false);
				break;
			case 5:
				_.open_modal('디비 삭제에 실패하였습니다.', false);
				break;
			default:
				_.open_modal('삭제에 실패하였습니다.', false);
				break;
			}
			_.coupon_sync = false;// 해재
		}, (data) => {
			_.coupon_sync = false;// 해재
		});
	}

	// 모달 제거
	delete_modal(reload) {
		const _ = this;

		$('#ModalLayer').remove();
		if (reload) {
			location.reload();
		}
	}

	// 모달 출력
	open_modal(message, reload) {
		const _ = this;

		const tpl_modal = `<div id="ModalLayer" class="modal_layer coupon_alert"><div class="dimmed_area"></div><div class="modal_wrap"><div class="content_wrapper">` +
			`<div class="modal_content"><div class="content_area"><div class="box"><p>${message}</p></div></div></div>` +
			`<div class="modal_btn"><span class="btn_area apply"><button class="apply"><span>확인</span></button></span></div></div></div></div>`;
		$('#app').append(tpl_modal);

		document.querySelector('#ModalLayer .btn_area.apply .apply').addEventListener('click', e => {
			_.delete_modal(reload);
		});
	}

	// 모달 출력(쿠폰 상세 정보)
	open_modal_detail(number) {
		const _ = this;

		let item = null;
		for (var i=0; i<_.enable_coupons.length; i++) {
			if (_.enable_coupons[i].number == number) {
				item = _.enable_coupons[i];
				break;
			}
		}
		if (!item) {
			return;
		}
		const expire_time = item.expireTime;
		const tpl_modal = `<div id="ModalLayer" class="modal_layer modalInfo coupon_modal"><div class="dimmed_area"></div><div class="modal_wrap" style="max-width: 440px;"><div class="wrap_box"><div class="box_content"><div class="modal_header"><h3>쿠폰정보</h3></div>` +
			`<button class="btn_close"><span>닫기</span></button>` +
			`<div class="modal_scroll_wrap scrollbar-macosx"><div class="scroll_area"><div id="ModalCouponInfo" class="modal_coupon_info"><div class="modal_coupon_card lin"><div class="card_content"><span class="icon"></span>` +
			`<em class="c_tit">${_.get_title(item)}</em>` +
			`<span class="c_dsc">${item.descrption}</span></div>` +
			`<div class="card_sub"><span>${moment(new Date(item.enableTime)).format('YYYY.MM.DD')} ~ ${!expire_time ? `` : moment(new Date(expire_time)).format('YYYY.MM.DD')}</span></div></div>` +
			`<h3 class="sub_tit">혜택내용 : 상품지급</h3><div class="coupon_select_info"><div class="select_header"><span>선택 가능 수량 : <span class="count">전체</span></span></div>` +
			`<ul class="info_box lst_select"><li><span>${item.descrption}</span></li></ul></div></div></div></div><div class="modal_btn"><div id="ModalCouponBtn" class="modal_coupon_btn">` +
			`<button type="button" class="btn delete"><span>삭제</span></button><div class="coupon_btn_area"><button type="button" class="btn use"><em>사용하기</em></button></div></div></div></div></div></div></div>`;
		$('#app').append(tpl_modal);

		// 상세 정보 닫기 버튼 클릭 이벤트
		document.querySelector('#ModalLayer .btn_close').addEventListener('click', e => {
			_.delete_modal(false);
		});

		// 사용하기 버튼 클릭 이벤트
		document.querySelector('#ModalLayer .coupon_btn_area .btn.use').addEventListener('click', e => {
			_.delete_modal(false);
			_.use_coupon_confirm(number);
		});

		// 삭제하기 버튼 클릭 이벤트
		document.querySelector('#ModalLayer .btn.delete').addEventListener('click', e => {
			_.delete_modal(false);
			_.delete_coupon_confirm(number);
		});

		$('#ModalLayer .scrollbar-macosx').scrollbar();
	}

	addEvents() {
		const _ = this;

		_.btn_tabs = $('.coupon_list_wrap .coupon_count button');

		// 탭 클릭 이벤트
		_.btn_tabs.on('click', function(e) {
			const tab = $(this);
			if (!tab.hasClass('on')) {
				_.btn_tabs.removeClass('on');
				tab.addClass('on');
				if (tab.children('span').text() === '과거이력') {
					_.wrap_present.css('display', 'none');
					_.no_coupon.css('display', 'none');
					_.wrap_msg.css('display', '');
					_.wrap_past.css('display', '');
				} else {
					_.wrap_msg.css('display', 'none');
					_.wrap_past.css('display', 'none');
					if (!_.enable_coupons.length) {
						_.no_coupon.css('display', '');
					} else {
						_.wrap_present.css('display', '');
					}
				}
			}
		});

		// 쿠폰 등록 버튼 클릭 이벤트
		document.querySelector('.coupon_register .input_area .btn_register').addEventListener('click', e => {
			_.regist_coupon();
		});

		// 닫기 버튼 클릭 이벤트
		document.querySelector('.wrap header .btn_close').addEventListener('click', e => {
			window.self.close();
		});

		// 스크롤바 활성화
		$('.scrollbar-macosx').scrollbar();
	}
}

Coupon.instance;