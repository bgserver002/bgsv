/*!
 * project : trade
 * author : LINOFFICE
 * 거래소
 */

$(function() {
	// 사기꾼 목록 설정
	if (swindler && swindler.length) {
		create_swindler();
	}

	// 추천어 설정
	$('#searchForm #SearchInput').val(query ? query : '1억 아데나 수표');
	
	// 버튼 생성
	if (account && account.firstChar) {
		$('.top_wrap').append(`<div class="seller_area"><div class="seller_btn"><button type="button" class="seller_items">나의 상품 보기</button><button type="button" class="reg_item">상품 등록 하기</button></div></div><div class="bank_area"><button type="button" class="reg_bank">${!bank ? `계좌 등록` : `계좌 변경`}</button></div>`);
	}

	// 판매 상품 버튼 생성
	function get_trade_progress_button(item) {
		switch(item.status_code) {
		case 'REGIST':
			return account && account.firstChar && account.firstChar.name === item.seller_name ? 
				`<a href="javascript:cancelConfirm(${item.id});" class="btn direct fn_orderform">판매취소</a>` 
				: `<a href="javascript:buyConfirm(${item.id});" class="btn direct fn_orderform">구매신청</a>`;
		case 'TRADING':
			return account && account.firstChar && account.firstChar.name === item.seller_name ? 
				`<a href="javascript:completeConfirm(${item.id});" class="btn direct fn_orderform">입금완료</a>` 
				: account && account.firstChar && account.firstChar.name === item.buyer_name ? 
				`<a href="javascript:buyCancelConfirm(${item.id});" class="btn direct fn_orderform">구매취소</a>` 
				: `<a class="btn direct fn_orderform">거래중</a>`;
		case 'COMPLETE':
			return `<a class="btn direct fn_orderform">거래완료</a>`;
		case 'CANCEL':
			return `<a class="btn direct fn_orderform">취소상품</a>`;
		case 'ERROR':
			return `<a class="btn direct fn_orderform">오류상품</a>`;
		}
	}
	
	let render_container = $('.pagination-container');
	function page_render(render_data) {
		render_container.pagination({
			dataSource:		render_data,
			pageSize:			18,// 한 화면에 보여질 개수
			showPrevious:		false,// 처음버튼 삭제
			showNext:		false,// 마지막버튼 삭제
			showPageNumbers:	true,// 페이지 번호표시
			callback: function (data, pagination) {// 화면 출력
				let dataHtml = '';
				if (data.length) {
					$.each(data, function (index, item) {
						dataHtml +=
						`<div class="sub_card"><div class="box ${item.status_code}" id="displayGoodsData">` +
							(!account || !account.gm ? `` : `<div class="btn_delete"><button onClick="delete_item(${item.id});">삭제</button></div>`) +
							`<a href="javascript:view_detail(${item.id});" class="lnk_detail">` +
								`<div class="img_area"><img src="/img/item/${item.itemVO.invgfx}.png" alt="" class="item_img"></div>` +
								`<div class="item_info"><div class="v_align">` +
									`<div class="tit_area"><em class="tit">${item.description}</em></div>` +
									`<div class="coin_area"><span class="won">${commaAdd(item.price)}</span></div>` +
								`</div></div>` +
		                				`</a>` +
							`<div class="btn_area">${get_trade_progress_button(item)}</div>` +
						`</div></div>`;
					});
				} else {
					dataHtml += `<div class="search_not_found"><em>판매 중인 상품이 없습니다.</em><p>검색어의 철자가 정확한지 확인해주세요.<br> 검색어가 두 단어 이상일 경우, 띄어쓰기를 확인해주세요.</p></div>`;
				}
				$('.data-loader').css('display', 'none');
				$(".sub_wrap").html(dataHtml);// 렌더링
			}
		});
	}

	var searchInput = $('#SearchInput');
	var searchBtn = $('#searchPanel').find('.btn_search');
	// 검색 폼 인풋 포커스 이벤트
	searchInput.focus(function(){
		$(this).addClass('on');
		$(this).val('');
	});
	
	// 검색 폼 인풋 초기화 이벤트
	$('.gnb .btn_area .btn_reset').on('click', function(event) {
		searchInput.val('');
		searchInput.focus();
	});
	
	// 검색 폼 검색 이벤트
	searchBtn.click(function() {
		var searchform = document.searchForm;
		if (!searchform.query.value) {
			searchform.query.value='';
		}
		searchform.submit();
	});

	// 계좌 등록 하기 버튼 이벤트
	$('.reg_bank').on('click', function(e){
		openBankPopup();
	});

	// 나의 상품 보기 버튼 이벤트
	$('.seller_items').on('click', function(e){
		let btn_html = $(this).html();
		render_container.destory;
		if (btn_html === '나의 상품 보기') {
			page_render(seller_items);
			$(this).text('전체 보기');
		} else {
			page_render(trade_items);
			$(this).text('나의 상품 보기');
		}
	});

	// 상품 등록 하기 버튼 이벤트
	$('.reg_item').on('click', function(e){
		openTradeRegistPopup();
	});
	
	// 정렬 버튼 클릭 이벤트
	var dropdown		= $('.ui-dropdown'),
		dropdownSelect	= $('.ui-dropdown-custom_items');
	dropdown.on('click', function(event) {
		if ($(this).hasClass('is-active')) {
			dropdown.removeClass('is-active');
		} else {
			dropdown.removeClass('is-active');
			$(this).addClass('is-active');
		}
	});
	
	// 정렬 항목 선택 이벤트
	dropdownSelect.on('click', function(event) {
		let selectOption = $(this).attr('data-textvalue');
		let selectVal = $(this).attr('data-value');
		if (selectOption === $('.ui-dropdown.is-active .select').find('span').html()) {
			return;
		}
		$('.ui-dropdown.is-active .select').find('span').html(selectOption);
		if (!trade_items) {
			return;
		}

		let sort_items = [];
		for (var i = 0; i < trade_items.length; i++) {
			if (selectVal == 'ALL' || trade_items[i].status_code == selectVal) {
				sort_items.push(trade_items[i]);
			}
		}
		render_container.destory;
		page_render(sort_items);
	});
	
	// 영역밖 클릭
	$('body').mouseup(function (e){
		var searchPanel = $('#searchPanel');
		if (!searchInput.has(e.target).length && !searchPanel.has(e.target).length && searchInput.hasClass('on')) {
			searchInput.removeClass('on');
		}
		
		if (!dropdown.has(e.target).length && !dropdownSelect.has(e.target).length && dropdown.hasClass('is-active')) {
			dropdown.removeClass('is-active');
		}

		var detail_div = $('#trade_item_detail_view');
		if (!detail_div.has(e.target).length && detail_div.hasClass('is_active')) {
			close_detail();
		}
		eventStop(e);
	});

	// initialize rendering
	page_render(trade_items);
});

