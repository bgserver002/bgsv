/*!
 * project : trade_regist
 * author : LINOFFICE
 * 거래소 상품 등록
 */

let select_item;
let select_amount;
let select_price;
$(function() {
	includeHTML(document.querySelector('#svg-container'), 'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/svg.html', cacheVersion);
	init_progress();
});

// 아이템 정보
function get_item(id) {
	if (!inventory_items) {
		return null;
	}
	var result = inventory_items.find((item) => {
    		return item.id == id;
	});
	return result;
}

// 안내 화면 출력
function init_progress() {
	let init_html = `<section class="init_section">`;
	init_html += `<div class="message_area"><h1>상품 등록 안내</h1><ul>${regist_message}</ul></div>`;
	init_html += `<div class="btn_wrap"><button type="button" class="btn" onClick="select_progress();"><span>다음</span></button></div>`;
	init_html += `</section>`;
	$('.regist_container').html(init_html);
}

const BLESS_FLAG = [
	'bless', '', 'curse',
];

const ELEMENT_DESC = [
	'', 
	'화령 1단 ', '화령 2단 ', '화령 3단 ', '화령 4단 ', '화령 5단 ', 
	'수령 1단 ', '수령 2단 ', '수령 3단 ', '수령 4단 ', '수령 5단 ',
	'풍령 1단 ', '풍령 2단 ', '풍령 3단 ', '풍령 4단 ', '풍령 5단 ',
	'지령 1단 ', '지령 2단 ', '지령 3단 ', '지령 4단 ', '지령 5단 '
];

// 아이템 이름 설정
function get_item_name(element) {
	let result = `<span class="${BLESS_FLAG[element.bless]}">`;
	result += ELEMENT_DESC[element.element];
	if (element.enchant != 0) {
		result += element.enchant > 0 ? `+${element.enchant} ` : `-${element.enchant} `;
	}
	result += element.desc;
	result += ` (${commaAdd(element.count)})`;
	if (element.potential_id > 0) {
		result += ` ${element.potential_desc}`;
	}
	result += `</span>`;
	return result;
}

