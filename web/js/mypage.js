/*!
 * project : mypage
 * author : LINOFFICE
 * 마이페이지
 */

let my_singleton = null;
let my_singletonEnforcer = 'singletonEnforcer';
class Mypage {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== my_singletonEnforcer) throw 'Cannot--construct singleton';
		if (!account || !account.firstChar) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!my_singleton) my_singleton = new Mypage(my_singletonEnforcer);
		return my_singleton;
	}

	// 초기 설정
	init() {
		const _ = this;

		if (!tabType) {
			tabType = 'char';
		}
		$('a[data-type=' + tabType + ']').addClass('on');

		_.main_character	= account.firstChar;

		switch(tabType){
		case 'inv':
			_.inventory();
			break;
		case 'mail':
			_.mail();
			break;
		case 'board':
			_.board();
			break;
		case 'comment':
			_.comment();
			break;
		default:
			_.character();
			break;
		}

		_.addEvents();
	}

	// 캐릭터 정보
	character() {
		const _ = this;

		_.pledge		= _.main_character.pledge;
		$('.section-my-character.char-info strong').html(!_.pledge ? `없음` : `${_.pledge.name}(${_.pledge.leader_name})&nbsp;/&nbsp;포인트&nbsp;${_.pledge.contribution}&nbsp;/&nbsp;혈맹원수&nbsp;${_.pledge.member_size}/50명`);

		if (account.gm) {
			$('#gm-info').html('<i style="color: #aa8060;">관리자</i>');
		}

		$('.section-my-character.char-level .box .level-info').html(`<strong>${_.main_character.level}Lv.</strong><span class="figure">${_.main_character.expPercent}%</span>`);
		$('.section-my-character.char-level .box .stat .bar').css('width', _.main_character.expPercent + '%');
		$('.section-my-character.char-level .ranking .ranking-server dd').html(_.main_character.allRank);
		$('.section-my-character.char-level .ranking .ranking-class').html(`<dt>${_.main_character.className} 클래스 순위</dt><dd>${_.main_character.classRank}</dd>`);
		$('.hpmp-info .hp .var').html(`${_.main_character.maxhp} / ${_.main_character.maxhp}`);
		$('.hpmp-info .mp .var').html(`${_.main_character.maxmp} / ${_.main_character.maxmp}`);
		$('#stat-str').html(`<div class="graph"><span class="bar percent-${_.main_character.str << 1}"></span></div><span class="var">${_.main_character.str}</span>`);
		$('#stat-int').html(`<div class="graph"><span class="bar percent-${_.main_character.intel << 1}"></span></div><span class="var">${_.main_character.intel}</span>`);
		$('#stat-dex').html(`<div class="graph"><span class="bar percent-${_.main_character.dex << 1}"></span></div><span class="var">${_.main_character.dex}</span>`);
		$('#stat-wis').html(`<div class="graph"><span class="bar percent-${_.main_character.wis << 1}"></span></div><span class="var">${_.main_character.wis}</span>`);
		$('#stat-con').html(`<div class="graph"><span class="bar percent-${_.main_character.con << 1}"></span></div><span class="var">${_.main_character.con}</span>`);
		$('#stat-cha').html(`<div class="graph"><span class="bar percent-${_.main_character.cha << 1}"></span></div><span class="var">${_.main_character.cha}</span>`);
		$('.pk-info').html(`<dt>PK카운트</dt><dd>${_.main_character.pk}</dd><dt>성향</dt><dd>${_.main_character.lawful}</dd>`);
	}

	// 인벤토리 정보
	inventory() {
		const _ = this;

		_.invenItem	= _.main_character.inventory;
		_.normalWareItem	= account.normalWarehouse;
		_.packageWareItem	= account.packageWarehouse;
		
		$('#inv-size').text(_.invenItem.length);
		$('#invs-size').text(_.invenItem.length);
		$('#normalware-size').text(_.normalWareItem.length);
		$('#packageware-size').text(_.packageWareItem.length);
		
		_.windowWidth = $(window).width();
		_.sortor = $('.ui-dropdown.ui-dropdown-sort1');
		_.selector = $('.ui-select-tab.select-tab-inventory');
		_.invTaps = _.selector.find('li');
		_.sortorTaps = _.sortor.find('li');
		_.sortData = [];

		_.invParam = { 
			invType: 'char',
			sortType: 'ALL'
		};

		_.container = $('.pagination-container');
		_.paginationRender = function(data){
	   		_.container.pagination({
	   			dataSource: data,
				pageSize: 10,// 한 화면에 보여질 개수
				showPrevious: false,// 처음버튼 삭제
				showNext: false,// 마지막버튼 삭제
				showPageNumbers: true,// 페이지 번호표시
				callback: function (data, pagination) {// 화면 출력
					let tpl = ``;
	           				if (data.length) {
						tpl = data.map( (item, i) => {
							return `<li><img src="/img/item/${item.item.invgfx}.png" alt="" onerror="this.src='https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/shop/noimg.gif'" class="thumb"><strong class="name${getBlessStatus(item.bless)}">${getItemName(item.item.name, item.enchant, item.attr)} (${commaAdd(item.count)})</strong></li>`;
						}).join('');
					} else {
	           					tpl = `<div class="no-data"><p>아이템이 없습니다.</p></div>`;
	           				}
	           				$(".item-list").html(`<ul>${tpl}</ul>`);// 렌더링
				}
			});
		}
		
		_.ATTR_DESC = [
			"",
			"화령:1단의 ",	"화령:2단의 ",	"화령:3단의 ",	"화령:4단의 ",	"화령:5단의 ",
			"수령:1단의 ",	"수령:2단의 ",	"수령:3단의 ",	"수령:4단의 ",	"수령:5단의 ",
			"풍령:1단의 ",	"풍령:2단의 ",	"풍령:3단의 ",	"풍령:4단의 ",	"풍령:5단의 ",
			"지령:1단의 ",	"지령:2단의 ",	"지령:3단의 ",	"지령:4단의 ",	"지령:5단의 ",
		];
		
		let getItemName = function(name, enchant, attr){
			if (enchant < 0)
				return _.ATTR_DESC[attr] + enchant + ' ' + name;
			if (enchant > 0)
				return _.ATTR_DESC[attr] + '+' + enchant + ' ' + name;
			return _.ATTR_DESC[attr] + name;
		}
		
		let getBlessStatus = function(bless){
			switch(bless){
			case 0:
				return ' status-bless';
			case 2:
				return ' status-curse';
			default:
				return '';
			}
		}
		
		$(window).resize(function (){// 브라우저 사이즈의 변화
	   		_.windowWidth = window.outerWidth;// 전역 변수 넓이
	   		if (_.windowWidth <= 960) {
	   			if (_.selector.find('.select').hasClass('open')) {
	   				_.selector.find('.select').removeClass('open');
	   				_.selector.find('.select-tab.option').css('display', 'none');
	   			}
	   		} else {
	   			if (!_.selector.find('.select').hasClass('open')) {
	   				_.selector.find('.select').addClass('open');
	   				_.selector.find('.select-tab.option').css('display', 'block');
	   			}
	   		}
		})
		
		_.selector.find('.select').on('click', function(){
			if (!$(this).hasClass('open')) {
				_.selectorOpen();
	   		} else {
				_.selectorClose();
			}
		});
		
		_.selectorOpen = function(){
	   		_.selector.find('.select').addClass('open');
			_.selector.find('.select-tab.option').css('display', 'block');
		};
		_.selectorClose = function(){
	   		_.selector.find('.select').removeClass('open');
			_.selector.find('.select-tab.option').css('display', 'none');
		};
		
		// 인벤토리 선택
		_.invTaps.on('click', function(event){
			let invType = $(this).attr('data-value');
			if (invType !== _.invParam.invType) {
				_.invParam.invType = invType;
				switch(invType){
				case 'normal':
					_.paginationRender(_.normalWareItem);
					break;
				case 'package':
					_.paginationRender(_.packageWareItem);
					break;
				default:
					_.paginationRender(_.invenItem);
					break;
				}
				_.invTaps.children('a').removeClass('selected');
				$(this).children('a').addClass('selected');
				_.selector.find('.select > span').html($(this).children('a').html());
				if (_.windowWidth <= 960) {
					_.selectorClose();
				}
				_.sortor.find('.select > span').text('전체');
				_.invParam.sortType = 'ALL';
				_.sortorClose();
			}
			eventStop(event);
		});
		
		
		_.sortorOpen = function(){
			_.sortor.find('.select').addClass('open');
			_.sortor.find('.option').css('display', 'block');
		};
		_.sortorClose = function(){
	   		_.sortor.find('.select').removeClass('open');
	   		_.sortor.find('.option').css('display', 'none');
		};
		
		_.sortor.find('.select').on('click', function(){
	   		if (!$(this).hasClass('open')) {
				_.sortorOpen();
	   		} else {
				_.sortorClose();
			}
		});
		
		// 정렬 선택
		_.sortorTaps.on('click', function(event){
			let sortType = $(this).attr('data-value');
			if (sortType !== _.invParam.sortType) {
				_.invParam.sortType = sortType;
				if (sortType !== 'ALL') {
					_.sortData.length = 0;// 배열 초기화
					$.each(_.invParam.invType === 'normal' ? _.normalWareItem : _.invParam.invType === 'package' ? _.packageWareItem : _.invenItem, function (index, item) {
						switch(sortType){
						case 'EQUIP':
							if (item.item.itemType === 1 || item.item.itemType === 2) {
								_.sortData.push(item);
							}
							break;
						case 'ETC':
							if (item.item.itemType === 0) {
								_.sortData.push(item);
							}
							break;
						}
					});
					_.paginationRender(_.sortData);
				} else {
					_.paginationRender(_.invParam.invType === 'normal' ? _.normalWareItem : _.invParam.invType === 'package' ? _.packageWareItem : _.invenItem);
				}
				_.sortorTaps.removeClass('selected');
				$(this).addClass('selected');
				_.sortor.find('.select > span').html($(this).children('a').html());
			}
			_.sortorClose();
			eventStop(event);
		});
	
		if (_.windowWidth <= 960) {
			_.selectorClose();
		} else {
			_.selectorOpen();
		}
		_.paginationRender(_.invenItem);
	}

	// 메일함
	mail() {
		const _ = this;

		_.mailPrivate	= [];
		_.mailPledge	= [];
		_.mailKeep	= [];
		$.each(account.firstChar.mail, function (index, item) {
			switch(item.code){
			case 1:// 혈맹 편지
				_.mailPledge.push(item);
				break;
			case 2:// 보관함
				_.mailKeep.push(item);
				break;
			default:// 개인 편지
				_.mailPrivate.push(item);
				break;
			}
		});

		_.windowWidth = $(window).width();
		_.selector = $('.ui-select-tab.select-tab-maillist');
		_.mailTaps = _.selector.find('li');

		_.mailParam = { 
			mailType: 'NORMAL'
		};
		_.container = $('.pagination-container');
		_.paginationRender = function(data){
	   		_.container.pagination({
	   			dataSource: data,
	           			pageSize: 10,// 한 화면에 보여질 개수
				showPrevious: false,// 처음버튼 삭제
	           			showNext: false,// 마지막버튼 삭제
	           			showPageNumbers: true,// 페이지 번호표시
	           			callback: function (data, pagination) {// 화면 출력
	           				let tpl = ``;
	           				if (data.length) {
						tpl = data.map( (item, i) => {
							return `<li><header><div class="subject ${item.isCheck ? `` : `new`}" onclick="$(this).parent().toggleClass('on').next().toggle();">${item.subject}</div><div class="info"><span class="from">${item.sender}</span> <span class="date">${moment(new Date(item.date)).format('YYYY-MM-DD')}</span></div></header><article>${item.content}</article></li>`;
						}).join('');
	           				} else {
	           					tpl = `<div class="no-data"><p>편지가 없습니다.</p></div>`;
	           				}
	           				$(".normal-list").html(`<ul>${tpl}</ul>`);// 렌더링
				}
			});
		}
			
		$(window).resize(function (){// 브라우저 사이즈의 변화
	   		_.windowWidth = window.outerWidth;// 전역 변수 넓이
	   		if (_.windowWidth <= 960) {
	   			if (_.selector.find('.select').hasClass('open')) {
	   				_.selector.find('.select').removeClass('open');
	   				_.selector.find('.select-tab.option').css('display', 'none');
	   			}
	   		} else {
	   			if (!_.selector.find('.select').hasClass('open')) {
	   				_.selector.find('.select').addClass('open');
	   				_.selector.find('.select-tab.option').css('display', 'block');
	   			}
	   		}
		})
		
		_.selector.find('.select').on('click', function(){
	   		if (!$(this).hasClass('open')) {
				_.selectorOpen();
	   		} else {
				_.selectorClose();
			}
		});
		
		_.selectorOpen = function(){
	   		_.selector.find('.select').addClass('open');
			_.selector.find('.select-tab.option').css('display', 'block');
		};
		_.selectorClose = function(){
	   		_.selector.find('.select').removeClass('open');
			_.selector.find('.select-tab.option').css('display', 'none');
		};
		
		_.mailTaps.on('click', function(event){
			let mailType = $(this).attr('data-value');
			if (mailType !== _.mailParam.mailType) {
				_.mailParam.mailType = mailType;
				switch(mailType){
				case 'PLEDGE':
					_.paginationRender(_.mailPledge);
					break;
				case 'STOREGE':
					_.paginationRender(_.mailKeep);
					break;
				default:
					_.paginationRender(_.mailPrivate);
					break;
				}
				_.mailTaps.children('a').removeClass('selected');
				$(this).children('a').addClass('selected');
				_.selector.find('.select > span').html($(this).children('a').html());
				if (_.windowWidth <= 960) {
					_.selectorClose();
				}
			}
			eventStop(event);
		});
		

		if (_.windowWidth <= 960) {
			_.selectorClose();
		} else {
			_.selectorOpen();
		}
		_.paginationRender(_.mailPrivate);
	}

	// 작성한 글
	board() {
		const _ = this;

		includeHTML(document.querySelector('#svg-container'), 'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/svg.html', cacheVersion);

		_.boardParam = {
			boardType: 'board'	
		};

		_.container = $('.pagination-container');
		_.paginationRender = function(){
	   		_.container.pagination({
	   			dataSource: function(done) {
					getDatasWithOption([{
						type: 'POST',
						url: '/define/account/board',
						dataType: 'json',
						contentType: 'application/json',
						Accept: 'application/json',
						data: _.boardParam
					}], (data) => {
						done(data);
					}, (data) => {
						console.log('fail data board mypage.js');
					});
				},
				pageSize: 10,// 한 화면에 보여질 개수
				showPrevious: false,// 처음버튼 삭제
	           			showNext: false,// 마지막버튼 삭제
	           			showPageNumbers: true,// 페이지 번호표시
	           			callback: function (data, pagination) {// 화면 출력
	           				var tpl = '';
	           				if (data.length) {
	           					$.each(data, function (index, item) {
	           						tpl += createBoard(item);
	           					});
	           					$('.ncCommunityBoardList').addClass('board-list-default');
	           				} else {
	           					tpl = '<li>등록된 글이 없습니다.</li>';
	           					$('.ncCommunityBoardList').addClass('board-list-none');
	           				}
	           				$(".ncCommunityBoardList").html(tpl);// 렌더링
					$('.nc-community-loader').css('display', 'none');
				}
			});
		}
		
		let createBoard = function(item){
			let readCount = item.board.readcount ? item.board.readcount : 0;
			let likeCount = item.board.likenames && item.board.likenames.length ? item.board.likenames.length : 0;
			let commentCount = item.board.answerList && item.board.answerList.length ? item.board.answerList.length : 0;
			let url = getBoardUrl(item);
			return `<li class="board-items">` +
	       			`<div class="title">` +
	   				`<span class="category">${item.boardType}</span>` +
	   				`<a href="${url}">${item.board.title}</a>` +
	   				`<div class="count">` +
	   					getMainImage(item.board) + 
	   					getLikeCount(item.board) +
	   					getCommentCount(item.board) + 
	   				`</div>` +
	   			`</div>` +
	   			`<div class="info">` +
	   				`<span class="writer">${getWriter(item)}<span class="server">${serverName}</span></span>` +
	   				`<span class="date">${getDate(item)}</span>` +
	   				`<span class="hit"><em class="txt">조회</em>${readCount}</span>` +
	   				`<span class="like" data-count="3">추천<em>${likeCount}</em></span>` +
	   			`</div>` +
	   			`<div class="comment"><a href="${url}"><span><em class="number">${commentCount}</em><em class="txt">댓글</em></span></a></div>` +
	   		`</li>`;
		}
		
		let getWriter = function(item){
			if (item.boardType === '거래소')
				return item.board.sellerCharacter;
			return item.board.name;
		}
		
		let getDate = function(item){
			if (item.boardType === '거래소')
				return moment(new Date(item.board.writeTime)).format('YY.MM.DD.');
			return moment(new Date(item.board.date)).format('YY.MM.DD.');
		}
		
		let getBoardUrl = function(item){
			return `javascript:urlform('${item.board.rownum}', 'post', '${item.boardUrl}');`;
		}
		
		let getLikeCount = function(board){
			if (board.likenames && board.likenames.length)
				return `&nbsp;<span class="count-like"><svg class="fe-svg fe-svg-like_s"><use xlink:href="#fe-svg-like_s"></use></svg><em>${board.likenames.length}</em></span>`;
			return '';
		}
		
		let getCommentCount = function(board){
			if (board.answerList && board.answerList.length)
				return `&nbsp;<span class="count-comment"><svg class="fe-svg fe-svg-comment"><use xlink:href="#fe-svg-comment"></use></svg><em>${board.answerList.length}</em></span>`;
			return '';
		}
		
		let getMainImage = function(board){
			if (board.mainImg)
				return '&nbsp;<svg class="fe-svg fe-svg-picture"><use xlink:href="#fe-svg-picture"></use></svg>';
			return '';
		}
		
		$('.co-btn-top_list').on('click', function(e) {
			$(window).scrollTop( 0 );
			e.preventDefault();
		});
	
		_.paginationRender();
	}

	// 댓글 단 글
	comment() {
		const _ = this;

		includeHTML(document.querySelector('#svg-container'), 'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/svg.html', cacheVersion);

		_.boardParam = {
			boardType: 'comment'	
		};

		_.container = $('.pagination-container');
		_.paginationRender = function(){
	   		_.container.pagination({
	   			dataSource: function(done) {
					getDatasWithOption([{
						type: 'POST',
						url: '/define/account/board',
						dataType: 'json',
						contentType: 'application/json',
						Accept: 'application/json',
						data: _.boardParam
					}], (data) => {
						done(data);
					}, (data) => {
						console.log('fail data comment mypage.js');
					});
				},
				pageSize: 10,// 한 화면에 보여질 개수
				showPrevious: false,// 처음버튼 삭제
	           			showNext: false,// 마지막버튼 삭제
	           			showPageNumbers: true,// 페이지 번호표시
	           			callback: function (data, pagination) {// 화면 출력
	           				let tpl = '';
	           				if (data.length) {
	           					$.each(data, function (index, item) {
	           						tpl += createBoard(item);
	           					});
	           					$('.ncCommunityBoardList').addClass('board-list-default');
	           				} else {
	           					tpl = '<li>등록된 글이 없습니다.</li>';
	           					$('.ncCommunityBoardList').addClass('board-list-none');
	           				}
	           				$(".ncCommunityBoardList").html(tpl);// 렌더링
					$('.nc-community-loader').css('display', 'none');
				}
			});
		}
		
		let createBoard = function(item){
			let readCount = item.board.readcount ? item.board.readcount : 0;
			let likeCount = item.board.likenames && item.board.likenames.length ? item.board.likenames.length : 0;
			let commentCount = item.board.answerList && item.board.answerList.length ? item.board.answerList.length : 0;
			let url = getBoardUrl(item);
			return `<li class="board-items">` +
	       			`<div class="title">` +
	   				`<span class="category">${item.boardType}</span>` +
	   				`<a href="${url}">${item.board.title}</a>` +
	   				`<div class="count">` +
	   					getMainImage(item.board) + 
	   					getLikeCount(item.board) +
	   					getCommentCount(item.board) + 
	   				`</div>` +
	   			`</div>` +
	   			`<div class="info">` +
	   				`<span class="writer">${getWriter(item)}<span class="server">${serverName}</span></span>` +
	   				`<span class="date">${getDate(item)}</span>` +
	   				`<span class="hit"><em class="txt">조회</em>${readCount}</span>` +
	   				`<span class="like" data-count="3">추천<em>${likeCount}</em></span>` +
	   			`</div>` +
	   			`<div class="comment"><a href="${url}"><span><em class="number">${commentCount}</em><em class="txt">댓글</em></span></a></div>` +
	   		`</li>`;
		}
		
		let getWriter = function(item){
			return item.board.name;
		}
		
		let getDate = function(item){
			return moment(new Date(item.board.date)).format('YY.MM.DD.');
		}
		
		let getBoardUrl = function(item){
			return `javascript:urlform('${item.board.rownum}', 'post', '${item.boardUrl}');`;
		}
		
		let getLikeCount = function(board){
			if (board.likenames && board.likenames.length)
				return `&nbsp;<span class="count-like"><svg class="fe-svg fe-svg-like_s"><use xlink:href="#fe-svg-like_s"></use></svg><em>${board.likenames.length}</em></span>`;
			return '';
		}
		
		let getCommentCount = function(board){
			if (board.answerList && board.answerList.length)
				return `&nbsp;<span class="count-comment"><svg class="fe-svg fe-svg-comment"><use xlink:href="#fe-svg-comment"></use></svg><em>${board.answerList.length}</em></span>`;
			return '';
		}
		
		let getMainImage = function(board){
			if (board.mainImg)
				return '&nbsp;<svg class="fe-svg fe-svg-picture"><use xlink:href="#fe-svg-picture"></use></svg>';
			return '';
		}
		
		$('.co-btn-top_list').on('click', function(e) {
			$(window).scrollTop( 0 );
			e.preventDefault();
		});

		_.paginationRender();
	}

	addEvents() {
		const _ = this;

		_.signature_btn = $('.ui-signature .btn');
		_.character_list = $('.my-character-list');
		_.my_character_list = $('.my-character-list .list .items');
		_.character_list_close_btn = $('.my-character-list .btn-close');
		_.myTaps = $('#mypageTab li');
	
		// 캐릭터 목록 펼치기
		_.signature_btn.on('click', function(e){
			if ($(this).hasClass('open')) {
				$(this).removeClass('open');
				_.character_list.hide();
			} else {
				$(this).parent().next().show().addClass('show');
				_.signature_btn.addClass('open');
			}
		});

		// 캐릭터 목록 닫기
		_.character_list_close_btn.on('click', function(e){
			$(this).parent().removeClass('show').hide();
			_.signature_btn.removeClass('open');
		});

		// 대표 캐릭터 변경
		_.my_character_list.on('click', function(e) {
			if ($(this).find('.name').text() == $('.ncc-login--info__char').text()) {// 동일 케릭명
				_.signature_btn.removeClass('open');
				_.character_list.hide();
				return false;
			}
			const character_id = $(this).attr('data-id');
			if (!character_id || !header_main || !header_main._login || !header_main._login._right) {
				return false;
			}
			header_main._login._right.mainCharacterChange(character_id);
		});
	
		// 탭 클릭 이벤트
		_.myTaps.on('click', function(e){
			let seleteType = $(this).children('a').attr('data-type');
			if (tabType != seleteType) {
				urlTypeform(seleteType, null, 'post', '/account/mypage');
			}
			eventStop(e);
		});
	}
}

Mypage.instance;