// 사기꾼 목록 설정
function create_swindler() {
	let tpl_swindler = swindler.map((item, idx) => {
		return `<tr><td>${item.target_name}</td><td>${item.bank}</td><td>${item.bank_number}</td></tr>`;
	}).join('');
	$('body').prepend(`<div id='swindler_wrap' style='display:none; position: fixed; z-index: 1; top: 30%; width: 100%; text-align: center;'><div style='display: inline-block; background: #fff; border: 1px solid #ddd; padding: 20px 20px 10px 20px;'><table border="1" width ="500" bordercolor="black" cellspacing="1"><caption style="font-size: 18px; font-weight: 600; padding-bottom: 10px;">사기꾼 목록</caption><tr><th scope="col" width="25%">계좌주</td><th scope="col" width="25%">은행</td><th scope="col" width="50%">계좌번호</td></tr>${tpl_swindler}</table><button style="background: #e13737; color: #fff; font-size: 15px; padding: 3px 10px; margin-top: 10px; border-radius: 5px;">닫기</button></div></div>`);
	const swindler_wrap = document.querySelector('#swindler_wrap');
	const swindler_close_btn = document.querySelector('#swindler_wrap button');
	swindler_close_btn.addEventListener('click', e => {
		swindler_wrap.style.display = 'none';
	});

	$('.message_wrap .message_area').prepend(`<button id="swindler_show_btn" style="background: #e13737; color: #fff; padding: 5px; float: right; border-radius: 5px;">사기꾼 목록 보기</button>`);
	const swindler_show_btn = document.querySelector('#swindler_show_btn');
	swindler_show_btn.addEventListener('click', e => {
		swindler_wrap.style.display = '';
	});
}

// 계좌 등록 팝업
function openBankPopup() {
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	openPopup('/bank', 480, 650, 'bankForm', 1, 0, false);
}

