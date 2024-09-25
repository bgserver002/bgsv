/*!
 * project : init
 * author : LINOFFICE
 * 디바이스 환경 및 최초 스크립트 설정
 */

// 인게임 디바이스일때 계정 검증이 안되면 담당 페이지로 강제 이동
if (isIngame && !account) {
	location.href = '/login_ingame';
}

// 런처 디바이스 내장 함수 설정
if (isLauncher) {
	// 크로미움 boundAsync 객채로 처리(예: boundAsync.logout(); 호출 -> 런처 폼 변경)
	// 런처 암호화 처리시 내장 함수명이 변경되므로 사용 불가
	//CefSharp.BindObjectAsync("boundAsync");
}

// 마우스 오른쪽 막기
document.addEventListener('contextmenu', event => event.preventDefault());

$('body').addClass(device);

let header_main = null;



// 패널 클래스
let dim_singleton = null;
let dim_singletonEnforcer = 'singletonEnforcer';
class Dimmed {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== dim_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!dim_singleton) dim_singleton = new Dimmed(dim_singletonEnforcer);
		return dim_singleton;
	}

	// 초기 설정
	init() {
		this.dimmed = document.querySelector('#nc-cnb .ncc-dimmed');

		if (!this.dimmed) {
			document.querySelector('#nc-cnb').insertAdjacentHTML('beforeend', '<div class="ncc-dimmed"></div>');
			this.dimmed = document.querySelector('#nc-cnb .ncc-dimmed');
		}

		['touchstart', 'touchmove', 'touchend'].forEach(eventType => {
			this.dimmed.addEventListener(eventType, e => {
				e.stopPropagation();
			});
		});

		this.dimmed.addEventListener('click', e => {
			this.openClose(false);
			return false;
		});

		this.addEvents();
	}

	// 패널 열기, 닫기 이벤트
	openClose(_isOpen = true, _posi = 'left') {
		const body = document.querySelector('body');

		if (_isOpen) {
			const panel = document.querySelector(`.ncc-${_posi}-panel`);

			if (panel && panel.classList) {
				panel.classList.add('is-active');
			}
			if (this.dimmed && this.dimmed.classList) {
				this.dimmed.classList.add('is-active-' + _posi);
			}

			body.style.width = '100%';
			body.style.position = 'fixed';
			body.style.marginTop = `-${body.scrollTop}px`;
		} else {
			const panels = document.querySelectorAll('.ncc-left-panel, .ncc-right-panel, .ncc-character-panel');
			const lnbTitle = document.querySelector('.ncc-lnb-title--item');

			if (panels) {
				panels.forEach(v => {
					if (v && v.classList) {
						v.classList.remove('is-active');
					}
				});
			}
			if (this.dimmed && this.dimmed.classList) {
				this.dimmed.classList.remove(['is-active-left', 'is-active-right', 'is-active-title-submenu']);
			}

			if(lnbTitle) {
				lnbTitle.style.display = 'none';
			}

			let mTop = Math.abs(body.style.marginTop.replace('px', ''));
			body.setAttribute('style', '');
			body.scrollTo(0, mTop);
		}

		if(_isOpen) {
			if (body.classList) {
				body.classList.add('ncc-dimmed');
			}
		} else {
			if (body.classList) {
				body.classList.remove('ncc-dimmed');
			}
		}

		this.dimmed.dispatchEvent(new CustomEvent('open', {
			detail: {
				show: _isOpen,
				pos: _posi
			}
		}));
	}

	// 이벤트 설정
	addEvents() {
		const _ = this;

		_.leftOpen = document.querySelector('.ncc-ncservice-btn');
		_.leftClose = document.querySelector('.ncc-left-panel-close');
		_.rightOpen = document.querySelector('.ncc-login--after');
		_.rightClose = document.querySelector('.ncc-right-panel-close');

		// 왼쪽 패널 이벤트
		if (_.leftOpen) {
			_.leftOpen.addEventListener('click', e => {
				_.openClose(true, 'left');
			});
		}
		if (_.leftClose) {
			_.leftClose.addEventListener('click', e => {
				_.openClose(false, 'left');
			});
		}

		// 오른쪽 패널 이벤트
		if (_.rightOpen) {
			_.rightOpen.addEventListener('click', e => {
				_.openClose(true, 'right');
			});
		}
		if (_.rightClose) {
			_.rightClose.addEventListener('click', e => {
				_.openClose(false, 'right');
			});
		}
	}
}



// 검색 자동 제안 클래스
class SearchAutoSuggest {
	// 생성자
	constructor(_option) {
		if (!_option) {
			return;
		}
		this.option = _option;
		this.parent = document.querySelector(this.option.selector);
		if (!this.parent) {
			return;
		}
		this.loadedKeyword = '';
		this.dataBaseKeyword = '';
		this.isValueFunctionText = '';
		this.apiUrl = '/define/suggest';// live api url : https://searchsuggest.plaync.com/suggest/lineage/v1.0/lineage?query={0}&page_size={1}, CORS 보안에 의해 같은 서버에서 호출되어야 사용가능
		this.suggestWrap = this.parent.querySelector("[data-name='suggest_wrap']");
		this.input = this.parent.querySelector("[data-name='suggest_input']");
		this.submitBtn = this.parent.querySelector("[data-name='suggest_submit']");
		this.deleteBtn = this.parent.querySelector("[data-name='suggest_delete']");
		this.resultUL = this.parent.querySelector("[data-name='suggest_scroll'] ul");
		this.REALTIME_INPUT_CHECK_INTERVAL = 100;// 인풋 실시간 검증 주기

		if (this.suggestWrap) {
			this.suggestWrap.style.display = 'none';
		}
		if (this.deleteBtn) {
			this.deleteBtn.style.display = 'none';
		}

		this.addEvents();
	}

	setInputValue(val) {
		if (this.input) {
			this.input.value = val;
		}
	}

	getIndex(el) {
		if (!el) return -1;

		let i = 0;
		while (el = el.previousElementSibling) {
			i++;
		}
		return i;
	}

	setDisplay(target, isForceDisplay) {
		if (target) {
			target.style.display = isForceDisplay ? 'block' : 'none';
		}
	}

	// 데이터 로드
	load(_newKeyword) {
		this.loadedKeyword = _newKeyword;
		if (!this.loadedKeyword) {
			return;
		}

		// 세션에 검색 결과를 등록하여 브라우저에서 처리되도록 추가
		const query = encodeURIComponent(this.loadedKeyword);
		const session_key = `SEARCH_AUTO_SUGGEST_LIST_${query}`;
		const session_val = getSession(session_key);
		const search_auto_suggest_list = session_val ? JSON.parse(session_val) : null;
		if (search_auto_suggest_list != null && search_auto_suggest_list != undefined) {
			this.drawList(search_auto_suggest_list);
			return;
		}

		// REST API 호출
		fetch(`${this.apiUrl}?query=${query}&page_size=${this.option.size}&type=${!this.option.type ? '0' : this.option.type}`, {
			method: 'GET',
			credentials: 'include'
			})
			.then(res => res.json())
			.then(res => { setSession(session_key, typeof res === 'object' ? JSON.stringify(res) : res); this.drawList(res) })
			.catch(e => console.log('::::::::::fail::::::::::', e));
	}

