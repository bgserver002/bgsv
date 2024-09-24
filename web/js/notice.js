/*!
 * project : notice
 * author : LINOFFICE
 * 소식
 */

$(function() {
	includeHTML(document.querySelector('#svg-container'), 'https://cdn.jsdelivr.net/gh/cckiss/web/svg.html', cacheVersion);
	
	var dropdown			= $('.ui-dropdown'),
		dropdownSelect		= $('.ui-dropdown-custom_items'),
		resetTextBtn		= $('.co-btn-reset'),
		listStyleBtn		= $('.btn-list'),
		cardStyleBtn		= $('.btn-cards'),
		boardList			= $('.ncCommunityBoardList'),
		topscrollBtn		= $('.co-btn-top_list'),
		boardTypeMobileBtn	= $('.btn-type-selected');
	
	dropdown.on('click', function(event) {
		$(this).toggleClass('is-active');
	});
	
	dropdownSelect.on('click', function(event) {
		$('.ui-dropdown-community.is-active .select').find('span').html($(this).attr('data-textvalue'));
		$('.ui-dropdown-community.is-active .select').find('#data_val').val($(this).attr('data-value'));
	});
	
	resetTextBtn.on('click', function(event) {
		$('#ncCommunitySearch').val('');
	});
	
	var viewMode = function(type){
		$('.co-btn').removeClass('is-disabled');
		if (type == 'card') {
			listStyleBtn.addClass('is-disabled');
			if(boardList.hasClass('board-list-default'))boardList.removeClass('board-list-default');
			$('.ncCommunityBoardList').addClass('board-list-card');
			$('.board-type-card').show();
			$('.board-type-list').hide();
			boardTypeMobileBtn.removeClass('list');
			boardTypeMobileBtn.addClass('card');
			boardTypeMobileBtn.html("<svg class='fe-svg fe-svg-card'><use xlink:href='#fe-svg-card'></use></svg>");
		} else {
			cardStyleBtn.addClass('is-disabled');
			if(boardList.hasClass('board-list-card'))boardList.removeClass('board-list-card');
			$('.ncCommunityBoardList').addClass('board-list-default');
			$('.board-type-list').show();
			$('.board-type-card').hide();
			boardTypeMobileBtn.removeClass('card');
			boardTypeMobileBtn.addClass('list');
			boardTypeMobileBtn.html("<svg class='fe-svg fe-svg-list'><use xlink:href='#fe-svg-list'></use></svg>");
		}
		boardTypeMobileBtn.removeClass('is-show');
	}
	
	listStyleBtn.on('click', function(event) {
		if (boardList.hasClass('board-list-card')) {
			viewMode('list');
			setLocal('board_notice_viewMode', 'list');
		}
	});
	
	cardStyleBtn.on('click', function(event) {
		if (boardList.hasClass('board-list-default')) {
			viewMode('card');
			setLocal('board_notice_viewMode', 'card');
		}
	});
	
	if (getLocal('board_notice_viewMode') == 'card') {
		viewMode('card');
	}
	
	topscrollBtn.on('click', function(e) {
		$(window).scrollTop( 0 );
		e.preventDefault();
	});
	
	boardTypeMobileBtn.on('click', function(event) {
		$(this).toggleClass('is-show');
	});
	
	$('.input-board-search').on('click', function(event) {
		$('#wrapSearch').addClass('is-show');
	});
	
	$('.co-btn-clear').on('click', function(event) {
		$('#wrapSearch').removeClass('is-show');
	});
	
	// 영역밖 클릭
	$('body').mouseup(function (e){
		if (!$('.option').has(e.target).length && !$('.ui-dropdown.is-active').has(e.target).length && $('.ui-dropdown').hasClass('is-active')) {
			$('.ui-dropdown').removeClass('is-active');
		}
		if (!$('#wrapSearch').has(e.target).length && $('#wrapSearch').hasClass('is-show')) {
			$('#wrapSearch').removeClass('is-show');
			$('#ncCommunitySearch').val('');
		}
		eventStop(e);
	});
	
	var nowCheckDate = $('.nowCheckvalue');
	if (nowCheckDate && nowCheckDate.length) {
		$.each(nowCheckDate, function (index, item) {
			if (!item.value) {
				var changeFormat = getNowDayTimeToFormat($(this).closest('.board-items').find('.nowCheckdate').val());
				$(this).closest('.board-items').find('.date').html(changeFormat);
			}
		});
	}
});

let more_btn_lock = false;
function noticeMore() {
	if (more_btn_lock || parameter.total_size <= 0) {
		return;
	}
	let loader = $('.nc-community-loader');
	loader.css('display', '');

	more_btn_lock = true;
	getDatasWithOption([{
		type: 'POST',
		url: '/define/notice/more',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: parameter
	}], (data) => {
		var tpl = '';
		$.each(data,function(key,element){//리스트수만큼 반복
			tpl += createNoticeHtml(element);
		});
		$(tpl).appendTo(".ncCommunityBoardList");//뒤에 이어서 html넣기
		if (data.length) {
			parameter.current_num += data.length;// 리스트수갱신
			parameter.total_size -= data.length;// 총길이 갱신
			if (parameter.total_size <= 0) {
				$('.wrap-community-more').html('');
			}
		}
		loader.css('display', 'none');
		more_btn_lock = false;
	}, (data) => {
		loader.css('display', 'none');
		more_btn_lock = false;
		throw new Error("noticeMore from notice.js Error");
	});
}

