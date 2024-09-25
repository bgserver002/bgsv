/*!
 * project : board
 * author : LINOFFICE
 * 게시판
 */

$(function() {
	includeHTML(document.querySelector('#svg-container'), 'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/svg.html', cacheVersion);
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
		var selectOption = $(this).attr('data-textvalue');
		$('.ui-dropdown-community.is-active .select').find('span').html(selectOption);
		$('.ui-dropdown-community.is-active .select').find('#data_val').val($(this).attr('data-value'));
	});
	
	resetTextBtn.on('click', function(event) {
		$('#ncCommunitySearch').val('');
	});
	
	var viewMode = function(type){
		$('.co-btn').removeClass('is-disabled');
		if (type == 'card') {
			listStyleBtn.addClass('is-disabled');
			if (boardList.hasClass('board-list-default')) {
				boardList.removeClass('board-list-default');
			}
			$('.ncCommunityBoardList').addClass('board-list-card');
			$('.board-type-card').show();
			$('.board-type-list').hide();
			boardTypeMobileBtn.removeClass('list');
			boardTypeMobileBtn.addClass('card');
			var chagehtml = "<svg class='fe-svg fe-svg-card'><use xlink:href='#fe-svg-card'></use></svg>";
			boardTypeMobileBtn.html(chagehtml);
			boardTypeMobileBtn.removeClass('is-show');
		} else {
			cardStyleBtn.addClass('is-disabled');
			if (boardList.hasClass('board-list-card')) {
				boardList.removeClass('board-list-card');
			}
			$('.ncCommunityBoardList').addClass('board-list-default');
			$('.board-type-list').show();
			$('.board-type-card').hide();
			boardTypeMobileBtn.removeClass('card');
			boardTypeMobileBtn.addClass('list');
			var chagehtml = "<svg class='fe-svg fe-svg-list'><use xlink:href='#fe-svg-list'></use></svg>";
			boardTypeMobileBtn.html(chagehtml);
			boardTypeMobileBtn.removeClass('is-show');
		}
	}
	
	const board_view_mode = 'board_free_viewMode';
	switch (boardType) {
	case 'CONTENTS':
		board_view_mode = 'board_content_viewMode';
		break;
	case 'PITCH':
		board_view_mode = 'board_fitch_viewMode';
		break;
	}
	
	listStyleBtn.on('click', function(event) {
		if (boardList.hasClass('board-list-card')) {
			viewMode('list');
			setLocal(board_view_mode, 'list');
		}
	});
	
	cardStyleBtn.on('click', function(event) {
		if (boardList.hasClass('board-list-default')) {
			viewMode('card');
			setLocal(board_view_mode, 'card');
		}
	});
	
	if (getLocal('board_free_viewMode') === 'card') {
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
	
	$('.contentWrite').on('click', function(event){
		if (!$(this).closest('.comment-form-contentWrite').hasClass('is-active')) {
			eventStop(event);
			location.href = '/login';
		}
	});
	
	$('.comment-toolbar > .right > button').on('click', function(event){
		boardCommentWrite();
	});
	
	$('#ncCommunityReport .ly-close').on('click', function(event){
		reportModalClose();
	});

	$('#ncCommunityReport .co-btn-finish').on('click', function(event){
		reportInsert($(this));
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

function get_board_uri_flag() {
	switch (boardType) {
	case 'CONTENTS':
		return '/contents';
	case 'PITCH':
		return '/pitch';
	default:
		return '/board';
	}
}

function get_report_flag() {
	switch (boardType) {
	case 'CONTENTS':
		return '컨텐츠공모_ID_';
	case 'PITCH':
		return '홍보_ID_';
	default:
		return '게시글_ID_';
	}
}

function commentLengthCheck(obj){
	// 제한된 길이보다 입력된 길이가 큰 경우 제한 길이만큼만 자르고 텍스트영역에 넣음
	if ($(obj).val().length > 300) {
		$(obj).val($(obj).val().substr(0, 300));
	}
	// 입력된 텍스트 길이를 #textCount 에 업데이트 해줌
	$('.count-word > em').text($(obj).val().length);
}

function reportBtn(obj){
	if (!account) {
		popupShow('로그인 후 이용하실 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	reportModalOpen($(obj), get_report_flag() + $(obj).attr('data-boardid'));
}

function commentReportBtn(obj){
	if (!account) {
		popupShow('로그인 후 이용하실 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	reportModalOpen($(obj), get_report_flag() + $(obj).attr('data-boardid') + '_코멘트_ID_' + $(obj).attr('data-commentid'));
}

function reportModalOpen(obj, log){
	$('#ncCommunityReport .report-target .target').html(obj.attr('data-name'));
	$('#reportLog').val(log);
	$('#ncCommunityReportModal').addClass('is-active');
	$('#ncCommunityReport').addClass('is-active');
}

function reportModalClose(){
	$('#ncCommunityReportModal').removeClass('is-active');
	$('#ncCommunityReport').removeClass('is-active');
}

function reportInsert(obj){
	if (!account) {
		popupShow('로그인 후 이용하실 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	const reportType		= $('input:radio[name=reportCase]:checked').val(),
		reprotLog	= $('#reportLog').val(),
		reportTarget	= $('#ncCommunityReport .report-target .target').html();
	const sendData		= { targetName : reportTarget, type : reportType, log : reprotLog };
	getDatasWithOption([{
		type: 'POST',
		url: '/define/report/insert',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: sendData
	}], (data) => {
		popupShow(data, '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		reportModalClose();
	}, (data) => {
		throw new Error("reportInsert from board.js Error");
	});
}

function likeBtn(obj){
	if (!account) {
		popupShow('로그인 후 이용하실 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	boardLikeBtn($(obj), '/define/board/like', { board_type : boardType, id : $(obj).attr('data-id') });
}

function commentLikeBtn(obj){
	if (!account) {
		popupShow('로그인 후 이용하실 수 있습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	boardLikeBtn($(obj), '/define/board/commentLike', { board_type : boardType, id : $(obj).attr('data-commentid'), boardnum : $(obj).attr('data-boardnum') });
}

function boardLikeBtn(obj, url, sendData){
	getDatasWithOption([{
		type: 'POST',
		url: url,
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: sendData
	}], (data) => {
		var beforeLike	= $(obj).find('em').html();
		var afterLike	= Number(beforeLike) + Number(data);
		$(obj).find('em').html(afterLike);
		if (data == 1)	$(obj).addClass('is-active');
		else if (data == -1)	$(obj).removeClass('is-active');
	}, (data) => {
		throw new Error("boardLikeBtn from board.js Error");
	});
}

function boardCommentWrite(){
	var comment	= $('.comment-form-textarea > textarea');
	if (!comment.val().length) {
		popupShow('댓글을 작성해주세요.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return;
	}
	const boardKey	= $('#ncCommunityView').attr('data-board-id'),
		boardRownum	= $('#ncCommunityView').attr('data-board-num');
	const sendData	= { board_type : boardType, content : comment.val(), boardId : boardKey };
	getDatasWithOption([{
		type: 'POST',
		url: '/define/board/commentInsert',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: sendData
	}], (data) => {
		if (!data) {
			popupShow('고객님께서는 계정 또는 대표캐릭터 미설정 상태거나 이용제한 상태입니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		} else {
			var commentHtml = 
			`<div class="comment-article" data-commentid="${data.id}">` +
				`<div class="comment-info">` +
					`<span class="thumb"><img src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web${data.profileUrl}" alt=""></span>` +
					`<span class="writer">${data.name}<span class="server">${serverName}</span></span>` +
					`<span class="date">${moment(new Date(data.date)).format('YYYY. MM. DD. HH:mm:ss')}</span>` +
					`<button class="co-btn btn-declare" data-commentid="${data.id}" data-boardnum="${boardRownum}" data-name="${data.name}" aria-label="신고" onClick="commentReportBtn(this);">&nbsp;신고</button>` +
					`<button class="co-btn btn-delete" aria-label="삭제" onClick="deleteComment(this, ${data.id});">&nbsp;삭제</button>` +
				`</div>` +
				`<div class="comment-contents">${data.content}</div>` +
				`<div class="comment-utils">` +
					`<button data-commentid="${data.id}" data-boardnum="${boardRownum}" class="co-btn co-btn-like" aria-label="좋아요수" onClick="commentLikeBtn(this);">` +
						`<svg class="fe-svg fe-svg-like_s" style="width: 16px; height: 16px; vertical-align: middle; fill: rgba(0,0,0,.45)!important; color: rgba(0,0,0,.45)!important;"><use xlink:href="#fe-svg-like_s"></use></svg>` +
						`&nbsp;<em class="text">${data.likenames ? data.likenames.length : 0}</em>` +
					`</button>` +
				`</div>` +
			`</div>`;
			$(commentHtml).appendTo('.commentThread');// 댓글 추가
			$('.comment-article-none').remove();// 제거
			comment.val('');// 인풋 리셋
			var commentCount = $('.commentTotalCount');
			commentCount.html(Number(commentCount.html()) + 1);// 댓글수 변경
		}
	}, (data) => {
		throw new Error("boardCommentWrite from board.js");
	});
}

function deleteComment(obj, commentId){
	popupShow(`댓글을 삭제하시겠습니까?`, `<span class="type2"><a href="javascript:popupClose();" class="close">아니오</a></span>`, `<span class="type1"><a href="javascript:deleteCommentAction(${commentId});" class="close">예</a></span>`);
}

function deleteCommentAction(commentId){
	getDatasWithOption([{
		type: 'POST',
		url: '/define/board/commentDelete',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: { board_type : boardType, id : commentId }
	}], (data) => {
		if (data) {
			var commentList = $('.comment-article');
			$(commentList).each(function (index, item) {
				if(commentList.eq(index).attr('data-commentid') == commentId)item.remove();
			})
			popupClose();
			var commentCount = $('.commentTotalCount');
			commentCount.html(Number(commentCount.html()) - 1);// 댓글수 변경
			if (Number(commentCount.html()) <= 0) {
				$('.commentThread').html('<div class="comment-article-none"><p>첫 댓글을 남겨주세요.</p></div>');
			}
		} else {
			popupShow('댓글 삭제에 실패하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		}
	}, (data) => {
		throw new Error("deleteCommentAction from board.js Error");
	});
}

let more_btn_lock = false;
function boardMore() {
	if (more_btn_lock || parameter.total_size <= 0) {
		return;
	}
	let loader = $('.nc-community-loader');
	loader.css('display', '');

	more_btn_lock = true;
	getDatasWithOption([{
		type: 'POST',
		url: '/define/board/more',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: parameter
	}], (data) => {
		let tpl= '';
		$.each(data, function(key, element){//리스트수만큼 반복
			tpl += createBoardHtml(element);
		});
		$(tpl).appendTo('.ncCommunityBoardList');// 뒤에 이어서 html넣기
		if (data.length > 0) {
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
		throw new Error("boardMore from board.js Error");
	});
}

function createBoardHtml(element){
	var board_list_type	= $('.ncCommunityBoardList'),
		listtype	= '',
		cardtype	= 'display:none;';
	if (board_list_type.hasClass('board-list-card')) {
		listtype	= 'display:none;';
		cardtype	= '';
	}

	const board_uri_flag = get_board_uri_flag();
	const writer_tag = `<span class="writer">${element.type ? `<img src="https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/lineage_writer.png" alt="">` : `${element.name}<span class="server">${serverName}</span>`}</span>&nbsp`;
	const date_tag = `<span class="date">${moment(new Date(element.date)).format('YY.MM.DD.')}</span>&nbsp`;
	const now_moment = moment().format('YYYYMMDD');
	const item_moment = moment(new Date(element.date)).format('YYYYMMDD');
	const dateterm = now_moment - item_moment;
	const category_tag = `${boardType == 'CONTENTS' ? `<span class="category">컨텐츠&nbsp;</span>` : boardType == 'PITCH' ?  `<span class="category">홍보&nbsp;</span>` : ``}`;
	const count_like_tag = `<span class="count-like" data-count="${element.likenames ? element.likenames.length : 0}">&nbsp;<svg class="fe-svg fe-svg-like_s"><use xlink:href="#fe-svg-like_s"></use></svg><em>${element.likenames ? element.likenames.length : 0}</em></span>`;
	const count_comment_tag = `<span class="count-comment" data-count="${element.answerList ? element.answerList.length : 0}">&nbsp;<svg class="fe-svg fe-svg-comment"><use xlink:href="#fe-svg-comment"></use></svg><em>${element.answerList ? element.answerList.length : 0}</em></span>`;
	return `<li class="board-items" onClick='urlform("${element.rownum}", "post", "${board_uri_flag}/view");'>` +
		`<div class="title board-type-list" style="${listtype}">` +
			category_tag +
			`<a href='javascript:urlform("${element.rownum}", "post", "${board_uri_flag}/view");'>${element.title}</a>${!element.mainImg ? `` : `<svg class="fe-svg fe-svg-picture"><use xlink:href="#fe-svg-picture"></use></svg>`}` +
			`<div class="count">${count_like_tag}${count_comment_tag}</div>${dateterm === 0 ? `&nbsp<i class="fe-icon-new" data-diff=""></i>` : ``}` +
		`</div>` +
	
		`<div class="info board-type-list" style="${listtype}">` +
			writer_tag + date_tag +
			`<span class="hit"><em class="txt">조회</em>${element.readcount}</span>` +
			`<span class="like">추천<em>${element.likenames ? element.likenames.length : 0}</em></span>` +
		`</div>` +
				
		`<div class="comment"><a href='javascript:urlform("${element.rownum}", "post", "${board_uri_flag}/view");'><span><em class="number">${element.answerList ? element.answerList.length : 0}</em><em class="txt">댓글</em></span></a></div>` +

		`<div class="board-type-card" style="${cardtype}">` +
			`${!element.mainImg ? `` : `<div class="board-items-thumb"><a href="javascript:urlform("${element.rownum}", "post", "${board_uri_flag}/view");"><img src="${element.mainImg}" alt=""></a></div>`}` +
			`<div class="board-items-contents">` +
				`<div class="title">` +
					category_tag +
					`<a href='javascript:urlform("${element.rownum}", "post", "${board_uri_flag}/view");'>${element.title}${dateterm === 0 ? `&nbsp<i class="fe-icon-new"></i></a>` : `</a>`}` +
				`</div>` +
				`<div class="desc desc-overflow"><a href='javascript:urlform("${element.rownum}", "post", "${board_uri_flag}/view");'>${element.content}</a></div>` +
				writer_tag +
			`</div>` +
			`<div class="board-items-footer">` +
				`<div class="info"><span class="writer">${element.name}</span>${date_tag}<span class="hit-count"><span class="txt">조회 </span><em>${element.readcount}</em></span></div>` +
				`<div class="count">${count_like_tag}${count_comment_tag}</div>` +
			`</div>` +
		`</div>` +
	`</li>`;
}

function boardFormSubmit() {
	const f = document.boardWriteForm;
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
		'board_type' : boardType,
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
			location.href = get_board_uri_flag();
		} else {
			popupShow('등록 또는 수정에 실패 하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		}
	}, (data) => {
		throw new Error("boardFormSubmit from board.js Error");
	});
}

function delectConfirm(rownum){
	popupShow(`정말로 삭제하시겠습니까?`, `<span class="type2"><a href="javascript:popupClose();" class="close">아니오</a></span>`, `<span class="type1"><a href="javascript:deleteConfirmAction(${rownum});" class="close">예</a></span>`);
}

function deleteConfirmAction(rownum) {
	const sendData = {
		'board_type' : boardType,
		'rownum' : rownum
	};
	getDatasWithOption([{
		type: 'POST',
		url: '/define/board/delete',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: sendData
	}], (data) => {
		if (data) {
			location.href = get_board_uri_flag();
		} else {
			popupShow('삭제에 실패 하였습니다.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		}
	}, (data) => {
		throw new Error("deleteConfirmAction from board.js Error");
	});
}