	// 이벤트 추가
	addEvents() {
		const keyEventType = isIngame ? 'keypress' : 'keydown';
		// 키보드 키에 의한 이벤트
		this.input.addEventListener(keyEventType, (e) => {
			const keyCode = e.keyCode;
			const activeKeyCode = [27, 13, 9, 40, 38];
			if (!activeKeyCode.includes(keyCode)) {
				return;
			}

			switch(keyCode) {
			case 27: // ESC
				this.setInputValue(this.loadedKeyword);
				this.suggestWrapToggle(false);
				break;
			case 13: // Enter
				this.submitGo();
				break;
			case 9: // Tab
				this.focusChange(!e.shiftKey ? 1 : -1);
				break;
 			case 40: // ↓
 				this.focusChange(1);
				break;
			case 38: // ↑
				this.focusChange(-1);
				break;
			}

			e.preventDefault();
			return false;
		});

		// 인풋에서 포커스가 해제될때 이벤트
		this.input.addEventListener('focusout', e => {
			setTimeout(() => this.suggestWrapToggle(false), 150);
			if(this.sto) {
				clearTimeout(this.sto);
				this.sto = null;
			}
		});


		const resultLi = this.resultUL.querySelectorAll('li');
		// 인풋에 포커스가 적용될때 이벤트
		this.input.addEventListener('focusin', e => {
			this.isValueFunctionText = '';
			if (!this.sto) this.realTimeInputCheck();
			if (resultLi.length) this.suggestWrapToggle(true);
		});

		// 검색 이동 이벤트
		this.submitBtn.addEventListener('click', e => this.submitGo());

		// 초기화 버튼 클릭 이벤트
		this.deleteBtn.addEventListener('click', e => {
			this.loadedKeyword = '';
			this.setInputValue('');
			this.input.focus();
		});

		this.listClickCallbackBind = this.listClickCallback.bind(this);
		this.listMouseOverCallbackBind = this.listMouseOverCallback.bind(this);
	}

	// 인풋 값 실시간 검증
	realTimeInputCheck() {
		if (this.sto) {
			clearTimeout(this.sto);
			this.sto = null;
		}

		const inputValue = this.input.value;
		const inputTxt = inputValue.trim();

		// 문자열이 있나?
		if (inputTxt) {
			// 바로 앞에서 api 호출한 문자열 인가?
			// 화살표 이동을 통해 입력된 문자열 인가?
			if (this.loadedKeyword !== inputTxt && this.dataBaseKeyword !== inputTxt && this.isValueFunctionText !== inputTxt) {
				this.load(inputTxt);
				this.isValueFunctionText = '';
			}
		} else {
			if (this.loadedKeyword != '') {
				setTimeout(() => {
					if (this.input.value.trim()) return;
					this.loadedKeyword = '';
				}, this.REALTIME_INPUT_CHECK_INTERVAL);
			}
			if (this.resultUL.hasChildNodes()) {
				setTimeout(() => {
					this.resultUL.innerHTML = '';
					this.suggestWrapToggle(false);
				}, this.REALTIME_INPUT_CHECK_INTERVAL);
			}
		}

		this.deleteBtnToggle(inputTxt);
		this.sto = setTimeout(() => this.realTimeInputCheck(), this.REALTIME_INPUT_CHECK_INTERVAL);
	}

	// 초기화 버튼 클릭 이벤트
	deleteBtnToggle(inputTxt = '') {
		if (!this.option.useDelbtn) return false;

		if (inputTxt) {
			if (!this.deleteBtnIsShow) {
				if (this.deleteBtn) {
					this.deleteBtn.style.display = 'block';
				}
				this.deleteBtnIsShow = true;
			}
		} else {
			if (this.deleteBtnIsShow) {
				if (this.deleteBtn) {
					this.deleteBtn.style.display = 'none';
				}
				this.deleteBtnIsShow = false;
			}
		}
	}

	// 검색 목록 출력
	drawList(_data) {
		if (!_data || !this.input.value.trim()) return; // 인풋에 문자열 없으면 데이터가 들어와도 보여주지 않는다.

		let resultList = _data;
		this.suggestWrapToggle(resultList.length > 0);
		this.listRemoveEvent();

		let list = '';
		if (resultList.length) {
			let reg = new RegExp(this.loadedKeyword, 'i');
			list = resultList.map((item, idx) => {
				const regStr = reg.exec(item);
				const str = item.replace(regStr, `<mark>${regStr}</mark>`);
				return `<li data-idx="${idx}" data-keyword="${item}">${str}</li>`;
			}).join('');
		}
		if (this.resultUL) {
			this.resultUL.innerHTML = list;
		}
		this.listAddEvent();
	}

	// 목록 이벤트 제거
	listRemoveEvent() {
		this.parent.querySelectorAll("[data-name='suggest_scroll'] ul li").forEach(li => {
			li.removeEventListener('click', this.listClickCallbackBind);
			li.removeEventListener('mouseover', this.listMouseOverCallbackBind);
		});
	}

	// 목록 이벤트 추가
	listAddEvent() {
		this.parent.querySelectorAll("[data-name='suggest_scroll'] ul li").forEach(li => {
			li.addEventListener('click', this.listClickCallbackBind);
			li.addEventListener('mouseover', this.listMouseOverCallbackBind);
		});
	}

	// 목록 클릭 콜백 이벤트
	listClickCallback(e) {
		const keyword = e.currentTarget.dataset.keyword || '';

		this.setInputValue(keyword);
		this.submitGo();
	}

	// 마우스가 벗어날때 이벤트
	listMouseOverCallback(e) {
		const target = e.currentTarget;
		const parent = target.parentElement;
		const prevFocus = parent.querySelector("li.focus");
        		
		if (prevFocus && prevFocus.classList) {
			prevFocus.classList.remove('focus');
		}
		if (target && target.classList) {
			target.classList.add('focus');
		}
	}

	// 목록내 포커스 변경 이벤트
	focusChange(_direction = 1) {
		const resultLi = this.resultUL.querySelectorAll('li');
		const resultLiLength = resultLi.length;
		const oldFocusEl = this.resultUL.querySelector('.focus');
		let focusIndex = this.getIndex(oldFocusEl) + (_direction === 1 ? 1 : -1);
		let newFocusEl;

		focusIndex = focusIndex < 0 ? resultLiLength : (focusIndex > resultLiLength ? 0 : focusIndex);
		newFocusEl = resultLi[focusIndex];

		if (oldFocusEl && oldFocusEl.classList) {
			oldFocusEl.classList.remove('focus');
		}
		this.suggestWrapToggle(!!newFocusEl);

		if (newFocusEl) {
			newFocusEl.focus();
			if (newFocusEl.classList) {
				newFocusEl.classList.add('focus');
			}
			this.dataBaseKeyword = newFocusEl.dataset.keyword;
			this.setInputValue(this.dataBaseKeyword);
		}
	}

	// 검색 이동 이벤트
	submitGo() {
		const inputVal = this.input.value.trim();
		this.suggestWrapToggle(false);
		if (inputVal !== '') {
			this.parent.action = this.option.action;
			this.parent.submit();
		}
	}