function createNoticeHtml(element){
	var board_list_type	= $('.ncCommunityBoardList'),
		listtype	= '',
		cardtype	= 'display:none;';
	if (board_list_type.hasClass('board-list-card')) {
		listtype	='display:none;';
		cardtype	= '';
	}
	
	var notice_flag = '';
	var view_uri = '';
	switch(element.type){
	case 1:
		notice_flag = '업데이트';
		view_uri = '/update/view';
		break;
	case 2:
		notice_flag = '이벤트';
		view_uri = '/event/view';
		break;
	default:
		notice_flag = '공지';
		view_uri = '/notice/view';
		break;
	}	
	
	const category_tag = `<span class="category">${notice_flag}&nbsp</span>`;
	const writer_tag = `<span class="writer"><img src="https://cdn.jsdelivr.net/gh/cckiss/web/img/lineage_writer.png" alt=""></span>&nbsp`;
	const date_tag = `<span class="date">${moment(new Date(element.date)).format('YY.MM.DD.')}</span>&nbsp`;
	const now_moment = moment().format('YYYYMMDD');
	const item_moment = moment(new Date(element.date)).format('YYYYMMDD');
	const dateterm = now_moment - item_moment;
	return `<li class="board-items" onClick='urlTypeform("${element.type}", "${element.rownum}", "post", "${view_uri}");'>` +
		`<div class="title board-type-list" style="${listtype}">` +
			category_tag +
			`<a href='javascript:urlTypeform("${element.type}", "${element.rownum}", "post", "${view_uri}");'>${element.title}</a>` +
			`${element.mainImg ? `<svg class="fe-svg fe-svg-picture"><use xlink:href="#fe-svg-picture"></use></svg>` : ``}` +
			`${dateterm === 0 ? `&nbsp<i class="fe-icon-new" data-diff=""></i>` : ``}` +
		`</div>` +
	
		`<div class="info board-type-list" style="${listtype}">` +
			writer_tag +
			date_tag +
			`<span class="hit"><em class="txt">조회</em>${element.readcount}</span>` +
		`</div>` +

		`<div class="board-type-card" style="${cardtype}">` +
			`${element.mainImg ? `<div class="board-items-thumb"><a href='javascript:urlTypeform("${element.type}", "${element.rownum}", "post", "${view_uri}");'><img src="${element.mainImg}" alt=""></a></div>` : ``}` +
			`<div class="board-items-contents">` +
				`<div class="title">${category_tag}<a href='javascript:urlTypeform("${element.type}", "${element.rownum}", "post", "${view_uri}");'>${element.title}${dateterm === 0 ? `&nbsp<i class="fe-icon-new"></i></a>` : `</a>`}</div>` +
				`<div class="desc desc-overflow"><a href='javascript:urlTypeform("${element.type}", "${element.rownum}", "post", "${view_uri}");'>${element.content}</a></div>` +
				writer_tag +
			`</div>` +
			`<div class="board-items-footer"><div class="info"><span class="writer">${element.name}</span>${date_tag}<span class="hit-count"><span class="txt">조회 </span><em>${element.readcount}</em></span></div></div>` +
		`</div>` +
	`</li>`;
}

function boardFormSubmit(){
	var f=document.boardWriteForm;
	if (!account || !account.firstChar) {
		popupShow('로그인 후 등록할 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (!f.noti_type.value) {
		popupShow('유형을 선택해주세요.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (!f.title.value) {
		popupShow('제목을 입력해주세요.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (!f.content.value) {
		popupShow('내용을 입력해주세요.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	if (!maxByteCheck(f.content.value, 1)) {// 용량 체크
		return;
	}

	const sendData = {
		'noti_type' : f.noti_type.value,
		'title' : f.title.value,
		'content' : f.content.value,
		'images' : Editor.images
	};
	if (f.rownum) {
		sendData.rownum = f.rownum.value;
	}

	getDatasWithOption([{
		type: 'POST',
		url: f.action,
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: sendData
	}], (data) => {
		if (data) {
			Editor.instance.setSubmit();
			switch (f.noti_type.value) {
			case '0':
				location.href = '/notice';
				break;
			case '1':
				location.href = '/update';
				break;
			case '2':
				location.href = '/event';
				break;
			}
		} else {
			popupShow('등록 또는 수정에 실패 하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		}
	}, (data) => {
		throw new Error("boardFormSubmit from board.js Error");
	});
}

function delectNoticeConfirm(rownum, type){
	popupShow(`정말로 삭제하시겠습니까?`, `<span class="type2"><a href="javascript:popupClose();" class="close">아니오</a></span>`, `<span class="type1"><a href="javascript:deleteNoticeConfirmAction(${rownum}, ${type});" class="close">예</a></span>`);
}

function deleteNoticeConfirmAction(rownum, type) {
	const sendData = {
		'type' : type,
		'rownum' : rownum
	};
	getDatasWithOption([{
		type: 'POST',
		url: '/define/notice/delete',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: sendData
	}], (data) => {
		if (data) {
			switch (type) {
			case '0':
				location.href = '/notice';
				break;
			case '1':
				location.href = '/update';
				break;
			case '2':
				location.href = '/event';
				break;
			}
		} else {
			popupShow('삭제에 실패 하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		}
	}, (data) => {
		throw new Error("deleteNoticeConfirmAction from notice.js Error");
	});
}
