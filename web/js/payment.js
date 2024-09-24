/*!
 * project : iamport
 * author : LINOFFICE
 * N코인 결재
 */

document.addEventListener('contextmenu', event => event.preventDefault());
function finish_charge() {
	popupClose();// 팝업 종료
	window.opener.location.reload();// 부모 윈도우 리로드
	window.self.close();// 자신 종료
}

// 주문 번호 생성
function createOrderNum() {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	let orderNum = year + month + day;
	for (let i = 0; i < 5; i++) {
		orderNum += Math.floor(Math.random() * 8);
	}
	return parseInt(orderNum);
}

$(function(){
	const IMP = window.IMP; // 생략가능
	IMP.init(iamportApiCode); // 'iamport'에서 부여받은 가맹점 식별코드
	IMP.request_pay({
		pg :		'kakaopay',				// 결재 수단 PG사 설정
		pay_method :	'card',					// 결재 방법 - 카카오페이 앱에서 신용카드와 카카오머니 중 선택한 옵션으로 설정됩니다.
		merchant_uid :	createOrderNum(),				// 상점에서 관리하는 주문 번호
		name :		`N코인 ${chargeAmount} 포인트 결재`,		// 상품 이름
		amount :		chargeAmount,				// 결재 금액
		buyer_name :	account.firstChar.name			// 구매자 이름 (buyer_ 부분은 생략 가능)
		//buyer_email :	'123456@naver.com',			// 구매자 이메일
		//buyer_tel :	'010-1234-5678',				// 구매자 전화번호
		//buyer_addr :	'서울시 삼성동',				// 구매자 주소
		//buyer_postcode :	'123-456'					// 구매자 우편번호
	}, function(response) {
		//결재 후 호출되는 callback함수
		if (response.success) {
			// [1] 서버단에서 결재정보 조회를 위해 jQuery ajax로 결재정보 전달
			getDatasWithOption([{
				type:		'POST',
	    			url:		'/define/charge',	//cross-domain error가 발생하지 않도록 주의해주세요
	    			dataType:	'json',
				contentType:	'application/json',
				Accept:		'application/json',
	    			data: {
		    			imp_uid :		response.imp_uid,// 고유 ID
		    			merchant_uid :	response.merchant_uid,// 상점 거래 ID
                    				apply_num :	response.apply_num,// 카드 승인번호
                    				paid_amount :	response.paid_amount// 결재 금액
					// 기타 필요한 데이터가 있으면 추가 전달
	    				}
	    		}], (data) => {
	    			// [2] 서버에서 REST API로 결제정보확인 및 서비스루틴이 정상 검증 결과
				switch(data) {
				case 1:
					popupShow('정상적으로 결재가 완료되었습니다.', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
					break;
				case 2:
					popupShow('고유 번호가 누락되었습니다.', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
					break;
				case 3:
					popupShow('결재 시스템이 사용중이지 않습니다.', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
					break;
				case 4:
					popupShow('인게임에서 결재하실 수 있습니다.', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
					break;
				case 5:
					popupShow('계정을 찾을 수 없습니다.', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
					break;
				case 6:
					popupShow('대표 캐릭터를 찾을 수 없습니다.', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
					break;
				case 7:
					popupShow('월드 내 캐릭터가 존재하지 않습니다.', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
					break;
				case 8:
					popupShow('검증에 필요한 파라미터가 누락되었습니다.', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
					break;
				case 9:
					popupShow('결재 정보가 올바르지 않습니다.', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
					break;
				default:
					popupShow('결재에 실패하였습니다.', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
					break;
				}
			}, (data) => {
				popupShow('결재 검증에 실패하였습니다.\r\nREGIST_FAILURE', '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
			});
		} else {
			popupShow('결재에 실패하였습니다.\r\nMESSAGE : ' + response.error_msg, '<span class="type2"><a href="javascript:finish_charge();" class="close">닫기</a></span>', null);
		}
	});
});