	// 목록에서 선택된 항목 최상단 출력
	suggestWrapToggle(_isShow = true) {
		this.setDisplay(this.suggestWrap, _isShow);
		if (!_isShow) {
			this.resultUL.querySelectorAll('li').forEach(li => li.classList.remove('focus') );
		}
	}

	// public ---------------------------------------------------------------------
	changeAddParam(_param) {
		this.option.addParam = _param;
	}

	value(_txt) {
		this.isValueFunctionText = _txt;
		this.setInputValue(_txt);
	}
}



// 통합 검색 클래스
class Search {
	// 생성자
	constructor() {
		this.parent = document.querySelector('.ncc-search.ncc-search--right-pc');
		if (!this.parent) {
			return;
		}
		this.parent.innerHTML = this.template();

		// 자동 제안 생성
		this.searchAutoSuggest = create_auto_suggest({
			selector: '#nccSuggestForm',
			size: 5,
			action: '/search',
			useDelbtn: true,
			type: '0'
		});

		if (!this.searchAutoSuggest) {
			return;
		}

		this.init();
	}

	// 초기 설정
	init() {
		this.showSearchBar = false;

		document.querySelector('.ncc-search').addEventListener('click', (e) => {
			e.stopPropagation();
		});

		document.querySelectorAll('.ncc-search legend, .ncc-search-mobile__btn').forEach((v) => {
			v.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.showSearchField();
			});
		});

		document.querySelector('.ncc-search-close').addEventListener('click', (e) => {
			e.preventDefault();
			this.hideSearchField();
			return false;
		});

		// dom click handler (add/remove) - 동일한 콜백함수로 remove 해야하므로
		this.domClickHandlerCall = (e) => this.domClickHandler.call(this, e);
	}

	// 템플레이트 생성
	template() {
		return `<fieldset>` +
			`<legend>Search</legend>` +
			`<div class="ncc-search-wrap">` +
				`<input class="ncc-search-close" type="button" value="취소" title="취소">` +
				`<form id="nccSuggestForm" name="nccSuggestForm" onsubmit="return false;">` +
					`<input id="nccSuggestInput" name="query" class="ncc-search-input" type="text" placeholder="통합검색" autocomplete="off" data-name="suggest_input">` +
					`<a href="#none" class="ncc-search-input-delete" onclick="return false;" value="X" title="삭제" data-name="suggest_delete" style="display: none;"></a>` +
					`<input id="nccSuggestSubmit" class="ncc-search-submit" type="button" value="GO" title="검색" data-name="suggest_submit">` +
					`<div id="nccSuggestWrap" class="ncc-suggest-list-wrap" data-name="suggest_wrap" style="display: none;"><div id="nccSuggestList" class="ncc-suggest-list" data-name="suggest_list"><div data-name="suggest_scroll"><ul></ul></div></div></div>` +
				`</form>` +
			`</div>` +
		`</fieldset>`;
	}

	// 초기화
	resetSearchField() {
		const input = document.querySelector('.ncc-search-input');
		const inputDelete = document.querySelector('.ncc-search-input-delete');

		if (input) input.value = '';
		if (inputDelete) inputDelete.style.display = 'none';
	}

	// 검색창 출력
	showSearchField() {
		if (this.showSearchBar) return;

		const search = document.querySelector('.ncc-search');
		const lnb = document.querySelector('.ncc-lnb');
		const input = document.querySelector('.ncc-search-input');

		if (search && search.classList) {
			search.classList.add('is-active');
		}
		if (lnb && lnb.classList) {
			lnb.classList.add('search-active');
		}

		if (input) {
			setTimeout(() => {
				input.click();
				input.focus();
			}, 300);
		}

		this.domClickEvent('add');
		this.showSearchBar = true;
	}

	// 검색창 감추기
	hideSearchField() {
		const search = document.querySelector('.ncc-search');
		const lnb = document.querySelector('.ncc-lnb');
		if (search && search.classList) {
			search.classList.remove('is-active');
		}
		if (lnb && lnb.classList) {
			lnb.classList.remove('search-active');
		}

		this.resetSearchField();
		this.domClickEvent('remove');
		this.showSearchBar = false;
	}

	// 다큐먼트 클릭 이벤트
	domClickEvent(type) {
		if (type === 'add') {
			document.addEventListener('click', this.domClickHandlerCall);
		} else {
			document.removeEventListener('click', this.domClickHandlerCall);
		}
	}

	// 다큐먼트 클릭 핸들러
	domClickHandler(e) {
		const $ncCnb = document.querySelector('#nc-cnb');
		const $target = e.target;

		if (!$ncCnb.contains($target)) {
			this.hideSearchField();
		}
	}

}




// 알림 클래스
class Noti {
	// 생성자
	constructor() {
		const _ = this;

		_.data = account.alimList;
		_.is_notice = _.data && _.data.length;
		_.is_sync = false;

		_.wrap = document.querySelector('.ncc-right-panel-wrap .ncc-noti-wrap');
	}

	// 초기 설정
	init() {
		const _ = this;

		_.setInstance();
		_.addEvents();

		return _;
	}

	// 인스턴스 생성
	setInstance() {
		const _ = this;

		let tpl = '';
		if (_.is_notice) {
			tpl = _.data.map( (item, i) => {
				return `<li class="on">` +
					`<div class="wrapNotice">` +
						`<a>` +
							`<p class="noticeMsg">${item.logContent}&nbsp;-&nbsp;${moment(new Date(item.insertTime)).format('YYYY-MM-DD')}</p>` +
							`<a class="notiDelBtn" data-id="${item.id}" title="삭제">삭제</a>` +
							`<div class="thumb"><img class="icon" src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/${item.type == 'NSHOP_BUY' ? 30005 : item.type == 'COUPON_USE' ? 30001 : item.type == 'NCOIN_GIFT' ? 30002 : item.type == 'CASH_CHARGE' ? 27011 : 27009}.png?${cacheVersion}" alt="nickname"></div>` +
						`</a>` +
					`</div>` + 
				`</li>`;
			}).join('');
		} else {
			tpl = `<li class="on"><div class="wrapNotice"><a href="javascript:;"><p class="noticeMsg">알림이 없습니다.</p><div class="thumb"><img class="icon" src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/27009.png?${cacheVersion}" alt="nickname"></div></a></div></li>`;
		}

		_.wrap.innerHTML = `<ul class="ncc-noti-tab">` +
			`<li class="is-active"><a onClick="return false;">알림 <span class="is-on" style="background-color: #dc4141; ${_.is_notice ? `` : `display: none;`}">${_.is_notice ? _.data.length : 0}</span></a></li>` +
			`<li><a>접속친구</a></li>` +
		`</ul>` + 
		`<div class="ncc-noti">` + 
			`<div class="ncc-noti-list" id="notiList"><div class="wrap_btns"><button class="imgBtn btnSetting">알림설정</button></div><ul>${tpl}</ul></div>` +
			`<div class="ncc-noti-setting" id="notiSetting" style="display: none;">` +
				`<header class="setAll"><input type="checkbox" id="-1" ${account.alimReceive ? `checked` : ``}><label for="-1">알림받기</label><p class="desc">서버에서 보내는 알림을 받습니다.</p></header>` +
				`<div class="wrap_btns"><button class="imgBtn btnApply">확인</button>&nbsp;<button class="imgBtn btnCancel">취소</button></div>` +
			`</div>` +
		`</div>`;
	}

