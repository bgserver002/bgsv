/*!
 * project : modal
 * author : LINOFFICE
 * 모달
 */

class ModalLayer {
	modalEl = null;
	backdropEl = null;
	// 생성자
	constructor(_data) {
		if (!_data) {
			return false;
		}
		const is_cookie_apply = GetCookie(_data.COOKIE_NAME) === _data.COOKIE_VALUE;
		if (is_cookie_apply) {
			return false;
		}

		this.backdropEl = this.makeBackdropEl( _data );
		this.modalEl = this.template( _data );
		$('#container').after( this.backdropEl );
		$('#container').after( this.modalEl );
		$('body').addClass('modal-open');
		this.addEvents(_data);
	}

	// 템플레이트 생성
	template(_data) {
		this.el = document.createElement('div');
		switch (_data.TYPE) {
		case 'YOUTUBE':
			this.el.id = 'NC-banner-movie';
			this.el.innerHTML = 
				`<div class="nc-modal__dialog" role="document"><div class="nc-modal__content">` +
				`<div class="nc-modal__header"><div class="nc-modal__title"></div><button type="button" class="nc-modal__close"><svg viewBox="0 0 21 20" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke-linecap="square"><path d="m1.238 0.238 19.145 19.145m-19.145 0 9.549-9.55 7.398-7.397 2.198-2.198"></path></g></svg></button></div>` +
				`<div class="nc-modal__body"><iframe width="100%" height="100%" src="${_data.SRC}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe></div>` +
				`<div class="nc-modal__footer"><div><button type="button" class="nc-modal__btn nc-modal__btn--pri"><span class="nc-modal__btn-text">그만보기</span></button><button type="button" class="nc-modal__btn nc-modal__btn--sec"><span class="nc-modal__btn-text">닫기</span></button></div></div></div></div></div>`;
			break;
		case 'VIDEO':
			this.el.id = 'NC-banner-movie';
			this.el.innerHTML = 
				`<div class="nc-modal__dialog" role="document"><div class="nc-modal__content">` +
				`<div class="nc-modal__header"><div class="nc-modal__title"></div><button type="button" class="nc-modal__close"><svg viewBox="0 0 21 20" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke-linecap="square"><path d="m1.238 0.238 19.145 19.145m-19.145 0 9.549-9.55 7.398-7.397 2.198-2.198"></path></g></svg></button></div>` +
				`<div class="nc-modal__body">${!_data.TITLE ? `` : `<div class="title">${_data.TITLE}</div>`}<video autoplay loop muted><source src="${_data.SRC}" type="video/mp4"></video></div>` +
				`<div class="nc-modal__footer"><div><button type="button" class="nc-modal__btn nc-modal__btn--pri"><span class="nc-modal__btn-text">그만보기</span></button><button type="button" class="nc-modal__btn nc-modal__btn--sec"><span class="nc-modal__btn-text">닫기</span></button></div></div></div></div></div>`;
			break;
		case 'IMG':
			this.el.id = 'NC-banner-modal';
			this.el.setAttribute('class', 'imgBannerVertical');
			this.el.innerHTML = 
				`<div class="nc-modal__dialog" role="document"><div class="nc-modal__content">` +
				`<div class="nc-modal__header"><div class="nc-modal__title"></div><button type="button" class="nc-modal__close"><svg viewBox="0 0 21 20" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke-linecap="square"><path d="m1.238 0.238 19.145 19.145m-19.145 0 9.549-9.55 7.398-7.397 2.198-2.198"></path></g></svg></button></div>` +
				`<div class="nc-modal__body"><div class="nc-banner-modal-pc"><a><img src="https://cdn.jsdelivr.net/gh/cckiss/web${_data.SRC}"></a></div></div>` +
				`<div class="nc-modal__footer"><div><button type="button" class="nc-modal__btn nc-modal__btn--pri"><span class="nc-modal__btn-text">그만보기</span></button><button type="button" class="nc-modal__btn nc-modal__btn--sec"><span class="nc-modal__btn-text">닫기</span></button></div></div></div></div></div>`;
			break;
		case 'PAGE':
			this.el.id = 'NC-banner-modal';
			this.el.innerHTML = 
				`<div class="nc-modal__dialog" role="document"><div class="nc-modal__content">` +
				`<div class="nc-modal__header"><div class="nc-modal__title"></div><button type="button" class="nc-modal__close"><svg viewBox="0 0 21 20" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke-linecap="square"><path d="m1.238 0.238 19.145 19.145m-19.145 0 9.549-9.55 7.398-7.397 2.198-2.198"></path></g></svg></button></div>` +
				`<div class="nc-modal__body"><iframe width="100%" height="100%" src="${_data.SRC}" frameborder="0" allowfullscreen=""></iframe></div>` +
				`<div class="nc-modal__footer"><div><button type="button" class="nc-modal__btn nc-modal__btn--pri"><span class="nc-modal__btn-text">그만보기</span></button><button type="button" class="nc-modal__btn nc-modal__btn--sec"><span class="nc-modal__btn-text">닫기</span></button></div></div></div></div></div>`;
			break;
		}
		this.el.setAttribute('class', 'nc-modal nc-modal--lineage nc-modal--center nc-modal--show');
		this.el.setAttribute('tabindex', '0');
		return this.el;
	}

	// 배경 템플레이트 생성
	makeBackdropEl(_data) {
		this.el = document.createElement('div');
		switch (_data.TYPE) {
		case 'YOUTUBE':
		case 'VIDEO':
			this.el.id = 'NC-banner-movie-backdrop';
			break;
		case 'IMG':
		case 'PAGE':
			this.el.id = 'NC-banner-modal-backdrop';
			break;
		}
		this.el.setAttribute('class', 'nc-backdrop nc-backdrop--blur nc-backdrop--show');
		return this.el;
	}

	// 닫기 이벤트
	modal_close() {
		$('body').removeClass('modal-open');
		this.backdropEl.remove();
		this.modalEl.remove();
	}

	// 이벤트 추가
	addEvents(_data) {
		// 닫기 버튼 클릭 이벤트
		document.querySelector(".nc-modal__btn.nc-modal__btn--sec").addEventListener('click', e =>{
			this.modal_close();
		});
		// 그만 보기 버튼 클릭 이벤트
		document.querySelector(".nc-modal__btn.nc-modal__btn--pri").addEventListener('click', e =>{
			SetCookie(_data.COOKIE_NAME, _data.COOKIE_VALUE, _data.COOKIE_MAX_AGE, _data.COOKIE_SAME_SITE);
			this.modal_close();
		});
	}

}

// 모달 생성
new ModalLayer(index_data.MODAL);