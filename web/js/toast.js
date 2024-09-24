/*!
 * project : toast
 * author : LINOFFICE
 * 배너
 */

class ToastLayer {
	bannerEl = null;
	// 생성자
	constructor(_data) {
		if (!_data) {
			return false;
		}
		const is_cookie_apply = GetCookie(_data.COOKIE_NAME) === _data.COOKIE_VALUE;
		if (is_cookie_apply) {
			return false;
		}

		this.bannerEl = this.template( _data ) ;
		document.body.appendChild( this.bannerEl );
		this.addEvents(_data);

		setTimeout(()=> {
			$('.nc-banner[data-type=toast]').addClass('is-show');
		}, 1000);
	}

	// 템플레이트 생성
	template(_data) {
		this.el = document.createElement('div');
		this.el.setAttribute('class', 'nc-banner');
		this.el.setAttribute('data-type', 'toast');
		this.el.innerHTML = 
			`<a href="${_data.HREF}" class="nc-banner-link" style="background-image:url('https://cdn.jsdelivr.net/gh/cckiss/web${_data.SRC}')">` +
				`<div class="nc-banner-inner">` +
					`<div class="nc-banner-tag">${_data.TAG}</div><strong class="nc-banner-title-main">${_data.TITLE}</strong><em class="nc-banner-title-sub">${_data.TITLE_SUB}</em>` +
				`</div>` +
			`</a>` +
			`<button class="nc-banner-close"><span class="blind">그만보기</span></button>`;
		return this.el;
	}

	// 이벤트 추가
	addEvents(_data) {
		// 닫기 버튼 클릭 이벤트
		document.querySelector(".nc-banner[data-type=toast] .nc-banner-close").addEventListener('click', e =>{
			SetCookie(_data.COOKIE_NAME, _data.COOKIE_VALUE, _data.COOKIE_MAX_AGE, _data.COOKIE_SAME_SITE);
			this.bannerEl.remove();
		});
	}

}

// 배너 생성
new ToastLayer(index_data.TOAST);