	// 알림 삭제
	delete(id, obj) {
		const _ = this;

		if (_.is_sync) {
			return;
		}
		_.is_sync = true;
		getDatasWithOption([{
			type: 'POST',
			url: '/define/alim/delete',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: { 'id' : id }
		}], (data) => {
			$(obj).closest('li.on').remove();// 선택 태그 제거
			if (!data) {
				$('.ncc-noti-tab span').css('display', 'none');
				$('#notiList ul').append('<li class="on"><div class="wrapNotice"><a href="javascript:;"><p class="noticeMsg">알림이 없습니다.</p><div class="thumb"><img class="icon" src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/27009.png?${cacheVersion}" alt="nickname"></div></a></div></li>');
			} else {
				$('.ncc-noti-tab span').text(data);
			}
			_.is_sync = false;
		}, (data) => {
			_.is_sync = false;
			throw new Error("noti delete from init.js Error");
		});
	}

	// 알림 설정 적용
	setting() {
		const _ = this;

		const is_receive = $("#notiSetting input[type=checkbox]").prop("checked");
		if (is_receive == account.alimReceive) {
			return;
		}

		if (_.is_sync) {
			return;
		}
		_.is_sync = true;
		getDatasWithOption([{
			type: 'POST',
			url: '/define/alim/setting',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: { 'is_receive' : is_receive }
		}], (data) => {
			if (data) {
				account.alimReceive = is_receive;
			}
			_.is_sync = false;
		}, (data) => {
			_.is_sync = false;
			throw new Error("noti apply from init.js Error");
		});
	}

	// 이벤트 추가
	addEvents() {
		const _ = this;
		
		_.notiList = document.querySelector('#notiList');
		_.notiSetting = document.querySelector('#notiSetting');
		_.notiSettingButton = document.querySelector('#notiList .wrap_btns .btnSetting');
		_.notiApplyButton = document.querySelector('#notiSetting .wrap_btns .btnApply');
		_.notiCancelButton = document.querySelector('#notiSetting .wrap_btns .btnCancel');

		// 알림 설정 버튼 클릭 이벤트
		_.notiSettingButton.addEventListener('click', e => {
			_.notiList.style.display = 'none';
			_.notiSetting.style.display = '';
		});

		// 알림 설정 적용 버튼 클릭 이벤트
		_.notiApplyButton.addEventListener('click', e => {
			_.setting();
			_.notiSetting.style.display = 'none';
			_.notiList.style.display = '';
		});

		// 알림 설정 취소 버튼 클릭 이벤트
		_.notiCancelButton.addEventListener('click', e => {
			$("#notiSetting input[type=checkbox]").prop("checked", account.alimReceive);
			_.notiSetting.style.display = 'none';
			_.notiList.style.display = '';
		});
	
		// 알림 삭제 버튼 클릭 이벤트
		$('#notiList .wrapNotice .notiDelBtn').on('click', function(e) {
			_.delete($(this).attr('data-id'), $(this));
		});
	}

}



// 왼쪽 패널 클래스
class Left {
	// 생성자
	constructor(_tpl) {
		if (!_tpl) {
			return;
		}
		const _ = this;

		_.wrap = document.querySelector('.ncc-left-panel .ncc-lnb-list');
		if (!_.wrap) {
			return;
		}
		_.setInstance(_tpl);
	}

	setInstance(_tpl) {
		const _ = this;

		// 버튼 생성
		$('.ncc-gnb-wrap').prepend('<div class="ncc-gnb-wrap__bg"></div><a class="ncc-ncservice-btn">Open<span><i></i><i></i><i></i></span></a><a class="ncc-bi" data-type="image" href="/" target="_self"><span>리니지</span></a>');

		_.wrap.innerHTML = _tpl;
		$('.ncc-left-panel .ncc-ncservice .ncc-ncservice-item-plaync a > span').text(serverName);

		$('.ncc-left-panel .ncc-lnb-item, .ncc-left-panel .ncc-lnb-item .ncc-lnb-item__sub > li').hover(function(){
			$(this).addClass('is-over');
		}, function(){
			$(this).removeClass('is-over');
		});
	}
}



// 오른쪽 상단 로그인 정보 클래스
class Login {
	// 생성자
	constructor() {
		const _ = this;

		_.wrap = document.querySelector('#nc-cnb .is-child-nav .ncc-login');
		if (!_.wrap) {
			return;
		}
		_.init();
	}

	init() {
		const _ = this;

		if (!account) {
			_.wrap.innerHTML = `<div class="ncc-login--before"><a class="ncc-login__link ncc-login__link-login">로그인</a><a class="ncc-login__link ncc-login__link-join">${serverName}</a></div>`;

			_.login = document.querySelector('.ncc-login--before .ncc-login__link-login');
			_.login.addEventListener('click', e => {
				login();
				eventStop(e);
			});
			return;
		}

		_.wrap.innerHTML = !account.firstChar ? 
			`<div class="ncc-login--after"><div class="ncc-login--mobile"><button class="ncc-login--mobile-btn"><img src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/user_unkown.jpg?${cacheVersion}" class="ncc-login--info__thumb"></button><span class="ncc-login--info__noti"></span></div><div class="ncc-login--info"><a><img src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/user_unkown.jpg?${cacheVersion}" class="ncc-login--info__thumb"><span class="ncc-login--info__char">미설정</span><span class="ncc-login--info__server">${serverName}, 0Lv</span></a></div></div>` 
			: `<div class="ncc-login--after"><div class="ncc-login--mobile"><button class="ncc-login--mobile-btn"><img src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web${account.firstChar.profileUrl}?${cacheVersion}" class="ncc-login--info__thumb"></button><span class="ncc-login--info__noti"></span></div><div class="ncc-login--info"><a><img src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web${account.firstChar.profileUrl}?${cacheVersion}" class="ncc-login--info__thumb"><span class="ncc-login--info__char">${account.firstChar.name}</span><span class="ncc-login--info__server">${serverName}, ${account.firstChar.level}Lv</span></a></div></div>`
			;

		// 오른쪽 패널 생성
		_._right = new Right();
	}
}




// 오른쪽 패널 클래스
class Right {
	// 생성자
	constructor() {
		const _ = this;

		_.wrap = document.querySelector('.ncc-right-panel > .ncc-right-panel-wrap');
		if (!_.wrap) {
			return;
		}
		_.init();
	}

	init() {
		const _ = this;

		_.setInstance();

		// 알림 생성
		_.noti = new Noti().init();

		_.addEvents();
	}

