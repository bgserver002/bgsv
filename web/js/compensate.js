/*!
 * project : compensate
 * author : LINOFFICE
 * 보상 안내
 */

let purchase_container = [];// 매입 시킬 아이템 컨테이너
$(function() {
	$('.wrap_contents_support .ncoin_status .ncoin').text(!account ? '로그인 후 확인할 수 있습니다.' : commaAdd(account.ncoin));

	// 매입 아이템 출력
	if (purchaseItems && purchaseItems.length) {
		show_purchaseItems();
	}

	// 매입 리스트 보기
	let list_info = $('.pur_item_list_info');
	$('.pur_item_list button.list_show').on('click', function(e) {
		if (list_info.hasClass('on')) {
			list_info.removeClass('on');
		} else {
			list_info.addClass('on');
		}
	});

	// 매입 리스트 닫기
	$('.pur_item_list button.list_close').on('click', function(e) {
		list_info.removeClass('on');

	});

	// 매입 아이템 선택
	$('#purchase_list .purchase_item').on('click', function(e) {
		const purchase_check = $(this).find('.item_check');
		const purchase_checked = purchase_check.prop('checked');
		const item_object_id = $(this).attr('data-id');
		const item_price = Number($(this).attr('data-price'));
		const before_price = Number(commaRemove($('#expected_ncoin em').text()));
		if (purchase_checked) {
			purchase_check.prop('checked', false);
			for (var i=0; i<purchase_container.length; i++) {
				if (purchase_container[i].itemObjectId == item_object_id) {
					purchase_container.splice(i, 1); 
					break;
				}
			}
			$('#expected_ncoin em').text(commaAdd(before_price - item_price));
			$(this).removeClass('on');
		} else {
			purchase_check.prop('checked', true);
			for (var i=0; i<purchaseItems.length; i++) {
				if (purchaseItems[i].itemObjectId == item_object_id) {
					purchase_container.push(purchaseItems[i]);
					break;
				}
			}
			$('#expected_ncoin em').text(commaAdd(before_price + item_price));
			$(this).addClass('on');
		}
	});

	$('.scrollbar-macosx').scrollbar();
});

// 전체 선택 이벤트
function purchase_all_select() {
	let list_items = $('#purchase_list .purchase_item');
	if (!list_items) {
		return;
	}
	if ($('#all_select').text() === '전체선택') {
		$('#all_select').text('전체해제');
		$.each(list_items, function(index, item){
			const purchase_check = $(item).find('.item_check');
			const purchase_checked = purchase_check.prop('checked');
			if (!purchase_checked) {
				const item_object_id = $(item).attr('data-id');
				const item_price = Number($(item).attr('data-price'));
				const before_price = Number(commaRemove($('#expected_ncoin em').text()));
				purchase_check.prop('checked', true);
				for (var i=0; i<purchaseItems.length; i++) {
					if (purchaseItems[i].itemObjectId == item_object_id) {
						purchase_container.push(purchaseItems[i]);
						break;
					}
				}
				$('#expected_ncoin em').text(commaAdd(before_price + item_price));
				$(item).addClass('on');
			}
		});
	} else {
		$('#all_select').text('전체선택');
		$.each(list_items, function(index, item){
			const purchase_check = $(item).find('.item_check');
			const purchase_checked = purchase_check.prop('checked');
			if (purchase_checked) {
				const item_object_id = $(item).attr('data-id');
				const item_price = Number($(item).attr('data-price'));
				const before_price = Number(commaRemove($('#expected_ncoin em').text()));
				purchase_check.prop('checked', false);
				for (var i=0; i<purchase_container.length; i++) {
					if (purchase_container[i].itemObjectId == item_object_id) {
						purchase_container.splice(i, 1); 
						break;
					}
				}
				$('#expected_ncoin em').text(commaAdd(before_price - item_price));
				$(item).removeClass('on');
			}
		});
	}
}

// 아이템 매입 리스트 출력
function show_purchaseItems() {
	let purchase_list_html = purchaseItems.map((element, i) => {
		return `<li class="purchase_item" data-id="${element.itemObjectId}" data-enchant="${element.enchant}" data-elemental="${element.elemental}" data-bless="${element.bless}" data-price="${element.price}">` +
		`<div class="left_div"><img src="/img/item/${element.icon}.png"><span class="desc">${element.descryption}</span><span class="price">${commaAdd(element.price)}</span></div>` +
		`<input type="checkbox" class="item_check" disabled>` +
		`</li>`;
	}).join(``);
	$('.current_status').prepend(`<div id="purchase_container"><div class="top"><span class="top_title">매입 가능 보유 아이템 ${purchaseItems.length} 개</span><button id="all_select" onClick="purchase_all_select();">전체선택</button></div><div id="purchase_list" class="scrollbar-macosx"><ul>${purchase_list_html}</ul></div><div class="bottom"><div id="purchase_btn"><button onClick="purchase_confirm();">매입하기</button></div><div id="expected_ncoin">매입 예상 총 금액<em>0</em></div></div></div>`);
}