// 상품 등록 팝업
function openTradeRegistPopup() {
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	if (!account.ingame) {
		popupShow('인게임에서 등록할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	if (!bank) {
		popupShow('계좌등록 후 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	openPopup('/trade/regist', 480, 650, 'tradeRegistForm', 1, 0, false);
}

// 판매 상품 정보
function get_trade(id) {
	if (!trade_items) {
		return null;
	}
	let result = trade_items.find((item) => {
    		return item.id == id;
	});
	return result;
}

// 상세 보기 닫기 이벤트
function close_detail() {
	$('.dimmed').fadeOut();
	$('#trade_item_detail_view').removeClass('is_active');
}

const ELEMENT_DESC = [
	'없음', 
	'화령 1단', '화령 2단', '화령 3단', '화령 4단', '화령 5단', 
	'수령 1단', '수령 2단', '수령 3단', '수령 4단', '수령 5단',
	'풍령 1단', '풍령 2단', '풍령 3단', '풍령 4단', '풍령 5단',
	'지령 1단', '지령 2단', '지령 3단', '지령 4단', '지령 5단'
];

// 상세 보기 출력 이벤트
function view_detail(id) {
	var trade = get_trade(id);
	if (!trade) {
		return;
	}

	const view_div = $('#trade_item_detail_view');
	if (view_div.hasClass('is_active')) {
		return;
	}
	const status_code = trade.status_code;
	let create_html = `<div class="icon"><img src="/img/item/${trade.itemVO.invgfx}.png" alt="" class="item_img"></div>`;
	create_html += `<table><tbody><tr><th style="width: 25%;">구분</th><th style="width: 75%;">내용</th></tr></tbody><tbody>`;
	create_html += `<tr><td class="td_key">판매명</td><td class="td_val">${trade.description}</td></tr>`;
	create_html += `<tr><td class="td_key">가격</td><td class="td_val price">${commaAdd(trade.price)}</td></tr>`;
	create_html += `<tr><td class="td_key">아이템</td><td class="td_val">${trade.itemVO.name}</td></tr>`;
	create_html += `<tr><td class="td_key">개수</td><td class="td_val">${commaAdd(trade.amount)}</td></tr>`;
	create_html += `<tr><td class="td_key">축복</td><td class="td_val">${trade.bless_code == 'BLESS' ? `축복` : trade.bless_code == 'CURSE' ? `저주` : `일반`}</td></tr>`;
	create_html += `<tr><td class="td_key">인챈트</td><td class="td_val">${trade.enchant_level}</td></tr>`;
	create_html += `<tr><td class="td_key">속성</td><td class="td_val">${ELEMENT_DESC[trade.element_level]}</td></tr>`;
	create_html += `<tr><td class="td_key">잠재력</td><td class="td_val">${trade.potential_id > 0 ? trade.potential_desc : `없음`}</td></tr>`;
	create_html += `<tr><td class="td_key">판매자</td><td class="td_val">${trade.seller_name}</td></tr>`;
	create_html += `<tr><td class="td_key">등록일</td><td class="td_val">${trade.regist_date}</td></tr>`;
	create_html += `<tr><td class="td_key">구매자</td><td class="td_val">${!trade.buyer_name ? `-` : trade.buyer_name}</td></tr>`;
	create_html += `<tr><td class="td_key">완료일</td><td class="td_val">${!trade.complete_date ? `-` : trade.complete_date}</td></tr>`;
	create_html += `<tr><td class="td_key">상태</td><td class="td_val">${status_code == 'COMPLETE' ? `거래완료` : status_code == 'TRADING' ? `거래중` : status_code == 'CANCEL' ? `취소상품` : status_code == 'ERROR' ? `오류상품` : `판매상품`}</td></tr>`;
	create_html += `</tbody></table>`;

	switch (status_code) {
	case 'REGIST':
		if (account && account.firstChar && account.firstChar.name === trade.seller_name) {
			create_html += `<div class="btn"><button type="button" onClick="close_detail(); cancelConfirm(${trade.id});">판매취소</button></div>`;
		} else {
			create_html += `<div class="btn"><button type="button" onClick="close_detail(); buyConfirm(${trade.id});">구매신청</button></div>`;
		}
		break;
	case 'TRADING':
		if (account && account.firstChar) {
			if (account.firstChar.name === trade.seller_name) {
				create_html += `<div class="btn"><button type="button" onClick="close_detail(); completeConfirm(${trade.id});">입금완료</button></div>`;
			} else if (account.firstChar.name === trade.buyer_name) {
				create_html += `<div class="btn"><button type="button" onClick="close_detail(); buyCancelConfirm(${trade.id});">구매취소</button></div>`;
			}
		}
		break;
	}

	view_div.children('.info').html(create_html);
	view_div.addClass('is_active');
	$('.dimmed').fadeIn();
}

// 물품 삭제
let delete_lock = false;
function delete_item(id) {
	if (!account || !account.gm) {
		return;
	}
	if (!confirm('정말로 삭제하시겠습니까?')) {
		return;
	}
	if (delete_lock) {
		return;
	}
	delete_lock = true;// 잠금

	getDatasWithOption([{
		type: 'POST',
		url: '/define/trade/delete',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: { 'id' : id }
	}], (data) => {
		popupShow(!data ? '삭제에 실패하였습니다.' : '정상적으로 삭제되었습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
		delete_lock = false;// 해재
	}, (data) => {
		delete_lock = false;// 해재
	});
}

// 구매신청 유효성 검사 이벤트
function buyValidation(){
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return false;
	}
	if (!account.ingame) {
		popupShow('인게임에서 구매신청할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return false;
	}
	if (!bank) {
		popupShow('계좌등록 후 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return false;
	}
	return true;
}

// 구매신청 컨펌
function buyConfirm(id){
	if (!buyValidation()) {
		return;
	}
	const trade = get_trade(id);
	if (!trade) {
		popupShow('구매신청할 상품을 발견하지 못했습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	if (trade.status_code != 'REGIST') {
		popupShow('해당 상품은 구매신청할 수 없는 상품입니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">확인</a></span>', null);
		return;
	}
	if (account.name == trade.seller_acccount_name) {
		popupShow('같은 계정내 캐릭터는 구매신청할 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	popupShow('정말로 구매신청하시겠습니까?', `<span class="type2"><a href="javascript:tradeBuy(${id});" class="close">예</a></span>`, `<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>`);
}

// 구매신청 하기 결과
var buyLock = false;// 인게임과의 통신시 딜레이 방지
function tradeBuy(id){
	if (buyLock) {
		return;
	}
	buyLock = true;// 잠금

	getDatasWithOption([{
		type: 'POST',
		url: '/define/trade/buy',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: { 'id' : id }
	}], (data) => {
		switch (data) {
		case 1:
			popupShow('구매신청이 완료되었습니다.<br>판매자 정보가 편지로 전송되었습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 2:
			popupShow('인게임에서 구매신청할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
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
			popupShow('계좌등록 후 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 7:
			popupShow('등록된 물품을 발견하지 못하였습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 8:
			popupShow('해당 물품은 구매할 수 없습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 9:
			popupShow('판매자가 접속중이지 않습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 10:
			popupShow('판매자 계좌정보를 발견하지 못하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		default:
			popupShow('구매신청에 실패하였습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		}
		buyLock = false;// 해재
	}, (data) => {
		buyLock = false;// 해재
	});
}

// 구매 취소 사유 폼 닫기 이벤트
function close_cancel() {
	$('.dimmed').fadeOut();
	$('#trade_cancel_descryption').removeClass('is_active');
}

// 구매취소 컨펌
function buyCancelConfirm(id){
	const trade = get_trade(id);
	if (!trade) {
		popupShow('구매취소할 상품을 발견하지 못했습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	if (trade.status_code != 'TRADING') {
		popupShow('해당 상품은 구매취소할 수 없는 상품입니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">확인</a></span>', null);
		return;
	}
	if (account.firstChar.name != trade.buyer_name) {
		popupShow('구매 신청 캐릭터만 취소할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}

	const cancel_div = $('#trade_cancel_descryption');
	if (cancel_div.hasClass('is_active')) {
		return;
	}
	let create_html = `<div><label>구매취소 사유</label><input type="text" name="cancel_descryption" id="cancel_descryption" autocomplete="off" placeholder="구매취소 사유를 입력하십시오." maxlength="100" /></div>`;
	create_html += `<div class="btn"><button type="button" onClick="buyCancelDescryptionForm(${id});">구매취소</button></div>`;

	cancel_div.children('.info').html(create_html);
	cancel_div.addClass('is_active');
	$('.dimmed').fadeIn();
}

// 구매취소 사유 입력 폼
function buyCancelDescryptionForm(id){
	if (!$('#cancel_descryption').val()) {
		$('#cancel_descryption').focus();
		return;
	}
	close_cancel();
	popupShow('정말로 구매취소 하시겠습니까?', `<span class="type2"><a href="javascript:tradeBuyCancel(${id});" class="close">예</a></span>`, `<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>`);
}

// 구매취소 하기 결과
var buyCancelLock = false;// 인게임과의 통신시 딜레이 방지
function tradeBuyCancel(id){
	if (buyCancelLock) {
		return;
	}
	buyCancelLock = true;// 잠금

	const cancel_descryption = $('#cancel_descryption').val();
	getDatasWithOption([{
		type: 'POST',
		url: '/define/trade/buyCancel',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: { 'id' : id, 'cancel_descryption' : cancel_descryption }
	}], (data) => {
		switch (data) {
		case 1:
			popupShow('구매취소가 완료되었습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 2:
			popupShow('계정 정보를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 3:
			popupShow('대표 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 4:
			popupShow('등록된 물품을 발견하지 못하였습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 5:
			popupShow('해당 물품은 구매취소할 수 없습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 6:
			popupShow('구매 신청자만 취소할 수 있습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		default:
			popupShow('구매취소에 실패하였습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		}
		buyCancelLock = false;// 해재
	}, (data) => {
		buyCancelLock = false;// 해재
	});
}

// 입금완료 유효성 검사 이벤트
function completeValidation(){
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return false;
	}
	if (!account.ingame) {
		popupShow('인게임에서 진행할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return false;
	}
	return true;
}

// 입금확인 컨펌
function completeConfirm(id){
	if (!completeValidation()) {
		return;
	}
	const trade = get_trade(id);
	if (!trade) {
		popupShow('완료할 물품을 발견하지 못했습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	if (trade.status_code != 'TRADING') {
		popupShow('해당 물품은 거래중인 물품이 아닙니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">확인</a></span>', null);
		return;
	}
	popupShow('정말로 입금완료 하시겠습니까?', `<span class="type2"><a href="javascript:tradeComplete(${id});" class="close">예</a></span>`, `<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>`);
}

// 입금완료 결과
var completeLock = false;// 인게임과의 통신시 딜레이 방지
function tradeComplete(id){
	if (completeLock) {
		return;
	}
	completeLock = true;// 잠금

	getDatasWithOption([{
		type: 'POST',
		url: '/define/trade/complete',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: { 'id' : id }
	}], (data) => {
		switch (data) {
		case 1:
			popupShow('거래가 정상적으로 완료되었습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 2:
			popupShow('인게임에서 진행할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
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
		case 10:
			popupShow('등록된 물품을 발견하지 못하였습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 7:
			popupShow('자신의 물품이 아닙니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 8:
			popupShow('해당 물품은 거래중인 물품이 아닙니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 9:
			popupShow('구매자가 접속중이지 않습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 11:
			popupShow('물품의 상태를 변경하지 못하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 12:
			popupShow('구매자에게 물품을 전달하지 못하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		default:
			popupShow('입금완료에 실패하였습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		}
		completeLock = false;// 해재
	}, (data) => {
		completeLock = false;// 해재
	});
}

// 판매 취소 유효성 검증
function cancelValidation(){
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return false;
	}
	if (!account.ingame) {
		popupShow('인게임에서 취소할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return false;
	}
	if (!account.firstChar) {
		popupShow('대표 캐릭터가 선택되지 않았습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return false;
	}
	return true;
}

// 판매 취소 컨펌
function cancelConfirm(id){
	if (!cancelValidation()) {
		return;
	}
	const trade = get_trade(id);
	if (!trade) {
		popupShow('취소할 물품을 발견하지 못했습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	if (account.firstChar.name != trade.seller_name) {
		popupShow('해당 물품의 소유자가 아닙니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	if (trade.status_code != 'REGIST') {
		popupShow('해당 물품은 취소할 수 없습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">확인</a></span>', null);
		return;
	}
	popupShow('정말로 취소하시겠습니까?', `<span class="type2"><a href="javascript:tradeCancel(${id});" class="close">예</a></span>`, `<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>`);
}

// 판매 취소 결과
var cancelLock = false;// 인게임과의 통신시 딜레이 방지
function tradeCancel(id){
	if (cancelLock) {
		return;
	}
	cancelLock = true;// 잠금

	getDatasWithOption([{
		type: 'POST',
		url: '/define/trade/cancel',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: { 'id' : id }
	}], (data) => {
		switch (data) {
		case 1:
			popupShow('취소가 정상적으로 완료되었습니다.</br></br>취소된 아이템은 인벤토리에 지급되었습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 2:
			popupShow('인게임에서 취소할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
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
			popupShow('존재하지 않는 물품입니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 7:
			popupShow('해당 물품은 취소할수 없습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 8:
			popupShow('해당 물품의 소유자가 아닙니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		default:
			popupShow('취소에 실패하였습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		}
		cancelLock = false;// 해재
	}, (data) => {
		cancelLock = false;// 해재
	});
}