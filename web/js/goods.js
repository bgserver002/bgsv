/*!
 * project : goods
 * author : LINOFFICE
 * N샵
 */

let goods_singleton = null;
let goods_singletonEnforcer = 'singletonEnforcer';
class Goods {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== goods_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!goods_singleton) goods_singleton = new Goods(goods_singletonEnforcer);
		return goods_singleton;
	}

	// 초기 설정
	init() {
		const _ = this;

		_.searchPanel	= $('#MenuWrap #searchPanel');
		_.searchForm	= document.searchForm;
		_.searchInput	= _.searchPanel.find('#SearchInput');
		_.menu_btn	= document.querySelector('.myshop.btn_menu');
		_.menu_span	= document.querySelector('.myshop.btn_menu span');
		_.menu_area	= document.querySelector('.user_area .menu_area');

		_.goods = {
			item : null,
			price_type : null,
			price : 0,
			saved_point : 0,
			total_price : 0,
			total_count : 1
		};

		_.goods_sync = false;

		_.searchInput.val(query ? query : '1억 아데나 수표');

		_.addEvents();
	}

	// 목록 페이지 구성
	list() {
		const _ = this;

		_.goods_list = null;
		_.goods_date_list = [];
		_.calc_timer = null;

		const current_moment = moment();// 현재 시간

		// 판매 시간 태그 생성
		let get_message_area_tag = function(item) {
			if (!item || !item.start_date && !item.finish_date) {
				return '';
			}
			if (item.start_date) {
				const start_moment = moment(new Date(item.start_date));
				const is_same_or_after = current_moment.isSameOrAfter(start_moment);
				if (!is_same_or_after) {
					// 판매 시작 시간보다 이전
					_.goods_date_list.push(item);
					return `<span class="msg_area"><span class="msg">${start_moment.format('판매 시작 - DD일 HH : mm ~')}</span></span>`;
				}
			}
			if (item.finish_date) {
				const finish_moment = moment(new Date(item.finish_date));
				const is_before = current_moment.isBefore(finish_moment);
				if (!is_before) {
					// 판매 종료 시간보다 이후
					return `<span class="msg_area"><span class="msg">판매 기간 종료</span></span>`;
				}
				// 판매 종료 시간보다 이전
				const diff_day = finish_moment.diff(current_moment, "days");
				const diff_hour = finish_moment.diff(current_moment, "hours") % 24;
				const diff_minute = finish_moment.diff(current_moment, "minutes") % 60;
				_.goods_date_list.push(item);
				return `<span class="msg_area"><span class="msg">기간 한정 - ${diff_day}일 ${diff_hour < 10 ? `0` : ``}${diff_hour} : ${diff_minute < 10 ? `0` : ``}${diff_minute}</span></span>`;
			}
			return '';
		}

		// 주기적 판매 시간 변경
		let calc_message_area_tag = function() {
			if (!_.goods_date_list) {
				clearInterval(_.calc_timer);
				return;
			}
			let now_moment = moment();// 현재 시간
			let delete_list = [];
			$.each(_.goods_date_list, function (key, item) {
				let msg_area = $('[data-id=' + item.id + ']').find('.msg_area');
				if (item.start_date) {
					let start_moment = moment(new Date(item.start_date));
					let is_same_or_after = now_moment.isSameOrAfter(start_moment);
					// 판매 시작 시간보다 이전
					if (!is_same_or_after) {
						return true;
					}
					// 판매 시작 시간보다 이후에 종료시간 없음
					if (!item.finish_date) {
						delete_list.push(item);
						msg_area.remove();
						return true;
					}
				}
				if (!item.finish_date) {
					return true;
				}
				let finish_moment = moment(new Date(item.finish_date));
				let is_before = now_moment.isBefore(finish_moment);
				if (!is_before) {
					// 판매 종료 시간보다 이후
					delete_list.push(item);
					msg_area.find('.msg').text('판매 기간 종료');
					return true;
				}		

				// 판매 종료 시간보다 이전
				let diff_day = finish_moment.diff(now_moment, "days");
				let diff_hour = finish_moment.diff(now_moment, "hours") % 24;
				let diff_minute = finish_moment.diff(now_moment, "minutes") % 60;
				msg_area.find('.msg').text(`기간 한정 - ${diff_day}일 ${diff_hour < 10 ? `0` : ``}${diff_hour} : ${diff_minute < 10 ? `0` : ``}${diff_minute}`);
			});
			if (delete_list.length) {
				for (var i=0; i<delete_list.length; i++) {
					for (var j=0; j<_.goods_date_list.length; j++) {
						if (delete_list[i].id == _.goods_date_list[j].id) {
							_.goods_date_list.splice(j, 1);
						}
					}
				}
			}
		}

		// 주기적 판매 시간 변경 타이머 생성
		let start_interval = function() {
			if (!_.goods_date_list) {
				return;
			}
			_.calc_timer = setInterval(calc_message_area_tag, 60000);
		}
	
		_.container = $('.pagination-container');
		_.container.pagination({
			dataSource: function(done) {
				getDatasWithOption([{
					type: 'POST',
					url: '/define/goods',
					dataType: 'json',
					contentType: 'application/json',
					Accept: 'application/json',
					data: { 'query' : query }
				}], (data) => {
					done(data);
				}, (data) => {
					console.log('fail data goods list');
				});
			},
			pageSize:			18,// 한 화면에 보여질 개수
			showPrevious:		false,// 처음버튼 삭제
			showNext:		false,// 마지막버튼 삭제
			showPageNumbers:	true,// 페이지 번호표시
			callback: function (data, pagination) {// 화면 출력
				let tpl = '';
            			if (data.length) {
					_.goods_list = data;

					tpl = _.goods_list.map((val, idx) => {
						let item = val[0];
						return `<div class="sub_card">` + 
							`<div class="box" data-id="${item.id}">` +
            							`<a href="#" class="lnk_detail">` +
									`${get_message_area_tag(item)}${item.flagTag_1}` +
									`<div class="img_area"><img src="${item.icon_image}" alt="" class="item_img"></div>` +
									`<div class="item_info">` +
										`<div class="v_align">` +
											`<div class="tit_area"><em class="tit">${item.title}</em></div>` +
											`<div class="coin_area">${item.price_type === 'NCOIN' ? `<span class="ncoin">` : `<span class="npoint">`}${commaAdd(item.price)}</span></div>` +
										`</div>` +
									`</div>` +
								`</a>` +
								`<div class="btn_area"><a href="" class="btn direct fn_orderform">${val.length > 1 ? `구매` : `바로구매`}</a></div>` +
							`</div>` +
						`</div>`;
					}).join('');

					start_interval();
            			} else {
            				tpl = '<div class="search_not_found"><em>검색결과가 없습니다.</em><p>검색어의 철자가 정확한지 확인해주세요.<br> 검색어가 두 단어 이상일 경우, 띄어쓰기를 확인해주세요.</p></div>';
            			}
				$('.data-loader').css('display', 'none');
				$('#ContentWrap .sub_wrap').html(tpl);// 렌더링

				// 카드 클릭 이벤트
				$('#ContentWrap .sub_wrap .box > a.lnk_detail').on('click', function(e) {
					urlform(`${$(this).closest('.box').attr('data-id')}`, 'post', '/goods/view');
					eventStop(e);
				});

				// 버튼 클릭 이벤트
				$('#ContentWrap .sub_wrap .box .btn_area > a').on('click', function(e) {
					if ($(this).text() === '바로구매') {
						const id		= $(this).closest('.box').attr('data-id');
						_.goods.item	= _.goods_list.find((items) => items[0].id == id)[0];
						_.goods.price_type	= _.goods.item ? _.goods.item.price_type : null;
						_.goods.total_price	= _.goods.item ? _.goods.item.price : 0;

						_.buy_confirm();
					} else {
						urlform(`${$(this).closest('.box').attr('data-id')}`, 'post', '/goods/view');
					}
					eventStop(e);
				});
			}
		});

		// 페이지 버튼을 클릭하기 전에 실행됩니다.
		_.container.addHook('beforePageOnClick', function (key, val) {
			current_page_number = val;
		});
		// 페이지 매김이 초기화된 후 실행됩니다.
		_.container.addHook('afterInit', function (e) {
			let paginationInfiniteList = JSON.parse(getSession('PAGINATION_INFINITE_LIST'));
			if (paginationInfiniteList && paginationInfiniteList.page_type == 'goods') {
				current_page_number = paginationInfiniteList.page_number;
				let scrollY = paginationInfiniteList.scroll_Y;
				if (current_page_number > 1) {
					_.container.pagination('go', current_page_number);
				}
				if (scrollY > 0) {
					window.scrollTo(0, scrollY);
				}
			}
			removeSession('PAGINATION_INFINITE_LIST');
		});
	}

	// 상세 페이지 구성
	view() {
		const _ = this;

		_.goods.item		= goods_items[0];
		_.goods.price_type		= _.goods.item.price_type;
		_.goods.price		= _.goods.item.price;
		_.goods.saved_point	= _.goods.item.saved_point;
		_.goods.total_price		= _.goods.item.price;


		_.wrap_info = document.querySelector('#ContentWrap .goods_wrap .goods_info');
		_.wrap_info.innerHTML = `${_.goods.item.flagTag_2 ? _.goods.item.flagTag_2 : ``}<h2 class="tit">${_.goods.item.title}</h2><div class="thumb"><img src="${_.goods.item.icon_image}" alt=""></div>`;


		_.wrap_sub = document.querySelector('#ContentWrap .goods_wrap .goods_sub');
		const tpl_sub = `<div class="cell">` +
			`<div class="box">` +
				`<h4>아이템정보</h4>` +
				`<div class="info">` +
					`<dl class="row"><dt>판매금액</dt><dd><span class="${_.goods.price_type.toLowerCase()}">${_.goods.item.price_comma}</span></dd></dl>` +
					`<dl class="row"><dt>상세정보</dt><dd><p class="desc">${_.goods.item.iteminfo}</p></dd></dl>${_.goods.item.date_tag}` +
				`</div>` +
			`</div>` +
		`</div>` +
		`<div class="cell">` +
			`<div class="box">` +
				`<h4>합계금액</h4>` +
				`<div class="option_box" id="optionBox">` +
					`<div class="option_info item">` +
						`<div class="option_tit">` +
							`<span class="tit" id="itemTitle">${_.goods.item.select_option_tag}</span>` +
							`<span class="v_align order_count counterWrap">` +
								`<button type="button" class="count_btn down minus">수량 감소</button>` +
								`<input type="text" id="singleGoodsCount" class="count count_num counter" value="1" maxlength="2" style="ime-mode: disabled;" readonly>` +
								`<button type="button" class="count_btn up plus">수량 증가</button>` +
							`</span>` +
						`</div>` +
					`</div>` +
				`</div>` +
				`<div class="info price">` +
					`<dl class="row">` +
						`<dt>총 결제예정 금액</dt>` +
						`<dd><span class="item_price ${_.goods.price_type.toLowerCase()}" id="itemPrice">${_.goods.item.price_comma}</span></dd>` +
					`</dl>` +
					`${_.goods.saved_point ? `<dl class="row"><dt>총 적립예정 포인트</dt><dd><span class="npoint" id="rewardAmount">${_.goods.item.saved_point_comma}</span></dd></dl>` : ``}` +
				`</div>` +
				`<div class="btn_area"><div class="order_area"><div class="btn_bx"><a href="#" id="buyBtn" class="btn buy fn_orderform">구매</a></div></div></div>` +
			`</div>` +
		`</div>`;
		_.wrap_sub.innerHTML = tpl_sub;


		$('#ContentWrap .goods_detail .detail_content .item_table').prepend(_.goods.item.detail_tag);

		
		// 수량 변경 버튼 클릭 이벤트
		_.count_down_btn = document.querySelector('.cell .box .counterWrap .count_btn.down');
		_.count_up_btn = document.querySelector('.cell .box .counterWrap .count_btn.up');
		_.count_down_btn.addEventListener('click', e => {
			_.count_setting(-1);
		});
		_.count_up_btn.addEventListener('click', e => {
			_.count_setting(1);
		});

		// 구매 버튼 클릭 이벤트
		document.querySelector('.cell .box .btn_area .order_area .btn_bx #buyBtn').addEventListener('click', e => {
			// 다중 아이템인 경우 선택된 아이템 설정
			const select_option_val = $('.goods_option input[name="goods_select"]:checked').val();
			if (select_option_val) {
				_.goods.item = goods_items.find((item) => item.itemid == select_option_val);
			}

			_.buy_confirm();
			eventStop(e);
		});
	}

	// 구매 수량의 변화
	count_setting(num) {
		const _ = this;

		if (!_.goods.item) {
			return;
		}

		const input_div		= $('.cell .box');
		const count_input		= input_div.find('.count_num');
		const before_count	= Number(count_input.val());
		if (before_count <= 1 && num == -1) {
			popupShow('최소 구매 수량은 1개 입니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
			return;
		} else if (before_count >= _.goods.item.limitCount && num == 1) {
			popupShow(`최대 구매 수량은 ${_.goods.item.limitCount}개 입니다.`, '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
			return;
		}

		const after_count = before_count + num;
		const after_price = _.goods.item.price * after_count;

		count_input.val(after_count);// 화면 수량 변경
		input_div.find('#itemPrice').text(commaAdd(after_price));// 화면 가격 변경
		_.goods.total_count = after_count;
		_.goods.total_price = after_price;
		if (_.goods.saved_point) {
			input_div.find('#rewardAmount').text(commaAdd(_.goods.saved_point * after_count));// 화면 포인트 변경
		}
	}

	// 구매 검증
	buy_confirm() {
		const _ = this;

		if (!account) {
			popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
			return;
		}
		if (!account.ingame) {
			popupShow('인게임에서 구매할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			return;
		}
		if (!_.goods.item) {
			popupShow('구매할 상품을 선택해주십시오.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
			return;
		}
		if (_.goods.price_type === 'NCOIN' && account.ncoin < _.goods.total_price) {
			popupShow('N코인이 부족합니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
			return;
		}
		if (_.goods.price_type === 'NPOINT' &&  account.npoint < _.goods.total_price) {
			popupShow('N포인트가 부족합니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
			return;
		}
		popupShow('정말로 구매하시겠습니까?', `<span class="type2"><a href="javascript:goods_singleton.do_goods_buy();" class="close">예</a></span>`, '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
	}

	// 구매 처리
	do_goods_buy() {
		const _ = this;

		if (!_.goods.item) {
			popupShow('구매 상품을 발견하지 못했습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
			return;
		}

		if (_.goods_sync) {
			return;
		}
		_.goods_sync = true;// 잠금

		const sendParam = {
			'id' : _.goods.item.id,
			'item_id' : _.goods.item.itemid,
			'buy_count' : _.goods.total_count
		};
		getDatasWithOption([{
			type: 'POST',
			url: '/define/goods/buy',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: sendParam
		}], (data) => {
			switch (data) {
			case 1:
				popupShow('구매가 완료되었습니다.</br></br>부가아이템창고에서</br>확인하시기 바랍니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
				break;
			case 2:
				popupShow('인게임에서 구매할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 3:
				popupShow('계정 정보를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
				break;
			case 4:
				popupShow('대표 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
				break;
			case 5:
				popupShow('월드 내 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
				break;
			case 6:
				popupShow('존재하지 않는 아이템입니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 7:
				popupShow('Ncoin이 부족합니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 8:
				popupShow('Npoint가 부족합니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 9:
				popupShow('판매 가능한 시간이 아닙니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 10:
				popupShow('구매 제한 아이템은 1개씩 구매할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			case 11:
				popupShow('구매 제한 횟수가 초과되었습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			default:
				popupShow('구매에 실패하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				break;
			}
			_.goods_sync = false;// 해재
		}, (data) => {
			_.goods_sync = false;// 해재
		});
	}

	// 내 정보 보기
	show_menu() {
		const _ = this;

		_.menu_btn.classList.add('on');
		_.menu_span.innerText = '접기';
		_.menu_area.style.display = 'block';
	}

	// 내 정보 닫기
	hide_menu() {
		const _ = this;

		_.menu_btn.classList.remove('on');
		_.menu_span.innerText = '마이N샵';
		_.menu_area.style.display = 'none';
	}

	// 이벤트 추가
	addEvents() {
		const _ = this;

		_.searchBtn	= _.searchPanel.find('.btn_search');
		_.searchResetBtn	= $('#MenuWrap .gnb .btn_area .btn_reset');

		_.searchInput.focus(function() {
			$(this).addClass('on');
			$(this).val('');
		});
	
		_.searchResetBtn.on('click', function(event) {
			_.searchInput.val('');
			_.searchInput.focus();
		});
	
		_.searchBtn.click(function() {
			if (!_.searchForm.query.value) {
				_.searchForm.query.value = '';
			}
			_.searchForm.submit();
		});

		if (_.menu_btn) {
			_.menu_btn.addEventListener('click', e => {
				if (_.menu_btn.classList.contains('on')) {
					_.hide_menu();
				} else {
					_.show_menu();
				}
			});
		}
	
		// 영역밖 클릭
		$('body').mouseup(function (e){
			const $target = e.target;
			
			if (!_.searchInput.has($target).length && !_.searchPanel.has($target).length && _.searchInput.hasClass('on')) {
				_.searchInput.removeClass('on');
			}
		
			if (_.menu_btn && !_.menu_area.contains($target) && !_.menu_btn.contains($target)) {
				_.hide_menu();
			}

			eventStop(e);
		});
	}

}