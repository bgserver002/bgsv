/*!
 * project : customer
 * author : LINOFFICE
 * 고객센터
 */

includeHTML(document.querySelector('#svg-container'), 'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/svg.html', cacheVersion);
$('#tab_' + pageCnbSubType).addClass('on');
const is_gm = account && account.gm;
const account_name = account ? account.name : '';
var paginationRendere = function() {
	let container = $('.pagination-container');
	container.pagination({
	    	dataSource: function(done) {
			getDatasWithOption([{
				type: 'POST',
				url: '/define/customer',
				dataType: 'json',
				contentType: 'application/json',
				Accept: 'application/json',
				data: { type: pageCnbSubType, login : account_name }
			}], (data) => {
				var noticeHtml = 
	    	        		`<div class="notice ng-scope">` + 
	    	        			`<strong class="ng-binding ng-scope">[ ${account_name} ]님의 최근 6개월간 ${pageCnbSubType == 1 ? `문의` : `신고 / 이의`}${!data || !data.length ? `내역이 없습니다.` : `내역입니다.`}</strong>` +
					`<button onClick="customWrite('${pageCnbSubType}')" style="float: right; width: 115px; height: 39px; background: #6e7482 none; color: #fff; font-size: 16px; font-weight: 600; margin-top: -7px;">${pageCnbSubType == 1 ? `문의` : `신고`}하기</button>` +
	    	        		`</div>` + 
	    	        		`<table class="table_list ng-scope"></table>`;
				$('#custom_main').prepend(noticeHtml);
				done(data);
			}, (data) => {
				throw new Error("rendaring from customer.js Error");
			});
	    	},
	    	pageSize: 5,// 한 화면에 보여질 개수
	    	showPrevious: false,// 처음버튼 삭제
	        showNext: false,// 마지막버튼 삭제
	        showPageNumbers: true,// 페이지 번호표시
	        callback: function (data, pagination) {// 화면 출력
	            var dataHtml = '';
	            dataHtml += 
	        		`<tbody>` +
	        			`<tr>` +
	        				`<th class="th_part">계정</th>` +
	        				`<th class="th_subject">제목</th>` +
	        				`<th class="th_status">처리상태</th>` +
	        				`<th class="th_status_date">등록일</th>` +
	        			`</tr>` +
	        		`</tbody>` +
	        		`<tbody>`;
	            if (data.length > 0) {
	            	$.each(data, function (index, item) {
	            		dataHtml +=
	            			`<tr class="ng-scope" data-id="${item.id}" onClick="customView('${pageCnbSubType}', ${item.rownum});">` +
	                   			`<td class="ng-binding">${item.login}</td>` +
	                   			`<td class="subject"><a class="ng-binding">${item.title}</a></td>` +
	                   			`<td class="ng-binding ng-scope">${item.status}</td>` +
	                   			`<td class="date ng-binding">${moment(new Date(item.date)).format('YYYY-MM-DD')}</td>` +
	                   		`</tr>`;
	                });
	            }
	            dataHtml += `</tbody>`;
	            $(".table_list").html(dataHtml);// 렌더링
	        }
	});
}

var customViewBackBtn = function(){
	$('.table_view').html('');
	paginationRendere();
}

function customView(customType, customRownum){
	getDatasWithOption([{
		type: 'POST',
		url: '/define/customer/view',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: { type : customType, rownum : customRownum }
	}], (data) => {
		if (data) {
			var viwHtml = 
			`<div class="table_view ng-scope">` +
				`<header class="view_subject ng-scope"><p class="ng-binding">${data.title}</p><a id="layer_open" class="btn_delete" href="javascript:customDelete(${customType}, ${data.rownum})">${customType == '1' ? `문의삭제` : `신고삭제`}</a></header>` +
				(data.status == '답변 완료' ? 
				`<div class="ng-scope">` +
					`<div class="view reply subject">` +
						`<header class="ng-binding">[답변]<span class="date ng-binding">${moment(new Date(data.commentDate)).format('YYYY-MM-DD HH:mm:ss')}</span></header>` +
						`<article class="ng-binding">${data.comment}</article>` +
					`</div>` +
				`</div>` : ``) +
				`<div class="ng-scope">` +
					`<div class="view">` +
						`<header class="ng-binding req">${customType == '1' ? `[문의]` : `[신고]`}&nbsp;${data.login}<span class="date ng-binding">${moment(new Date(data.date)).format('YYYY-MM-DD HH:mm:ss')}</span></header>` +
						`<article class="ng-binding">${data.content}</article>` +
						(data.status == '접수 완료' && is_gm ? 
						`<div class="custom_comment">` +
							`<textarea id="testContent" name="comment" required="" placeholder="답변을 입력하세요" maxlength="4500" class="ng-pristine ng-invalid ng-invalid-required ng-valid-maxlength"></textarea>` +
							`<p class="btn_typeA_gray clear" onClick="commentWriteSubmit(${customType}, ${customRownum});"><span class="btn" id="spnRemoveContent">답변</span></p>` +
						`</div>`
						: ``) +
					`</div>` +	
				`</div>` +
				`<div class="button ng-scope" style="padding-bottom: 60px;"><p class="btn_typeA" onClick="customViewBackBtn();"><span class="btn">목록</span></p></div>` +
			`</div>`;
			$('.notice').remove();
			$('.table_list').remove('');
			$('.pagination-container').html('');
			$('.table_view').html(viwHtml);
		}
	}, (data) => {
		throw new Error("customView from customer.js Error");
	});
}
	
