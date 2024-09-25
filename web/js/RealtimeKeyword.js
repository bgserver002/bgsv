/*!
 * project : RealtimeKeyword
 * author : LINOFFICE
 * 실시간 키워드
 */

class RealtimeKeyword {
	// 생성자
	constructor(options) {
		const _ = this;

		if (!options) return;

		_.INTERVAL_ROLLING_ITEMS = 3500;

		_.option = $.extend(true, {
			service: 'search', // search, item, powerbook
			wrap: null,
			data: null,
			alias: null,
			serverId: 1,
			global: window
		}, options);

		_.global = (_.option.global) ? _.option.global : window;

		_.data = null;
		_.alias = null;
		_.wrap = null;

		_.rollingWrap = null;
		_.rollingKeywordWrap = null;
		_.rollingItemInterval = null;
		_.rollingItemIndex = 1;

		_.listWrap = null;
		_.listKeywordWrap = null;

		_.uniqueId = Date.now();

		_.proxy = {
 			clickDocumentEventHandler: null
		};
		_.init();
	}

	// 초기 설정
	init() {
		const _ = this;
		_.wrap = $(_.option.wrap);
		if (isDefined(_.wrap) && _.wrap.length) {
			_.data = (_.option.data) ? _.option.data.list : [];

			if (_.data.length) {
				_.rollingWrap = $('.keyword__rolling', _.wrap);
				_.listWrap = $('.keyword__list', _.wrap);

				_.rollingKeywordWrap = $('.keyword', _.rollingWrap);
				_.listKeywordWrap = $('.keyword', _.listWrap);

				_.proxy.clickDocumentEventHandler = $.proxy(_.clickDocumentEventHandler, _);

				_.setInstance();
			}
		}
		return _;
	}

	// 인스턴스 설정
	setInstance() {
		const _ = this;

		let item, obj, tpl = '', queryStr = '';
		for (let i = 0, max = _.data.length; i < max; ++i) {
			item = _.data[i];

			queryStr = encodeURIComponent(item[0]);

			obj = {
				index: i + 1,
				name: item[0],
				updown: item[1], // 'up', 'down', 'same'
				rank: item[2],
				url: ''
			};

			if (queryStr === '-') {
				obj.url = `javascript:;`;
			} else {
				switch (_.option.service) {
				case 'search' :
					obj.url = `/search?query=${queryStr}`;
					break;

				case 'item' :
					obj.url = `/my/item-search?keyword=${queryStr}`;
					break;

				case 'powerbook' :
					obj.url = `/powerbook/search?query=${queryStr}`;
					break;
				}
			}
			tpl += _.getListTpl(obj);
		}

		_.rollingKeywordWrap.empty().append(tpl);
		_.listKeywordWrap.empty().append(tpl);

		_.setRollingKeywords();
		_.setToggleBtn();
		_.setWrapVisible(false);
	}

	// 롤링 설정
	setRollingKeywords() {
		const _ = this;

		let items = $('li', _.rollingKeywordWrap);
		tram(items).set({
			position: 'absolute',
			top: 0,
			left: 0,
			y: _.rollingKeywordWrap.height()
		});

		_.changeItem(_.rollingItemIndex);
		_.setRollingKeywordInterval(true);
	}

	// 롤링 시작
	setRollingKeywordInterval(flag) {
		const _ = this;

		_.global.clearInterval(_.rollingItemInterval);
		_.rollingItemInterval = null;

		if (truthy(flag)) {
			let items = $('li', _.rollingKeywordWrap);

			_.rollingItemInterval = _.global.setInterval(() => {
				let activateIndex = _.rollingItemIndex + 1;
				if (activateIndex > items.length) activateIndex = 1;

				_.changeItem(activateIndex);
				_.rollingItemIndex = activateIndex;
			}, _.INTERVAL_ROLLING_ITEMS);
		}
	}

	// 롤링 이벤트
	changeItem(index) {
		const _ = this;

		let keywordWrapHeight = _.rollingKeywordWrap.height(),
		prevItemIndex = _.rollingItemIndex,
		activateIndex = index;

		let items = $('li', _.rollingKeywordWrap),
		prevItem = $(items.get(prevItemIndex - 1)),
		activateItem = $(items.get(activateIndex - 1));

		if (prevItem.length) {
			tram(prevItem)
			.stop({y: true})
			.add('transform 0.9s ease-out-expo')
			.start({y: -keywordWrapHeight});
		}

		if (activateItem.length) {
			tram(activateItem)
			.stop({y: true})
			.set({y: keywordWrapHeight})
			.add('transform 0.9s ease-out-expo')
			.start({y: 0});
		}
	}

	// 롤링 리스트 템플레이트 생성
	getListTpl(obj) {
		return `<li><a href="${obj.url}">${obj.name}</a><span class="ui-rank ${obj.updown}">${obj.rank}</span></li>`;
	}

	// 버튼 클릭 이벤트
	setToggleBtn() {
		const _ = this;
		$('.btn-toggle', _.wrap).on('click', evt => {
			evt.preventDefault();
			const isListWrapVisible = _.listWrap.is(':visible');
			_.setDocumentEventHandler(!isListWrapVisible);
			_.setWrapVisible(!isListWrapVisible);
		});
	}

	// 더보기 버튼 클릭 이벤트
	setWrapVisible(flag) {
		const _ = this;
		if (truthy(flag)) {
			_.wrap.addClass('on');
			_.showListWrap(true);

		} else {
			_.wrap.removeClass('on');
			_.showListWrap(false);
		}
	}

	showListWrap(flag) {
		(truthy(flag)) ? this.listWrap.show() : this.listWrap.hide();
	}

	setDocumentEventHandler(flag) {
		const _ = this;
		$(document).off(`click.ui.realtimekeyword.${_.uniqueId}`, _.proxy.clickDocumentEventHandler);
		if (truthy(flag)) $(document).on(`click.ui.realtimekeyword.${_.uniqueId}`, _.proxy.clickDocumentEventHandler);
		return _;
	}

	clickDocumentEventHandler(evt) {
		const _ = this;
		switch (evt.type) {
		case 'click' :
			const toggleBtn = $('.btn-toggle', _.wrap).get(0),
			keywordList = $('.keyword__list', _.wrap).get(0);

			if (evt.target === toggleBtn) return;
			if (evt.target === keywordList || $.contains(keywordList, evt.target)) return;

			_.setDocumentEventHandler(false);
			_.setWrapVisible(false);
			break;
		}
		return _;
	}
}

// 실시간 키워드 생성
function searchRealtimeKeyword(option) {
	if (!option) {
		return;
	}
	includeJS('/js/popularkeyword.js', getTime, () => {
		includeJS('https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/js/tram.min.js', cacheVersion, () => {
			new RealtimeKeyword($.extend(option, { data : popularKeyword }));
		});
	});
}