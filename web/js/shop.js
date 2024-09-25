/*!
 * project : shop
 * author : LINOFFICE
 * 시세
 */

let shop_singleton = null;
let shop_singletonEnforcer = 'singletonEnforcer';
class Shop {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== shop_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!shop_singleton) shop_singleton = new Shop(shop_singletonEnforcer);
		return shop_singleton;
	}

	// 초기 설정
	init() {
		const _ = this;

		_.data_loader = $('.data-loader');

		// 실시간 키워드 설정
		searchRealtimeKeyword({
			wrap: $('.section-keyword'),
			service: 'item',
			pos: 'popkwd'
		});

		// 검색 자동 제안 설정
		create_auto_suggest({
			selector: '#suggestForm',
			size: 5,
			action: '/my/item-search',
			type: '1',
			useDelbtn: true
		});
	}

	// 검색 랭킹
	rank() {
		const _ = this;

		_.container = $('.searchrank-article');
		_.item = $('.searchrank-nav .nav-item');
		_.item_tap = $('.searchrank-nav .nav-item > a');
		_.item_header = $('header .searchrank-nav .nav-item');
		_.item_footer = $('footer .searchrank-nav .nav-item');
		_.container.slick({
			dots:		false,
			arrows:		false,
			infinite:		true,	// 루프
			slidesToShow:	1,
			slidesToScroll:	1
		});
	
		_.item_tap.on('click', function(e) {
			_.container.slick("slickGoTo", $(this).attr('data-slide')-1);
		});
	
		_.container.on('beforeChange', function(event, slick, currentSlide, nextSlide){
			_.item.removeClass('on');
			_.item_header.eq(nextSlide).addClass('on');
			_.item_footer.eq(nextSlide).addClass('on');
		});
	}

	// 검색 결과
	search() {
		const _ = this;

		_.container = $('.pagination-container');
		_.container.pagination({
			dataSource: function(done) {
				getDatasWithOption([{
					type: 'POST',
					url: '/define/item-search/list',
					dataType: 'json',
					contentType: 'application/json',
					Accept: 'application/json',
					data: { keyword: searchKeyword }
				}], (data) => {
					if (data && data.length) {
						$('.search-util__result .count').text(commaAdd(data.length));
					} else {
						$('.search-util').css('display', 'none');
						$('.section-search-help').css('display', 'none');
					}
					done(data);
				}, (data) => {
					console.log('fail api data from shop.js');
				});
			},
			pageSize: 10,// 한 화면에 보여질 개수
			showPrevious: false,// 처음버튼 삭제
			showNext: false,// 마지막버튼 삭제
			showPageNumbers: true,// 페이지 번호표시
			callback: function (data, pagination) {// 화면 출력
				let tpl = '';
				if (data.length) {
					let item_tpl = data.map( (item, i) => {
						return `<li>` +
							`<div class="item-name">` +
	   							`<div class="server">${serverName}</div>` +
	   							`<a href="/my/item-search/view?itemId=${encodeURIComponent(item.name)}&enchant=${item.enchant}">` +
	   								`<div class="thumbnail"><img src="/img/item/${item.gfxId}.png" onerror="this.onerror=null; this.src='https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/shop/noimg.gif' class="thumb" alt="${item.name}"></div>` +
	   								`<h2 class="name">${item.enchant > 0 ? `+${item.enchant} ` : ``}${item.name}</h2>` +
	   							`</a>` +
	   						`</div>` +
	   						`<div class="item-price item-price--sell">` +
	   							`<h3>판매가격</h3>` +
	   							`<ul>` +
	   								(item.sellTotalCount > 0 ? `<li><a href="/my/item-search/view?itemId=${encodeURIComponent(item.name)}&enchant=${item.enchant}&tradeType=SELL&bless=ALL"><span class="category">전체</span><span class="price">${item.sellTotalPriceInfo}</span> <span class="count">(${commaAdd(item.sellTotalCount)})</span></a></li>` : ``) +
	   								(item.sellNormalCount > 0 ? `<li><a href="/my/item-search/view?itemId=${encodeURIComponent(item.name)}&enchant=${item.enchant}&tradeType=SELL&bless=NORMAL"><span class="category">일반</span><span class="price">${item.sellNormalPriceInfo}</span> <span class="count">(${commaAdd(item.sellNormalCount)})</span></a></li>` : ``) +
	   								(item.sellBlessCount > 0 ? `<li><a href="/my/item-search/view?itemId=${encodeURIComponent(item.name)}&enchant=${item.enchant}&tradeType=SELL&bless=BLESS"><span class="category">축복</span><span class="price">${item.sellBlessPriceInfo}</span> <span class="count">(${commaAdd(item.sellBlessCount)})</span></a></li>` : ``) +
	   								(item.sellCurseCount > 0 ? `<li><a href="/my/item-search/view?itemId=${encodeURIComponent(item.name)}&enchant=${item.enchant}&tradeType=SELL&bless=CURSE"><span class="category">저주</span><span class="price">${item.sellCursePriceInfo}</span> <span class="count">(${commaAdd(item.sellCurseCount)})</span></a></li>` : ``) +
	   								((item.sellTotalCount <= 0 || item.sellNormalCount <= 0 || item.sellBlessCount <= 0 || item.sellCurseCount <= 0) ? `<li class="nodata">${item.sellTotalCount <= 0 ? `<span class="category">전체</span>` : ``}${item.sellNormalCount <= 0 ? `<span class="category">일반</span>` : ``}${item.sellBlessCount <= 0 ? `<span class="category">축복</span>` : ``}${item.sellCurseCount <= 0 ? `<span class="category">저주</span>` : ``} 정보 없음</li>` : ``) +
	   							`</ul>` +
	   						`</div>` +
	   						`<div class="item-price item-price--buy">` +
	   							`<h3>구매가격</h3>` +
	   							`<ul>` +
	   								(item.buyTotalCount > 0 ? `<li><a href="/my/item-search/view?itemId=${encodeURIComponent(item.name)}&enchant=${item.enchant}&tradeType=BUY&bless=ALL"><span class="category">전체</span><span class="price">${item.buyTotalPriceInfo}</span> <span class="count">(${commaAdd(item.buyTotalCount)})</span></a></li>` : ``) +
	   								(item.buyNormalCount > 0 ? `<li><a href="/my/item-search/view?itemId=${encodeURIComponent(item.name)}&enchant=${item.enchant}&tradeType=BUY&bless=NORMAL"><span class="category">일반</span><span class="price">${item.buyNormalPriceInfo}</span> <span class="count">(${commaAdd(item.buyNormalCount)})</span></a></li>` : ``) +
	   								(item.buyBlessCount > 0 ? `<li><a href="/my/item-search/view?itemId=${encodeURIComponent(item.name)}&enchant=${item.enchant}&tradeType=BUY&bless=BLESS"><span class="category">축복</span><span class="price">${item.buyBlessPriceInfo}</span> <span class="count">(${commaAdd(item.buyBlessCount)})</span></a></li>` : ``) +
	   								(item.buyCurseCount > 0 ? `<li><a href="/my/item-search/view?itemId=${encodeURIComponent(item.name)}&enchant=${item.enchant}&tradeType=BUY&bless=CURSE"><span class="category">저주</span><span class="price">${item.buyCursePriceInfo}</span> <span class="count">(${commaAdd(item.buyCurseCount)})</span></a></li>` : ``) +
	   								((item.buyTotalCount <= 0 || item.buyNormalCount <= 0 || item.buyBlessCount <= 0 || item.buyCurseCount <= 0) ? `<li class="nodata">${item.buyTotalCount <= 0 ? `<span class="category">전체</span>` : ``}${item.buyNormalCount <= 0 ? `<span class="category">일반</span>` : ``}${item.buyBlessCount <= 0 ? `<span class="category">축복</span>` : ``}${item.buyCurseCount <= 0 ? `<span class="category">저주</span>` : ``} 정보 없음</li>` : ``) +
	   							`</ul>` +
	   						`</div>` +
	   					`</li>`;
					}).join('');

					tpl = `<ul>${item_tpl}</ul>`;
				} else {
					tpl = `<div class="search-article__nodata"><div class="nodata"><strong>검색 결과가 없습니다.</strong><ol><li>검색어의 철자가 정확한지 확인해주세요.</li><li>검색어가 두 단어 이상일 경우, 띄어쓰기를 확인해주세요.</li></ol></div></div>`;
				}
				$(".search-article--item").html(tpl);// 렌더링
				_.data_loader.css('display', 'none');
			}
		});
		_.search_icon = $('.search-util__result .icon');
		_.search_help = $('.search-help');
		_.search_close = $('.icon-close');
		_.search_icon.on('click', function(event) {// 출현
			_.search_help.css({'display': 'block'});
		});
		_.search_close.on('click', function(event) {// 출현
			_.search_help.css({'display': 'none'});
		});
        
		// 영역밖 클릭
		$('body').mouseup(function (f){
			if (!_.search_help.has(f.target).length) {
				_.search_help.css({'display': 'none'});
			}
		});
	}

	// 상세 보기
	view() {
		const _ = this;

		if (TRADE_TYPE === 'SELL') {
			$('#tab_sell').addClass('active');
			$('.item-price > .price').addClass('price-sell');
		} else if (TRADE_TYPE === 'BUY') {
			$('#tab_buy').addClass('active');
			$('.item-price > .price').addClass('price-buy');
		}

		_.ATTR_NAME = [
			'없음', 
			'화령 1단', '화령 2단', '화령 3단', '화령 4단', '화령 5단', 
			'수령 1단', '수령 2단', '수령 3단', '수령 4단', '수령 5단',
			'풍령 1단', '풍령 2단', '풍령 3단', '풍령 4단', '풍령 5단',
			'지령 1단', '지령 2단', '지령 3단', '지령 4단', '지령 5단'
		];

		_.BLESS_NAME = [
			'축복',
			'일반',
			'저주'
		];

    		_.parameter = {
        			itemId :		searchItemId,
        			enchant :		enchant,
        			bless :		bless,
        			attr :		searchAttr,
        			tradeType :	TRADE_TYPE
		};

		_.container = $('.pagination-container');
    		_.paginationRender = function() {
			_.data_loader.css('display', 'block');
			_.container.pagination({
				dataSource: function(done) {
					getDatasWithOption([{
						type: 'POST',
						url: '/define/item-search/view-list',
						dataType: 'json',
						contentType: 'application/json',
						Accept: 'application/json',
						data: _.parameter
					}], (data) => {
						if (data) {
							$('.search-util__result .count').text(data.length);
							$('.thumbnail').html(`<img src="/img/item/${data.gfxId}.png" onerror="this.src='https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/shop/noimg.gif'" class="thumb" alt="">`);
							let itemList = [];
							let price_now = $('.price > .price-now');
							if (TRADE_TYPE === 'SELL') {
								if (data.sellList) {
									var sellcount = 0;
                	            						for (var i=0; i<data.sellList.length; i++) {
            									sellcount += data.sellList[i].itemObjList.length;
            								}
									let store_count = commaAdd(sellcount);
									$('.section-history .header').html(`판매 가격 현황 <em class="count">${store_count}</em>건`);
									price_now.find('h3').text('현재 판매가격');
            								price_now.find('.price-store em').text(store_count);
            								price_now.find('.price-qty dfn').text('총 판매수량 :');
            								price_now.find('.price-qty em').text(commaAdd(data.sellTotalCount));
									if (!data || !data.sellTotalPriceArray || !data.sellTotalPriceArray.length) {
										price_now.find('.price-min em').text(0);
            									price_now.find('.price-max em').text(0);
									} else {
            									price_now.find('.price-min em').text(data.sellTotalPriceArray[0]);
                									price_now.find('.price-max em').text(data.sellTotalPriceArray.length === 2 ? data.sellTotalPriceArray[1] : data.sellTotalPriceArray[0]);
									}

            								var itemObj;
            								for (var i=0; i<data.sellList.length; i++) {
                        	            						for (var j=0; j<data.sellList[i].itemObjList.length; j++) {
                        	            							itemObj = data.sellList[i].itemObjList[j];
                        	            							itemList.push([{bless : data.sellList[i].bless}, itemObj]);
                        	            						}
									}
								}
							} else {
								if (data.buyList) {
                	            						var buycount = 0;
                	            						for (var i=0; i<data.buyList.length; i++) {
            									buycount += data.buyList[i].itemObjList.length;
            								}
									let store_count = commaAdd(buycount);
									$('.section-history .header').html(`구매 가격 현황 <em class="count">${store_count}</em>건`);
									price_now.find('h3').text('현재 구매가격');
            								price_now.find('.price-store em').text(store_count);
            								price_now.find('.price-qty dfn').text('총 구매수량 :');
            								price_now.find('.price-qty em').text(commaAdd(data.buyTotalCount));
									if (!data || !data.buyTotalPriceArray || !data.buyTotalPriceArray.length) {
            									price_now.find('.price-min em').text(0);
            									price_now.find('.price-max em').text(0);
									} else {
            									price_now.find('.price-min em').text(data.buyTotalPriceArray[0]);
                									price_now.find('.price-max em').text(data.buyTotalPriceArray.length === 2 ? data.buyTotalPriceArray[1] : data.buyTotalPriceArray[0]);
									}

            								var itemObj;
            								for (var i=0; i<data.buyList.length; i++) {
                        	            						for (var j=0; j<data.buyList[i].itemObjList.length; j++) {
                        	            							itemObj = data.buyList[i].itemObjList[j];
                        	            							itemList.push([{bless : data.buyList[i].bless}, itemObj]);
                        	            						}
                        	            					}
                	            					}
							}
							// 가격대로 정렬
							itemList.sort(function(a, b)  {
								return a[1].price - b[1].price;
    							});
							done(itemList);
						}
					}, (data) => {
						console.log('fail api data from shop.js');
					});
            			},
				pageSize: 10,// 한 화면에 보여질 개수
				showPrevious: false,// 처음버튼 삭제
				showNext: false,// 마지막버튼 삭제
				showPageNumbers: true,// 페이지 번호표시
				callback: function (data, pagination) {// 화면 출력
					let tpl = '';
					if (data.length) {
						tpl = data.map( (item, i) => {
							let potential_grade = item[1].potential_grade;
							let potential_desc = item[1].potential_desc;
							return `<div class="tr">` +
								`<div class="td-row">` +
									`<span class="td-enchant">${!potential_grade ? item[1].enchant > 0 ? `+${item[1].enchant}` : `-` : potential_grade}</span>` +
									`<span class="td-qty">${item[1].count}개</span>` +
									`<span class="td-price">${_.price_name(item[1].price)}</span>` +
								`</div>` +
								`<div class="td-row">` +
									`<span class="td-status">${_.BLESS_NAME[item[0].bless]}</span>` +
									`<span class="td-attribute">${!potential_desc ? _.ATTR_NAME[item[1].attr] : potential_desc}</span>` +
									`<span class="td-store">${isIngame ? `<a href="javascript:L1.FindMerchant('${item[1].charName}');">${item[1].charName} (${item[1].loc})</a>` : `${item[1].charName} (${item[1].loc})`}</span>` +	
								`</div>` +
							`</div>`;
						}).join('');
					} else {
						tpl = `<div class="nodata"><p>게임 내 개설 중인 상점이 없습니다.</p></div>`;
					}

					$(".tbody").html(tpl);// 렌더링
					_.data_loader.css('display', 'none');
				}
			})
		}
        
		const select	= $('.select');
		const dropdown	= $('.ui-dropdown');
		select.click(function() {// 출현
			let drop = $(this).closest('.ui-dropdown');
			if (drop.hasClass('is-active')) {
				dropdown.removeClass('is-active');
			} else {
				dropdown.removeClass('is-active');
				drop.addClass('is-active');
			}
    		});
        
     		// 영역밖 클릭
    		$('body').mouseup(function (e){
    			if (!select.has(e.target).length && !dropdown.has(e.target).length && dropdown.hasClass('is-active')) {
    				dropdown.removeClass('is-active');
    			}
    			eventStop(e);
    		});
     	
     		// 옵션 선택 이벤트
     		const option = $('.option > li');
     		option.click(function() {// 출현
     			let drop = $(this).closest('.ui-dropdown');
     			if (!$(this).hasClass('selected')) {
     				let option_text = $(this).text();
     				if (option_text !== drop.find('span').text()) {
     					let optionValue = $(this).attr('data-value');
             				drop.find('span').text(option_text);
             		
         					$(this).closest('.option').children('li').removeClass('selected');
             				$(this).addClass('selected');
             		
             				if (drop.hasClass('dropdown-enchant')) {
             					_.parameter.enchant = optionValue;
             				} else if (drop.hasClass('dropdown-status')) {
             					_.parameter.bless = optionValue;
             				} else if (drop.hasClass('dropdown-attribute')) {
             					_.parameter.attr = optionValue;
             				}
             				_.container.destory;
             				_.paginationRender();
     				}
     			}
     			drop.removeClass('is-active');
    		});
     	
     		// 최초 렌더링
     		if (enchant > 0) {
     			$('.dropdown-enchant span').text('+' + enchant);
     			let enchantOption = $('.dropdown-enchant .option li');
     			enchantOption.removeClass('selected');
     			enchantOption.eq(enchant + 1).addClass('selected');
     		}
     		if (bless !== 'ALL') {
     			$('.dropdown-status span').text(bless === 'NORMAL' ? '일반' : bless === 'BLESS' ? '축복' : '저주');
     			let blessOption = $('.dropdown-status .option li');
     			blessOption.removeClass('selected');
     			blessOption.eq(bless === 'NORMAL' ? 1 : bless === 'BLESS' ? 2 : 3).addClass('selected');
     		}
     		_.paginationRender();
	}

	price_name(value) {
		if (value <= 0) return '0';
		let result = '';
		if (value > 100000000) {
    			let aa = parseInt(value / 100000000);
    			value -= aa * 100000000;
    			result += `${commaAdd(aa)}억`;
    		}
    		if (value > 10000) {
    			let aa = parseInt(value / 10000);
    			value -= aa * 10000;
    			result += ` ${commaAdd(aa)}만`;
    		}
    		if (value > 0) {
    			result += ` ${commaAdd(value)}`;
    		}
    		return result;
	}

}