	setInstance() {
		const _ = this;

		const main_character = account.firstChar;

		_.wrap.innerHTML = 
		`<div class="ncc-userinfo" style="background-image: url('https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web${main_character ? main_character.profileUrl : `https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/user_unkown.jpg`}?${cacheVersion}');">` +
			`<a class="ncc-right-panel-close">Close</a>` +
			`<div class="ncc-profile is-nc-account">` +
				`<div class="ncc-profile-wrap">` +
					`<a class="ncc-profile-img ic-home" href="/account/mypage" target="_self"><img src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web${main_character ? main_character.profileUrl : `https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/user_unkown.jpg`}?${cacheVersion}"></a>` +
					`<div class="ncc-profile-info">` +
						`<span class="ncc-profile-info__char">${!main_character || account.objId == 0 ? `대표 케릭터 미설정` : main_character.name}</span>` +
						`<span class="ncc-profile-info__server">${serverName}</span>` +
						`<span class="ncc-profile-info__level">${main_character ? main_character.level : 0}Lv</span>` +
					`</div>` +
					`<div class="ncc-profile-links">` +
						`<a class="ncc-profile-charchange">캐릭터 변경</a>` +
						`<a class="ncc-profile-logout">로그아웃</a>` +
					`</div>` +
				`</div>` +
				`<div class="nc-account-info"><p>${account.name}</p></div>` +
			`</div>` +
			`<nav class="ncc-shortcut">` +
				`<strong class="blind">서비스 바로가기</strong>` +
				`<ul id="ncc-shortcut-list" class="ncc-shortcut-list ncc-shortcut-list-length4">` +
					`<li class="ncc-shortcut-item"><a href="/account/mypage" class="ncc-shortcut-item__link"><i class="icon-shortcut icon-shortcut--mypage"></i><span class="desc" id="ncc-shortcut-databind-mypage">마이페이지</span></a></li>` +
					`<li class="ncc-shortcut-item"><a href="/goods" class="ncc-shortcut-item__link"><i class="icon-shortcut icon-shortcut--ncoin"></i><span class="desc" id="ncc-shortcut-databind-ncoin">${commaAdd(account.ncoin)}</span></a></li>` +
					`<li class="ncc-shortcut-item"><a href="javascript:openCouponPopup();" class="ncc-shortcut-item__link"><i class="icon-shortcut icon-shortcut--entercoupon"></i><span class="desc" id="ncc-shortcut-databind-entercoupon">쿠폰등록</span></a></li>` +
					`<li class="ncc-shortcut-item"><a href="/customer" class="ncc-shortcut-item__link"><i class="icon-shortcut icon-shortcut--cs"></i><span class="desc" id="ncc-shortcut-databind-cs">문의내역</span></a></li>` +
				`</ul>` +
			`</nav>` +
		`</div>` +
		`<div class="ncc-noti-wrap"></div>`;
		
		if (account.charList.length) {
			let tpl_characters = account.charList.map((item, idx) => {
				return `<li data-id="${item.objId}"><span>${item.name}</span></li>`;
			}).join('');
			$('.ncc-character-panel .ncc-character-list-wrap .ncc-character-list').html(tpl_characters);
		}
	}

	// 주 케릭터 변경
	mainCharacterChange(character_id) {
		let form = document.createElement("form");
		form.setAttribute('charset', 'UTF-8');
		form.setAttribute('method', 'POST');
		form.setAttribute('action', '/account/chageCharacter');

		let input_redirect_uri = document.createElement('input');
		input_redirect_uri.setAttribute('type', 'hidden');
		input_redirect_uri.setAttribute('name', 'redirect_uri');
		input_redirect_uri.setAttribute('value', window.location.href);
		form.appendChild(input_redirect_uri);

		let input_character_id = document.createElement('input');
		input_character_id.setAttribute('type', 'hidden');
		input_character_id.setAttribute('name', 'character_id');
		input_character_id.setAttribute('value', character_id);
		form.appendChild(input_character_id);
	
		document.querySelector('body').appendChild(form);
		form.submit();
	}

	addEvents() {
		const _ = this;

		_.logout = document.querySelector('.ncc-profile-wrap .ncc-profile-links .ncc-profile-logout');
		_.logout.addEventListener('click', e => {
			logout();
			eventStop(e);
		});

		_.characterPanel = document.querySelector('.ncc-character-panel');
		// 캐릭터 목록 이벤트
		if (_.characterPanel) {
			_.characterOpen = document.querySelector('#nc-cnb .ncc-profile-charchange');
			_.characterClose = document.querySelector('#nc-cnb .ncc-character-panel-close');
			_.characterOpen.addEventListener('click', e => {
				if (_.characterPanel.classList) {
					_.characterPanel.classList.add('is-active');
				}
				return false;
			});
			_.characterClose.addEventListener('click', e => {
				if (_.characterPanel.classList) {
					_.characterPanel.classList.remove('is-active');
				}
				return false;
			});

			// 대표케릭터 선택 이벤트
			$('.ncc-character-list > li').on('click', function(e) {
				if ($(this).find('span').text() == $('.ncc-login--info__char').text()) {// 동일 케릭명
					if (_.characterPanel.classList) {
						_.characterPanel.classList.remove('is-active');
					}
					return false;
				}
				const character_id = $(this).attr('data-id');
				if (!character_id) {
					return false;
				}
				_.mainCharacterChange(character_id);
			});
		}
	}
}




// 상단 클래스
class HeaderMain {
	// 생성자
	constructor(_data) {
		if (!_data || header_main) {
			return;
		}
		const _ = this;

		_.cnb_wrap = document.querySelector('#nc-cnb');
		if (!_.cnb_wrap) {
			return;
		}
		_.setInstance();

		_._data = _data;

		_.lnb_wrap = $('.ncc-lnb-wrap');
		_.gnb_wrap = $('.ncc-gnb-wrap');

		_._tpl_lnb = _.lnb();

		if (isWeb) {
			_._left = new Left(_._tpl_lnb);
		}

		if (!isIngame) {
			_._login = new Login();
		}

		// 통합 검색 생성
		_.search = new Search();

		// 패널 생성
		_.dim = Dimmed.instance;

		_.addEvents();
	}

	// 인스턴스 설정
	setInstance() {
		const _ = this;

		_.cnb_wrap.innerHTML = `<div class="ncc-header is-child-nav">` +
			`<div class="ncc-gnb-wrap">` +
				`<div class="ncc-search ncc-search--right-pc"></div>` +
				`<div class="ncc-login"></div>` +
			`</div>` +
			`<div class="ncc-lnb-wrap"></div>` +
		`</div>` +
		`<div class="ncc-left-panel">` +
			`<div class="ncc-left-panel-wrap">` +
				`<div class="ncc-left-panel-header">` +
					`<div class="ncc-lnb-header-bi"><a href="/" class="ncc-bi" target="_self">리니지</a></div>` +
					`<div class="ncc-lnb-header-ncservice">plaync 서비스</div>` +
					`<a class="ncc-left-panel-close">Close</a>` +
				`</div>` +
				`<div class="ncc-left-panel-content scrollbar-macosx">` +
					`<nav class="ncc-lnb-m"><ul class="ncc-lnb-list"></ul></nav>` +
					`<div class="ncc-ncservice"><ul class="ncc-ncservice-list"><li class="ncc-ncservice-item ncc-ncservice-item-plaync"><a href="/" class="plaync"><span></span></a></li></ul></div>` +
				`</div>` +
			`</div>` +
		`</div>` +
		`<div class="ncc-right-panel"><div class="ncc-right-panel-wrap scrollbar-macosx"></div></div>` +
		`<div class="ncc-character-panel">` +
			`<div class="ncc-character-panel-wrap">` +
				`<a class="ncc-character-panel-close">닫기</a>` +
				`<div class="ncc-character-panel-header">대표 캐릭터 선택</div>` +
				`<div class="ncc-character-list-wrap"><ul class="ncc-character-list"></ul></div>` +
			`</div>` +
		`</div>`;

		_.cnb_wrap.setAttribute('data-ncc-device', device);
		_.cnb_wrap.setAttribute('data-cnb-type', 'a');
		_.cnb_wrap.setAttribute('data-theme', 'lineage');
	}