function customDelete(customType, customRownum){
	popupShow('정말로 삭제하시겠습니까?', `<span class="type2"><a href="javascript:popupClose();" class="close">아니오</a></span>`, `<span class="type1"><a href="javascript:customDeleteAction(${customType}, ${customRownum});" class="close">예</a></span>`);
}
	
function customDeleteAction(customType, customRownum){
	getDatasWithOption([{
		type: 'POST',
		url: '/define/customer/delete',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: { type : customType, rownum : customRownum }
	}], (data) => {
		if (data) {
			customViewBackBtn();
			popupClose();
		} else {
			popupShow('삭제실패.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		}
	}, (data) => {
		throw new Error("customDeleteAction from customer.js Error");
	});
}
	
function customWrite(customType){
	var writeFromHtml = 
		`<div class="faq_write" id="inquiryWrite">` +
			`<form id="addTicket" name="addTicket" class="ng-pristine ng-invalid ng-invalid-required">` +
				`<input type="hidden" name="customType" value="${customType}" />` +
				`<table class="inquiryFormTalbe">` +
					`<caption><em>*</em> 표시는 필수항목이므로 반드시 기재해주세요</caption>` +
					`<tbody class="ng-scope ng-pristine ng-valid">` +
						`<tr class="inquiry ng-scope">` +
							`<th class="ng-binding"><em>*</em>${customType === '1' ? `문의제목` : `신고제목`}</th>` +
							`<td class="subject">` +
								`<input type="text" id="testSubject" name="subject" required="" placeholder="제목을 입력하세요" maxlength="50" class="ng-pristine ng-valid-maxlength ng-valid-minlength ng-invalid ng-invalid-required">` +
							`</td>` +
						`</tr>` +
					`</tbody>` +
					`<tbody class="ng-scope ng-pristine ng-valid">` +
						`<tr class="inquiry ng-scope">` +
							`<th class="ng-binding"><em>*</em>${customType === '1' ? `문의내용` : `신고내용`}</th>` +
							`<td>` +
								`<span class="txt ng-binding"><ul><li>불법 프로그램 / 버그 신고 시 육하원칙을 근거로 접수 부탁 드립니다.(보상: 중대성에 따라 지급)</li>  <li><strong><em>허위 신고 시 계정에 대한 제재가 이루어집니다.</em></strong></li> </ul></span>` +
								`<textarea id="testContent" name="content" required="" placeholder="내용을 입력하세요" maxlength="4500" class="ng-pristine ng-invalid ng-invalid-required ng-valid-maxlength"></textarea>` +
							`</td>` +
						`</tr>` +
					`</tbody>` +
				`</table>` +
				`<div class="button">` +
					`<p class="btn_typeA" onClick="writeFormSubmit();"><span class="btn">${customType === '1' ? `문의 접수` : `신고 접수`}</span></p>` +
					`<p class="btn_typeA_gray clear" onClick="writeFormReset();"><span class="btn" id="spnRemoveContent">내용 삭제</span></p>` +
				`</div>` +
			`</form>` +
		`</div>`;
	$('.notice').remove();
	$('.table_list').remove('');
	$('.pagination-container').html('');
	$('#custom_main').prepend(writeFromHtml);
}
	
var writeFormReset = function(){
	var writeForm = document.addTicket;
	writeForm.subject.value='';
	writeForm.content.value='';
}
	
var writeFormSubmit = function(){
	var writeForm = document.addTicket;
	if (!writeForm.subject.value) {
		popupShow('제목을 입력해 주세요.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		writeForm.subject.focus();
		return;
	}
	if (!writeForm.content.value) {
		popupShow('내용을 입력해 주세요.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		writeForm.content.focus();
		return;
	}
	getDatasWithOption([{
		type: 'POST',
		url: '/define/customer/insert',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: $(writeForm).serialize()
	}], (data) => {
		if (data) {
			popupShow('접수 완료.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			$('#inquiryWrite').remove();
			paginationRendere();
		} else {
			popupShow('접수 실패.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		}
	}, (data) => {
		throw new Error("writeFormSubmit from customer.js Error");
	});
}
	
var commentWriteSubmit = function(customType, customRownum){
	var comment = $('.custom_comment > textarea');
	if (!comment.val().length) {
		popupShow('답변을 입력해 주세요.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		comment.focus();
		return;
	}
	if (confirm('답변을 완료하시겠습니까?')) {
		var sendData = { type : customType, rownum : customRownum, comment : $(comment).val() };
		getDatasWithOption([{
			type: 'POST',
			url: '/define/customer/comment/insert',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: sendData
		}], (data) => {
			if (data) {
				customViewBackBtn();
			} else {
				popupShow('답변 실패', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
			}
		}, (data) => {
			throw new Error("commentWriteSubmit from customer.js Error");
		});
	}
}
	
var normalList = function(){
	$('.tabmenue-area').css('display','none');
	$('.table_view').html('');
	$('.notice').remove();
	$('.table_list').remove('');
	$('.pagination-container').html('');
	$('.faq_write').remove();
	$('.detailFaqAddForm').remove();
	$('.btns-add').remove();
	paginationNormalRendere();
}
	
var paginationNormalRendere = function(){
	let container = $('.pagination-container');
	container.pagination({
	    	dataSource: function(done) {
			getDatas([
				'/define/customer/normal'
			], (data) => {
				var normalInitHtml = `<table class="table_list ng-scope"></table>${is_gm ? `<div class="btns-add"><button type="button" onClick="detailFaqAddForm();" >추가</button></div>` : ``}`;
				$('#custom_main').prepend(normalInitHtml);
				done(data);
			}, (data) => {
				throw new Error("paginationNormalRendere from customer.js Error");
			});
	    	},
	    	pageSize: 5,// 한 화면에 보여질 개수
	    	showPrevious: false,// 처음버튼 삭제
	        showNext: false,// 마지막버튼 삭제
	        showPageNumbers: true,// 페이지 번호표시
	        callback: function (data, pagination) {// 화면 출력
	            var dataHtml = `<tbody><tr><th class="th_part">서비스</th><th class="th_subject">자주 묻는 질문</th></tr></tbody><tbody>`;
	            if (data.length > 0) {
	            	$.each(data, function (index, item) {
	            		dataHtml +=
	            			`<tr class="ng-scope" onClick="detailFaq(${item.id});">` +
	                   			`<td class="ng-binding normalFrontIcon">Q</td>` +
	                   			`<td class="subject"><a class="ng-binding">${item.title}</a><span class="arrowQ"></span>` +
	                   				`<div class="detailFaq detailFaq${item.id}"><div class="normalContent">${item.content}</div>` +
	                   					(is_gm ? 
	                   					`<div class="btns"><a href="#" onClick="detailFaqUpdate(${item.id}, event);">수정</a><a href="#" onClick="detailFaqDelete(${item.id}, event);">삭제</a></div>` : ``
	                   					) +
	                   				`</div>` +
	                   			`</td>` +
	                   		`</tr>`;
	                });
	            }
	            dataHtml += `</tbody>`;
	            $(".table_list").html(dataHtml);// 렌더링
	        }
	})
}
	
var detailFaqAddForm = function(){
	var addFormHtml = 
		`<div class="detailFaqAddForm">` +
			`<div class="detail-item"><label>제목</label><input type="text" class="faqTitle" name="faqTitle" placeholder="제목을 입력하세요." /></div>` +
			`<div class="detail-item"><label>내용</label><textarea class="faqContent" name="faqContent" placeholder="내용을 입력하세요." ></textarea></div>` +
			`<div class="btns"><button type="button" onClick="detailFaqAddCancle();">취소</button><button type="button" onClick="detailFaqAddComplete();">완료</button>` +
		`</div>`;
	$('.table_view').html('');
	$('.notice').remove();
	$('.table_list').remove('');
	$('.pagination-container').html('');
	$('.faq_write').remove();
	$('.detailFaqAddForm').remove();
	$('.btns-add').remove();
	$('#custom_main').prepend(addFormHtml);
}
	
var detailFaqAddCancle = function(){
	normalList();
}
	
var detailFaqAddComplete = function(){
	var faqTitle	= $('.detailFaqAddForm .faqTitle').val();
	var faqContent	= $('.detailFaqAddForm .faqContent').val();
	if (!faqTitle.length || !faqContent.length) {
		popupShow('필수항목을 입력해주세요.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	var senddata = { "faqTitle" : faqTitle, "faqContent" : faqContent };
	getDatasWithOption([{
		type: 'POST',
		url: '/define/customer/normal/insert',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: senddata
	}], (data) => {
		if (data) {
			normalList();
		}
	}, (data) => {
		throw new Error("detailFaqAddComplete from customer.js Error");
	});
}
	
var detailFaqUpdate = function(id, event){
	var faqTile = $('.detailFaq' + id).parent('.subject').find('.ng-binding').html();
	var faqContent = $('.detailFaq' + id).children('.normalContent').html();
	var updateForm = 
		`<div class="faqUpdateForm">` + 
			`<input type="hidden" class="faqId" name="faqId" value="${id}" />` +
			`<input type="hidden" class="faqCon" name="faqCon" value="${faqContent}" />` +
			`<input type="text" class="faqTitle" name="faqTitle" value="${faqTile}" />` +
			`<textarea class="faqContent" name="faqContent" value="${faqContent}">${faqContent}</textarea>` + 
			`<div class="btns"><button type="button" onClick="detailFaqUpdateComplete(${id}, event);">완료</button><button type="button" onClick="detailFaqUpdateCancle(${id}, event);">취소</button></div>` +
		`</div>`;
	$('.detailFaq' + id).html(updateForm);
	$('.detailFaq' + id).closest('.ng-scope').addClass('up');
	eventStop(event);
}
	
var detailFaqUpdateComplete = function(id, event){
	var faqTitle = $('.detailFaq' + id).find('.faqTitle').val();
	var faqContent = $('.detailFaq' + id).find('.faqContent').val();
	var senddata = { "faqId" : id, "faqTitle" : faqTitle, "faqContent" : faqContent };
	getDatasWithOption([{
		type: 'POST',
		url: '/define/customer/normal/update',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: senddata
	}], (data) => {
		if (data) {
			$('.detailFaq' + id).parent('.subject').find('.ng-binding').html(faqTitle);
			var updateHtml = 
			`<div class="normalContent">${faqContent}</div>` +
				(is_gm ? 
				`<div class="btns"><a href="#" onClick="detailFaqUpdate(${id}, event);">수정</a><a href="#" onClick="detailFaqDelete(${id}, event);">삭제</a>` : ``
				) +
			`</div>`;
			$('.detailFaq' + id).html(updateHtml);
			$('.detailFaq' + id).closest('.ng-scope').removeClass('up');
		}
	}, (data) => {
		throw new Error("detailFaqUpdateComplete from customer.js Error");
	});
	eventStop(event);
}
	
var detailFaqUpdateCancle = function(id, event){
	$('.detailFaq' + id).closest('.ng-scope').removeClass('up');
	var faqContent = $('.detailFaq' + id).find('.faqCon').val();
	var returnHtml = 
		`<div class="normalContent">${faqContent}</div>` +
			(is_gm ? 
			`<div class="btns"><a href="#" onClick="detailFaqUpdate(${id}, event);">수정</a><a href="#" onClick="detailFaqDelete(${id}, event);">삭제</a>` : ``
			) +
		`</div>`;
	$('.detailFaq' + id).html(returnHtml);
	eventStop(event);
}
	
var detailFaqDelete = function(id, event){
	if (confirm('정말로 삭제 하시겠습니까?')) {
		getDatasWithOption([{
			type: 'POST',
			url: '/define/customer/normal/delete',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: { "id" : id }
		}], (data) => {
			if (data) {
				$('.table_list').remove();
				paginationNormalRendere();
			}
		}, (data) => {
			throw new Error("detailFaqDelete from customer.js Error");
		});
	}
	eventStop(event);
}
	
var detailFaq = function(faqCd){
	if ($('.detailFaq').closest('.ng-scope').hasClass('up')) {
		return false;
	}
	if ($('.detailFaq'+faqCd).hasClass("selected")) {
		$('.detailFaq'+faqCd).parent('.subject').find('span').removeClass('selected');
		$('.detailFaq'+faqCd).removeClass("selected");
		$('.detailFaq'+faqCd).slideUp();
	} else {
		$('.detailFaq').parent('.subject').find('span').removeClass('selected');
		$('.detailFaq').removeClass("selected");
		$('.detailFaq').slideUp();
		$('.detailFaq'+faqCd).addClass("selected");
		$('.detailFaq'+faqCd).parent('.subject').find('span').addClass('selected');
		$('.detailFaq'+faqCd).slideDown();
	}
	return false;
}
	
// 최초 렌더링
$(document).ready(function(){
	if (pageCnbSubType == 0) {
		normalList();
	} else {
		if (account) {
			paginationRendere();
		} else {
			$('#custom_main').prepend('<table class="table_list ng-scope"><div class="notice noaccount"><strong>로그인 후 확인하실 수 있습니다.</strong></div></table>');
		}
	}
});