/*!
 * project : popup
 * author : LINOFFICE
 * 팝업
 */

function popupShowSimple(str){
	const layer_alert	= $('#layer_alert');
	$('.con').html(str);
	$('.wrapper .btn_modal').html('<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>');
	$(layer_alert).css('display', 'block');
	$('.dimmed').fadeIn();
}

function popupShow(html, btn_1, btn_2){
	const layer_alert	= $('#layer_alert');
	$('.con').html(html);
	let modal			= $('.btn_modal'),
		btn_html		= '';
	if (btn_1) {
		btn_html += btn_1;
	}
	if (btn_2) {
		btn_html += btn_2;
	}
	$(modal).html(btn_html);
	$(layer_alert).css('display', 'block');
	$('.dimmed').fadeIn();
}

function popupClose(){
	let layer_alert = $('#layer_alert');
	layer_alert.css('display', 'none');
	$('.dimmed').fadeOut();
}

function popupCloseReload(){
	location.reload();
}

function ncuim_modal_show(message, confirm_val, callback_val = '') {
	let tpl = `<div class="ncuim-backdrop ncuim-center ncuim-backdrop-show" id="ncuim-modal"><div class="ncuim-container cnb-modal ncuim-container-show"><div class="ncuim-wrapper"><div class="ncuim-content has-button"><div class="ncuim-title">${message}`;
	if (!confirm_val) {
		tpl += `</div></div><div class="ncuim-buttons"><button type="button" class="ncuim-button__confirm ncuim-button__union" onClick="$('#ncuim-modal').remove(); $('body').removeClass('ncuim-shown'); ${callback_val}">확인</button></div></div></div></div>`;
	} else {
		tpl += `</div></div><div class="ncuim-buttons"><button type="button" class="ncuim-button__confirm ncuim-button__union yes" onClick="$('#ncuim-modal').remove(); $('body').removeClass('ncuim-shown'); ${confirm_val} ${callback_val}">예</button><button type="button" class="ncuim-button__confirm ncuim-button__union no" onClick="$('#ncuim-modal').remove(); $('body').removeClass('ncuim-shown');">아니오</button></div></div></div></div>`;
	}
	$('body').append(tpl);
	$('body').addClass('ncuim-shown');
}

// =============================================================
// 충전 팝업
// =============================================================
function openChargePopup() {
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	if (!account.ingame) {
		popupShow('인게임에서 충전할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	openPopup('/charge/form', 480, 650, 'chargeForm', 1, 0, false, true);
}

// =============================================================
// 쿠폰함 팝업
// =============================================================
function openCouponPopup() {
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	openPopup('/coupon/form', 510, 694, 'couponForm', 1, 0, false, true);
}

// =============================================================
// 선물 팝업
// =============================================================
function openNCoinGiftPopup() {
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	if (!account.ingame) {
		popupShow('인게임에서 선물할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	if (!account.ncoin) {
		popupShow('보유중인 N코인이 없습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	openPopup('/gift/form', 480, 650, 'giftForm', 1, 0, false, true);
}

// =============================================================
// 아이템 컬렉션 팝업
// =============================================================
function openCollectionPopup() {
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	if (!account.ingame) {
		popupShow('인게임에서 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	openPopup('/collection', 850, 657, 'collectionForm', 1, 0, false, false);
}

// =============================================================
// 유튜브 방송 보상 팝업
// =============================================================
function openYoutubeLiveStreamingPopup() {
	if (!account) {
		popupShow('로그인 후 이용 가능합니다.</br>로그인 하시겠습니까?', '<span class="type2"><a href="javascript:login();" class="close">예</a></span>', '<span class="type1"><a href="javascript:popupClose();" class="close">아니오</a></span>');
		return;
	}
	if (!account.ingame) {
		popupShow('인게임에서 이용할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">확인</a></span>', null);
		return;
	}
	openPopup('/youtubelivestreaming', 560, 420, 'youtubeForm', 1, 0, false, false);
}