	// 상단 태그 생성
	lnb() {
		const _ = this;

		let tpl_lnb = '';
		if (isWeb) {
			let tpl_gamestart = '';
			$.each(_._data, (index, item) => {
				let tpl_sub = '';
				$.each(item._subs, (index, sub) => {
					if (sub.download) {
						tpl_gamestart = `<div class="ncc-gamestart"><div class="ncc-gamestart-btn"><a href="${sub.href}" class="btn-download ncc-gamestart-btn__start">${sub.desc}</a></div></div>`;
					}
					tpl_sub += `<li class="s${sub.id}"><a href="${sub.href}" target="_self"><span>${sub.desc}</span>${sub.icon_external ? `<em class="icon-external">popup</em>` : ``}${sub.icon_new ? `<em class="icon-new">N</em>` : ``}</a></li>`;
				});
				tpl_lnb += `<li class="ncc-lnb-item m${item.id}"><a href="${item.href}"><span>${item.desc}</span>${item.icon_external ? `<em class="icon-external">popup</em>` : ``}${item.icon_new ? `<em class="icon-new">N</em>` : ``}</a><ul class="ncc-lnb-item__sub">${tpl_sub}</ul></li>`;
			});

			_.lnb_wrap.html(`${tpl_gamestart}<nav class="ncc-lnb"><ul class="ncc-lnb-list">${tpl_lnb}</ul><span class="ncc-lnb-hover" style="transform: translateX(50px) scaleX(0.1); opacity: 0;"></span></nav>`);
		} else {
			$.each(_._data, (index, item) => {
				let tpl_sub = '';
				$.each(item._subs, (index, sub) => {
					tpl_sub += `<li class="s${sub.id}"><a href="${sub.href}" target="_self"><span>${sub.desc}</span>${sub.icon_external ? `<em class="icon-external">popup</em>` : ``}${sub.icon_new ? `<em class="icon-new">N</em>` : ``}</a></li>`;
				});
				tpl_lnb += `<li class="ncc-lnb-item m${item.id}"><a href="${item.href}"><span>${item.desc}</span>${item.icon_external ? `<em class="icon-external">popup</em>` : ``}${item.icon_new ? `<em class="icon-new">N</em>` : ``}</a><ul class="ncc-lnb-item__sub">${tpl_sub}</ul></li>`;
			});

			_.gnb_wrap.append(`<nav class="ncc-lnb-title" style="z-index:1;"><ul class="ncc-lnb-title--current">${tpl_lnb}</ul><div class="ncc-depth2-list-wrap" id="ncc-depth2-tap"><div class="ncc-depth2-scroller" style="display:inline-block;"><div class="ncc-depth2-list"></div></div></div></nav>`);
		}

		return tpl_lnb;
	}

	gnb(id, sub_id) {
		const _ = this;

		const header_title	= $('.wrap-header .header .header-title').text(),
		targetCnb	= $('.ncc-lnb-wrap .ncc-lnb .ncc-lnb-list .ncc-lnb-item.m' + id),
		targetCnbUrl	= targetCnb.children('a').attr('href'),
		targetCnb2Depth	= targetCnb.children('.ncc-lnb-item__sub').children('li');
	
		let tpl_2_depth = '';
		$.each(targetCnb2Depth, function(index, item){
			tpl_2_depth += `<span class="ncc-depth2-list-items s${index + 1}"><a href="${$(item).children('a').attr('href')}">${$(item).find('span').html()}</a></span>`;
		});
	
		_.gnb_wrap.append(`<nav class="ncc-lnb-title" style="z-index:1;"><p class="ncc-lnb-title--current"><a href="${targetCnbUrl}">${header_title}</a></p><div class="ncc-depth2-list-wrap" id="ncc-depth2-tap"><div class="ncc-depth2-scroller" style="display:inline-block;"><div class="ncc-depth2-list">${tpl_2_depth}</div></div></div></nav>`);
		$('.ncc-lnb-title .ncc-depth2-list .ncc-depth2-list-items.s' + sub_id).addClass('selected');
		$('.ncc-gnb-wrap .ncc-bi').css('display', 'none');
	}

	gnbIngame(id, sub_id) {
		const _ = this;
	
		if (id !== undefined) {
			const lnb_item = $('.ncc-lnb-title .ncc-lnb-title--current .ncc-lnb-item.m' + id);
			lnb_item.addClass('is-active');
			lnb_item.find('.ncc-lnb-item__sub > li.s' + sub_id).addClass('is-active');
			if (sub_id) {
				$('#nc-cnb .ncc-lnb-title #ncc-depth2-tap').addClass('is-active');
			}
		}
		$('.ncc-gnb-wrap .ncc-bi').css('display', 'none');
	}