var purchaseLock = false;// 인게임과의 통신시 딜레이 방지
function purchase_item() {
	if (purchaseLock) {
		return;
	}
	let ids = '';
	for (var i=0; i<purchase_container.length; i++) {
		if (i > 0) {
			ids += '|';
		}
		ids += purchase_container[i].itemObjectId;
	}
	purchaseLock = true;
	$('.dimmed').css('display', 'block');
	$('#send_delay').css('display', 'block');
	const sendData = {"select_items" : ids};
	getDatasWithOption([{
		type: 'POST',
		url: '/define/compensate/purchase',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: sendData
	}], (data) => {
		$('#send_delay').css('display', 'none');
		switch(data){
		case 1:
			popupShow('정상적으로 완료되었습니다.', '<span class="type2"><a href="javascript:popupCloseReload();" class="close">닫기</a></span>', null);
			break;
		case 2:
			popupShow('인게임에서 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 3:
			popupShow('계정을 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 4:
			popupShow('대표 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 5:
			popupShow('월드 내 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 6:
			popupShow('매입 가능 보유 아이템을 찾을 수 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 7:
			popupShow('선택한 아이템 정보를 전달하지 못하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 8:
			popupShow('선택한 아이템을 파싱하지 못하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 9:
			popupShow('인벤토리에서 아이템을 발견하지 못하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 10:
			popupShow('지금은 이용할 수 있는 기간이 아닙니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		default:
			popupShow('매입에 실패하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		}
		purchaseLock = false;// 해재
	}, (data) => {
		purchaseLock = false;// 해재
		$('.dimmed').css('display', 'none');
		$('#send_delay').css('display', 'none');
	});
}

// 아이템 매입 버튼 클릭 이벤트
function purchase_confirm() {
	if (!account) {
		popupShow('로그인 후 이용할 수 있습니다..', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (!account.ingame) {
		popupShow('인게임에서 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (!purchase_container || !purchase_container.length) {
		popupShow('매입시킬 아이템을 선택하십시오.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	popupShow('정말로 매입 시키겠습니까?', '<span class="type2"><a href="javascript:purchase_item();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
}

var changeLock = false;// 인게임과의 통신시 딜레이 방지
function couponChange(){
	if (changeLock) {
		return;
	}
	let to_email = '';
	if (!$('#to_mail') || !$('#to_mail').val()) {
		to_email = '';
	} else {
		if (!is_email_check($('#to_mail').val())) {
			popupShow('이메일이 올바르지 않습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			return;
		}
		to_email = $('#to_mail').val();
	}
	const sendData = {"to_email" : to_email};
	$('.dimmed').css('display', 'block');
	$('#send_delay').css('display', 'block');
	changeLock = true;// 잠금
	getDatasWithOption([{
		type: 'POST',
		url: '/define/compensate',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: sendData
	}], (data) => {
		switch(data.code){
		case 1:
			popupShow('발급 쿠폰 번호\r\n' + data.number, '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			$('.create_number').html(`<div class="coupon_number"><strong>발급 쿠폰 번호 : </strong><strong>${data.number}</strong></div>`);
			account.ncoin = 0;
			$('.wrap_contents_support .ncoin_status .ncoin').text('0');
			break;
		case 2:
			popupShow('계정을 찾을 수 없습니다.', '<span class="type2"><a href="javascript:loginIngame();" class="close">설정</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">닫기</a></span>');
			break;
		case 3:
			popupShow('보유중인 NCOIN이 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 4:
			popupShow('메일 전송에 실패하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		case 5:
			popupShow('지금은 이용할 수 있는 기간이 아닙니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		default:
			popupShow('등록에 실패하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			break;
		}
		changeLock = false;// 해재
		$('.dimmed').css('display', 'none');
		$('#send_delay').css('display', 'none');
	}, (data) => {
		changeLock = false;// 해재
		$('.dimmed').css('display', 'none');
		$('#send_delay').css('display', 'none');
	});
}

function change_confirm() {
	if (!account) {
		popupShow('로그인 후 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	if (!account.ncoin) {
		popupShow('보유중인 NCOIN이 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	if (purchaseItems && purchaseItems.length) {
		popupShow('매입할 아이템이 존재합니다.<br>바로 환전 하시겠습니까?', '<span class="type2"><a href="javascript:couponChange();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	popupShow('정말로 환전 하시겠습니까?', '<span class="type2"><a href="javascript:couponChange();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
}