// 아이템 선택 화면 출력
function select_progress() {
	if (!inventory_items || !inventory_items.length) {
		popupShow('등록 가능한 아이템이 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	let item_list = '';
	$.each(inventory_items, function(index, element){
		item_list += `<li>` +
		`<img src="/img/item/${element.icon}.png" alt="">` +
		`<label for="item${element.id}">${get_item_name(element)}</label>` +
		`<input type="radio" name="select_item" id="item${element.id}" value="${element.id}">` +
		`<div class="wrap-icon"><svg class="fe-svg fe-svg-check_off"><use xlink:href="#fe-svg-check_off"></use></svg><svg class="fe-svg fe-svg-check_on"><use xlink:href="#fe-svg-check_on"></use></svg></div>` +
		`</li>`;
	});
	select_item = undefined;

	let select_html = `<section class="select_section">`;
	select_html += `<div class="message_area"><p>등록할 상품을 선택하십시오.</p></div>`;
	select_html += `<div class="inv_area"><ul>${item_list}</ul><div class="bottom_blank"></div></div>`;
	select_html += `<div class="btn_wrap"><button type="button" class="btn left" onClick="init_progress();"><span>이전</span></button><button type="button" class="btn right" onClick="setting_progress();"><span>다음</span></button></div>`;
	select_html += `</section>`;
	$('.regist_container').html(select_html);
}

// 수량 및 가격 화면 출력
function setting_progress() {
	if (!select_item) {
		var id = $('input:radio[name=select_item]:checked').val();
		if (!id) {
			popupShow('아이템이 선택되지 않았습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			return;
		}
		select_item = get_item(id);
		if (!select_item) {
			popupShow('아이템이 선택되지 않았습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			return;
		}
	}
	select_amount = select_price = undefined;

	let setting_html = `<section class="setting_section">`;
	setting_html += `<div class="message_area"><p>수량 및 가격, 은행 정보를 설정하십시오.</p></div>`;
	setting_html += `<div class="input_area">`;
	setting_html += `<div class="input_box"><label>판매 수량</label><input type="text" autocomplete="off" placeholder="수량을 입력해주세요" id="reg_amount" maxlength="10"></div>`;
	setting_html += `<div class="input_box"><label>판매 가격</label><input type="text" autocomplete="off" placeholder="금액을 입력해주세요" id="reg_price" maxlength="10"></div>`;
	setting_html += `</div>`;
	setting_html += `<div class="btn_wrap"><button type="button" class="btn left" onClick="select_progress();"><span>이전</span></button><button type="button" class="btn right" onClick="finish_progress();"><span>다음</span></button></div>`;
	setting_html += `</section>`;
	$('.regist_container').html(setting_html);

	// 인풋 이벤트 등록
	setInputToComma($('#reg_amount'));
	setInputToComma($('#reg_price'));
}

// 완료할 데이터 설명
function get_finish_item_desc(element) {
	let result = `<span class="${BLESS_FLAG[element.bless]}">`;
	result += ELEMENT_DESC[element.element];
	if (element.enchant != 0) {
		result += element.enchant > 0 ? `+${element.enchant} ` : `-${element.enchant} `;
	}
	if (element.bless == 0) {
		result += `축복받은 `;
	} else if (element.bless == 2) {
		result += `저주받은 `;
	}

	result += element.desc;
	if (element.potential_id > 0) {
		result += ` [${element.potential_desc}]`;
	}
	result += `</span>`;
	return result;
}

// 완료하기 화면 출력
function finish_progress() {
	if (!select_item) {
		popupShow('아이템이 선택되지 않았습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	
	let reg_amount_val = $('#reg_amount').val();
	let reg_amount = Number(commaRemove(reg_amount_val));
	if (!reg_amount_val || reg_amount <= 0) {
		popupShow('수량이 설정되지 않았습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	let reg_price_val = $('#reg_price').val();
	let reg_price = Number(commaRemove(reg_price_val));
	if (!reg_price_val || reg_price <= 0) {
		popupShow('가격이 설정되지 않았습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (reg_price < 1000) {
		popupShow('최소 등록 금액은 1,000원 입니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (reg_price % 1000 != 0) {
		popupShow('1,000원 단위로 등록할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}

	select_amount = reg_amount;
	select_price = reg_price;

	let finish_html = `<section class="finish_section">`;
	finish_html += `<div class="message_area"><p>등록하실 아이템을 확인 후 등록 버튼을 눌러주세요.</p><p>등록완료 즉시 인벤토리에서 회수됩니다.</p></div>`;
	finish_html += `<div class="finish_area">`;
	finish_html += `<div class="icon"><img src="/img/item/${select_item.icon}.png" alt=""></div>`;
	finish_html += `<div class="desc txt">아이템: ${get_finish_item_desc(select_item)}</div>`;
	finish_html += `<div class="amount txt">판매개수: <span>${reg_amount_val}개</span></div>`;
	finish_html += `<div class="coin_area txt">판매가격: <span class="won">${reg_price_val}</span></div>`;
	finish_html += `<div class="seller_name txt">판매자: <span>${account.firstChar.name}</span></div>`;
	finish_html += `</div>`;
	finish_html += `<div class="btn_wrap"><button type="button" class="btn left" onClick="setting_progress();"><span>이전</span></button><button type="button" class="btn right" onClick="regist();"><span>등록</span></button></div>`;
	finish_html += `</section>`;
	$('.regist_container').html(finish_html);
}

// 판매 개수 인풋 검증
function onKeyupAmount(obj) {
	inputCheckNumber(obj);
	var after_val = Number(commaRemove($(obj).val()));
	if (!after_val) {
		return;
	}
	if (after_val > select_item.count) {
		$(obj).val(commaAdd(select_item.count));
	}
}

// 판매 금액 인풋 검증
function onKeyupPrice(obj) {
	inputCheckNumber(obj);
}

function finish_regist() {
	popupClose();// 팝업 종료
	window.opener.location.reload();// 부모 윈도우 리로드
	window.self.close();// 자신 종료
}

let regist_lock = false;
function regist() {
	if (regist_lock) {
		return;
	}
	
	const sendData = {
		'id' : select_item.id, 
		'amount' : select_amount, 
		'price' : select_price
	};
	regist_lock = true;
	getDatasWithOption([{
		type: 'POST',
		url: '/define/trade/regist',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: sendData
	}], (data) => {
		switch (data) {
		case 1:
			popupShow('정상적으로 등록되었습니다.', '<span class="type2"><a href="javascript:finish_regist();" class="close">닫기</a></span>', null);
			break;
		case 2:
			popupShow('인게임에서 등록할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 3:
			popupShow('계정 정보를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 4:
			popupShow('대표 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 5:
			popupShow('월드 내 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 6:
			popupShow('인벤토리에 아이템이 존재하지 않습니다. ', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 7:
			popupShow('보유중인 수량이 판매할 수량보다 적습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 8:
			popupShow('계좌가 등록되어 있지 않습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 9:
			popupShow('고객님께서는 이용제한 상태입니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		default:
			popupShow('등록에 실패하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		}
		regist_lock = false;// 해재
	}, (data) => {
		regist_lock = false;// 해재
	});
}