	// 이벤트 추가
	addEvents() {
		const _ = this;

		_.ncc_lnb = document.querySelector('.ncc-lnb');
	
		// hover event
		const lnb_items = $('.ncc-lnb .ncc-lnb-list .ncc-lnb-item, .ncc-lnb-title .ncc-lnb-title--current .ncc-lnb-item');
		const lnb_sub_items = $('.ncc-lnb .ncc-lnb-list .ncc-lnb-item .ncc-lnb-item__sub > li, .ncc-lnb-title .ncc-lnb-title--current .ncc-lnb-item .ncc-lnb-item__sub > li');
		const hoverBar = $("#nc-cnb .ncc-lnb-hover");
		const hoverBarHalf = hoverBar.width() >> 1;
		let transeX = 0, transeW = 0;
		let cnbType = typeof pageCnbType === 'undefined' ? undefined : pageCnbType;
		let cnbSubType = typeof pageCnbSubType === 'undefined' ? undefined : pageCnbSubType;

		const isMain = $('body').hasClass('page-main');
		const isMain_lnb = isMain && _.ncc_lnb;
		if (isMain) {
			if (isMain_lnb) {
				_.ncc_lnb.classList.add('ncc-lnb-type--main');
			}
			if (!isWeb) {
				cnbType = 0;
			}
		}

		if (!isWeb) {
			_.gnbIngame(cnbType, cnbSubType);
		} else if (cnbType) {
			$('.ncc-lnb .ncc-lnb-list .ncc-lnb-item.m' + cnbType).addClass('is-active');

			const lnbSubItem	= $('.ncc-lnb .ncc-lnb-list .ncc-lnb-item.m' + cnbType + ' .ncc-lnb-item__sub > li.s' + cnbSubType);
			if (lnbSubItem) {
				lnbSubItem.addClass('is-active');
			}
			transeX		= !lnbSubItem || !lnbSubItem.offset() ? 0 : parseInt(lnbSubItem.offset().left + (lnbSubItem.width() >> 1) - hoverBarHalf, 10);
			transeW		= !lnbSubItem || !lnbSubItem.offset() ? 0 : lnbSubItem.length ? (94 * lnbSubItem.width() / 100 * .01 * 1.4).toFixed(2) : .1,
			hoverBar.css({
				'transform' : `translateX(${transeX}px) scaleX(${transeW})`,
				'opacity': '1'
			});
			_.gnb(cnbType, cnbSubType);
		}
	
		// 1depth 마우스 호버 이벤트
		lnb_items.hover(function() {
			if (isMain_lnb) {
				_.ncc_lnb.classList.add('ncc-lnb-type--main-over');
			}
			lnb_items.removeClass('is-active');
			$(this).addClass('is-over');

			if (!isWeb) {
				const hover_subs = $(this).find('.ncc-lnb-item__sub > li');
				if (hover_subs && hover_subs.length > 0) {
					$('#nc-cnb .ncc-lnb-title #ncc-depth2-tap').addClass('is-active');
				}
			}
		}, function() {
			if (isMain_lnb) {
				_.ncc_lnb.classList.remove('ncc-lnb-type--main-over');
			}
			$(this).removeClass('is-over');
			if (cnbType !== undefined) {
				$('.ncc-lnb .ncc-lnb-list .ncc-lnb-item.m' + cnbType).addClass('is-active');
				$('.ncc-lnb-title .ncc-lnb-title--current .ncc-lnb-item.m' + cnbType).addClass('is-active');
			}

			if (!isWeb && !cnbSubType) {
				$('#nc-cnb .ncc-lnb-title #ncc-depth2-tap').removeClass('is-active');
			}
		});

		// 2depth 마우스 호버 이벤트
		lnb_sub_items.hover(function() {
			lnb_sub_items.removeClass('is-active');
			$(this).addClass('is-active');

			// 보더 이미지 이동 이벤트
			if (isWeb) {
				const divX	= parseInt($(this).offset().left + ($(this).width() >> 1) - hoverBarHalf, 10),
				divWidth		= $(this).length ? (94 * $(this).width() / 100 * .01 * 1.4).toFixed(2) : .1;
				hoverBar.css({
					'transform' : `translateX(${divX}px) scaleX(${divWidth})`,
					'opacity': '1'
				});
			}
		}, function() {
			$(this).removeClass('is-active');
			hoverBar.css('opacity', '0');
			if (cnbType) {
				$('.ncc-lnb .ncc-lnb-list .ncc-lnb-item.m' + cnbType + ' .ncc-lnb-item__sub > li.s' + cnbSubType).addClass('is-active');
				$('.ncc-lnb-title .ncc-lnb-title--current .ncc-lnb-item.m' + cnbType + ' .ncc-lnb-item__sub > li.s' + cnbSubType).addClass('is-active');

				// 보더 이미지 이동 이벤트
				if (isWeb) {
					hoverBar.css({
						'transform' : `translateX(${transeX}px) scaleX(${transeW})`,
						'opacity': '1'
					});
				}
				if (cnbSubType && !isWeb) {
					$('.ncc-lnb-title--current .ncc-lnb-item.m' + cnbType + ' .ncc-lnb-item__sub > li.s' + cnbSubType).addClass('is-active');
				}
			}
		});

		$(window).scroll(function() {
			if ($(this).scrollTop() > 100) {
				if (_.cnb_wrap.classList) {
					_.cnb_wrap.classList.add('is-sticky');
				}
			} else {
				if (_.cnb_wrap.classList) {
					_.cnb_wrap.classList.remove('is-sticky');
				}
			}
		});

		$('.scrollbar-macosx').scrollbar();
	}
}



// 검색 자동 제안 생성
function create_auto_suggest(option) {
	if (!suggestEnable || !option) {
		return;
	}
	return new SearchAutoSuggest(option);
}

// 페이징 이동 처리를 위한 세션 설정
function createSessionConfig(actionUrl, type_val) {
	switch(actionUrl){
	case '/notice/view':
	case '/update/view':
	case '/event/view':
		communityInfiniteList = {
			board : 'notice',
			type : type_val,
			list_count : $('#cursize').val(),
			scroll_Y : window.scrollY
		};
		setSession('COMMUNITY_INFINITE_LIST', JSON.stringify(communityInfiniteList));
		break;
	case '/board/view':
		communityInfiniteList = {
			board : 'FREE',
			list_count : $('#cursize').val(),
			scroll_Y : window.scrollY
		};
		setSession('COMMUNITY_INFINITE_LIST', JSON.stringify(communityInfiniteList));
		break;
	case '/contents/view':
		communityInfiniteList = {
			board : 'CONTENTS',
			list_count : $('#cursize').val(),
			scroll_Y : window.scrollY
		};
		setSession('COMMUNITY_INFINITE_LIST', JSON.stringify(communityInfiniteList));
		break;
	case '/pitch/view':
		communityInfiniteList = {
			board : 'PITCH',
			list_count : $('#cursize').val(),
			scroll_Y : window.scrollY
		};
		setSession('COMMUNITY_INFINITE_LIST', JSON.stringify(communityInfiniteList));
		break;
	case '/goods/view':
		if (typeof current_page_number === 'undefined') {
			return;
		}
		paginationInfiniteList = {
			page_type : 'goods',
			page_number : current_page_number,
			scroll_Y : window.scrollY
		};
		setSession('PAGINATION_INFINITE_LIST', JSON.stringify(paginationInfiniteList));
		break;
	default:
		break;
	}
}

function urlform(num, methodtype, actionUrl){
	createSessionConfig(actionUrl);
	var form = document.createElement("form");
	form.setAttribute('charset', 'UTF-8');
	form.setAttribute('method', methodtype);
	form.setAttribute('action', actionUrl);
	
	if (num != undefined && num != null && num != 'null') {
		var hiddenField = document.createElement('input');
		hiddenField.setAttribute('type', 'hidden');
		hiddenField.setAttribute('name', 'num');
		hiddenField.setAttribute('value', num);
		form.appendChild(hiddenField);
	}
	document.body.appendChild(form);
	form.submit();
}

function urlTypeform(type, num, methodtype, actionUrl){
	createSessionConfig(actionUrl, type);
	var form = document.createElement("form");
	form.setAttribute('charset', 'UTF-8');
	form.setAttribute('method', methodtype);
	form.setAttribute('action', actionUrl);
	
	if (type != undefined && type != null && type != 'null') {
		var hiddenField = document.createElement('input');
		hiddenField.setAttribute('type', 'hidden');
		hiddenField.setAttribute('name', 'type');
		hiddenField.setAttribute('value', type);
		form.appendChild(hiddenField);
	}
	
	if (num != undefined && num != null && num != 'null') {
		var hiddenField = document.createElement('input');
		hiddenField.setAttribute('type', 'hidden');
		hiddenField.setAttribute('name', 'num');
		hiddenField.setAttribute('value', num);
		form.appendChild(hiddenField);
	}
	
	document.body.appendChild(form);
	form.submit();
}

function urlQueryform(query, methodtype, actionUrl){
	var form = document.createElement("form");
	form.setAttribute('charset', 'UTF-8');
	form.setAttribute('method', methodtype);
	form.setAttribute('action', actionUrl);
	
	if (query != undefined && query != null && query != 'null') {
		var hiddenField = document.createElement('input');
		hiddenField.setAttribute('type', 'hidden');
		hiddenField.setAttribute('name', 'query');
		hiddenField.setAttribute('value', query);
		form.appendChild(hiddenField);
	}
	
	document.body.appendChild(form);
	form.submit();
}

// 로그인 처리
function login() {
	var form = document.createElement("form");
	form.setAttribute('charset', 'UTF-8');
	form.setAttribute('method', 'post');
	form.setAttribute('action', isIngame ? '/login_ingame' : '/login');

	var hiddenField = document.createElement('input');
	hiddenField.setAttribute('type', 'hidden');
	hiddenField.setAttribute('name', 'urlType');
	hiddenField.setAttribute('value', window.location.href);
	form.appendChild(hiddenField);
	
	document.body.appendChild(form);
	form.submit();
}

// 로그인 처리(인게임)
function loginIngame() {
	var form = document.createElement("form");
	form.setAttribute('charset', 'UTF-8');
	form.setAttribute('method', 'post');
	form.setAttribute('action', '/login_ingame');
	
	var hiddenField = document.createElement('input');
	hiddenField.setAttribute('type', 'hidden');
	hiddenField.setAttribute('name', 'urlType');
	hiddenField.setAttribute('value', window.location.href);
	form.appendChild(hiddenField);
	
	document.body.appendChild(form);
	form.submit();
}

// 로그아웃 처리
function logout() {
	if (isLauncher) {
		getDatas([
			'/define/logout'
		], (data) => {

		}, (data) => {
			throw new Error("logout from common.js Error");
		});
	} else {
		location.href='/account/logout';
	}
}

$(function() {

	// 하단 생성
	let footer_wrap = document.querySelector('.wrap-footer');
	if (footer_wrap) {
		footer_wrap.innerHTML = 
		`<div class="footer footer-kr">` +
			`<div class="footer-links"><ul class="footer-links-list footer-links-list-kr"><li class="footer-links-items item1">${serverName}</li></ul></div>` +
			`<div class="footer-copyright">` +
				`<div class="copyright-studio">Lineage ® is a registered trademark of ${serverName} Corporation.</div>` +
				`<div class="copyright-company">Copyright © ${serverName} Corporation. <br> <span class="reserved">All Rights Reserved.</span></div>` +
			`</div>` +
			`<div class="footer-logo">${serverName}</div>` +
		`</div>`;
	}

	// 팝업 생성
	let popup_wrap = document.querySelector('#layer_alert');
	if (popup_wrap) {
		popup_wrap.innerHTML = 
		`<div class="wrapper">` +
			`<div class="btn_close close">close</div>` +
			`<div class="header">알림</div>` +
			`<div class="conWrap"><div class="con"></div></div>` +
			`<div class="btn_modal"></div>` +
		`</div>`;
	}

	// 상단 생성
	header_main = new HeaderMain(cnb);
});



const windowObjects = [];
// 현재 윈도우 폼(브라우저) 해제 이벤트
window.onunload = function() {
	if (windowObjects.length) {
		for (var win of windowObjects) {
			win.close();// 모든 자식 윈도우 폼(팝업) 종료
		}
	}
}

// 인게임 브라우저 오류로 인해 임시 브라우저 대체
function ingameCustomBrowser() {
	if (isIngame && window.name !== 'customBrowser') {
		openPopup(window.location.href, 800, 650, 'customBrowser', 1, 0, false, true);
		$('body').html('<div id="customForm"><h1 style="text-align: center;">새롭게 생성된 임시 브라우저에서 이용하십시오.</h1></div>');
	}
}

// 윈도우 팝업 생성
function openPopup(obj, objWidth, objHeight, objName, objScroll, deny, objFull, isPush, addParam){
	try {
		if (objScroll !== 1 && objScroll !== 0 && objScroll !== '1' && objScroll !== '0') {
			var objScrollCopy=objScroll;
			objScroll=objName;
			objName=objScrollCopy;
		}

		var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
		if (isMac) {
			var ih = objHeight+22;
		} else {
			var ih = objHeight;
		}
		if (typeof(obj) == 'string') {
			var setup="width="+objWidth+",height="+objHeight+", innerHeight="+ih+",toolbar=no,location=no,status=no,menubar=no,top=20,left=20,scrollbars="+objScroll+",resizable=no";
			if(objName==""||!objName)objName="popup";
			if(objFull)setup="fullscreen=1,scrollbars=0";
			var win=window.open(obj,objName,setup);
			if(win!=null)
			win.focus();
			if (isPush) {
				windowObjects.push(win);
			}
			return win;
		}
		if(!objName)objName="popup";
		if(!objScroll)objScroll="auto";
		var url=addParam?obj.href+'?'+addParam:obj.href;
		var setup="width="+objWidth+",height="+objHeight+", innerHeight="+ih+",toolbar=no,location=no,status=no,menubar=no,top=20,left=20,scrollbars="+objScroll+",resizable=no";
		if(objFull)setup="fullscreen=1,scrollbars=0";
		var win=window.open(url,objName,setup);
		if(deny){
		if(win==null)alert('팝업 차단을 해제하여 주시기 바랍니다.');
		else win.focus();
		}
		if (isPush) {
			windowObjects.push(win);
		}
		return win;
	}
	catch(e){}
}

// 런처에서 계정 정보 요청
function get_account_from_launcher() {
	const result = {
		'NCOIN' : !account ? 0 : commaAdd(account.ncoin),
		'NPOINT' : !account ? 0 : commaAdd(account.npoint)
	};
	return result;
}

// 런처 게임시작 승인 요청
function get_gamestart_auth_from_launcher(token) {
	if (!isLauncher) {
		return { 'AUTH_CODE' : 2 };
	}
	if (!account) {
		return { 'AUTH_CODE' : 3 };
	}
	if (!token) {
		return { 'AUTH_CODE' : 5 };
	}

	let auth_code = 0;
	$.ajax({
      		url: '/define/gamestart',
      		type: "GET",
      		dataType: "json",
      		data: { 'token' : token },
		async: false,
      		success: (res) => {
        			auth_code = res;
      		}
    	});
	return { "AUTH_CODE" : auth_code };
}

// 에러페이지 출력
function showError(request, status, error) {
	const doc = 
	`<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/css/error.css?${cacheVersion}"><div class="error-container" id="container"><div class="logo"><a class="logo-link" href="/"><img src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/plaync.png?${cacheVersion}" alt="plaync icon"/></a></div><div class="error-contents-wrap">` +
	`<header class="error-header"><h1 class="title">일시적으로 페이지를 불러올 수 없습니다.</h1><p class="subcopy">동일한 문제가 지속적으로 발생할 경우, 고객지원으로 문의해 주시기 바랍니다.</p></header><div class="error-contents">` +
	`<div class="error-btn-wrap"><button class="btn btn-error btn-error--o btn-back" onclick="history.go(-1);">이전 페이지</button><a href="/customer" class="btn btn-error btn-inquiry">고객지원</a></div>` +
	`<div class="links"><a href="/"><span>홈</span></a></div></div></div><footer id="footer" class="error-footer-wrap"><p class="copyright">Ⓒ ${serverName} Corporation. All Rights Reserved.</p></footer></div>`;
	$('body').html(doc);
	throw new Error("init setting from init.js Error");
}
