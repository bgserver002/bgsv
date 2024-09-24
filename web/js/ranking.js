/*!
 * project : ranking
 * author : LINOFFICE
 * 랭킹
 */

let rank_singleton = null;
let rank_singletonEnforcer = 'singletonEnforcer';
class Ranking {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== rank_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!rank_singleton) rank_singleton = new Ranking(rank_singletonEnforcer);
		return rank_singleton;
	}

	// 초기 설정
	init() {
		const _ = this;

		_.parmaeter = {
			charType : 'all'
		};

		_.GAME_CLASS_NAME = [
			'군주', '기사', '요정', '마법사', '다크엘프', '용기사', '환술사', '전사', '검사', '창기사', '성기사'
		];

		_.wrap = $(".table-ranking-area");
		_.wrap_list = $('.table-list');
		_.container = $('.pagination');
		_.loader = $('.data-loader');

		_.my_char_rank = null;

		_.setMyCharacterRanking();
		_.setClassRanking();

		_.addEvents();
	}

	// 내 랭킹 정보
	setMyCharacterRanking() {
		const _ = this;

		if (!account || !account.charList) {
			return;
		}

		let tpl = account.charList.map( (item, index) => {
			if (item.level < 80) {
				return '';
			}
			if (item.allRank === 0) {
				return '';
			}			
			return `<div class="detail-info-list">` +
				`<dl>` +
					`<dt class="thumb"><img src="https://cdn.jsdelivr.net/gh/cckiss/web${item.profileUrl}"></dt>` +
					`<dd><strong class="name">${item.name}</strong><span class="server">${serverName}</span><span class="level">${item.level}Lv.</span></dd>` +
				`</dl>` +
				`<div class="ranking-info">` +
					`<ul>` +
						`<li><strong>${item.allRank}</strong><span>서버랭킹</span></li>` +
						`<li><strong>${item.classRank}</strong><span>클래스랭킹</span></li>` +
						`<li class="grade"><span class="star ${_.getGradeMy(item.allRank)}"></span><span>등급</span></li>` +
					`</ul>` +
				`</div>` +
			`</div>`;
		}).join('');

		if (!tpl) {
			return;
		}

		$('.section-ranking-mycharacter').append(`<div class="wrap-detail-info" style="display: block;">` +
			`<h2><strong>내캐릭터</strong><span class="date">${rank_cache_time}</span></h2>` +
			`<div class="detail-info">${tpl}</div>` +
			`<p class="notice">* 80레벨 이상 캐릭터만 랭킹 확인이 가능합니다.</p>` +
		`</div>`);

		_.my_char_rank = $('.section-ranking-mycharacter .detail-info');

		_.my_char_rank.slick({
			dots: true,
			arrows: false,
			infinite: true,
			speed: 250,
			slidesToShow: 1,
			slidesToScroll: 1,
			responsive: [{
				breakpoint: Number.MAX_VALUE,
				settings: 'unslick'
			}, {
				breakpoint: 960,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				}
			}]
		});
	}

	// 클래스 랭킹 정보
	setClassRanking() {
		const _ = this;

		_.loader.css('display', 'block');
   		_.container.pagination({
   			dataSource: function(done) {
				getDatasWithOption([{
					type: 'POST',
					url: '/define/rank',
					dataType: 'json',
					contentType: 'application/json',
					Accept: 'application/json',
					data: _.parmaeter
				}], (data) => {
					done(data);
				}, (data) => {
					_.loader.css('display', 'none');
					$('.nodata').remove();
					_.wrap_list.css('display', 'none');
           					$('.section-ranking-list').append(`<div class="nodata"><p>랭킹 정보를 제공하지 않는 서버입니다.</p></div>`);
					throw new Error("render from rank.js Error");
				});
			},
			pageSize: 20,// 한 화면에 보여질 개수
			showPrevious: false,// 처음버튼 삭제
			showNext: false,// 마지막버튼 삭제
			showPageNumbers: true,// 페이지 번호표시
			callback: function (data, pagination) {// 화면 출력
				let tpl = '';
				$('.nodata').remove();
				if (data.length) {
					tpl = data.map( (item, key) => {
						const rank_val = item.curRank - item.oldRank;
						const rank_tag = rank_val > 0 ? `up` : rank_val < 0 ? `down` : ``;
						const class_desc = _.GAME_CLASS_NAME[item.classId];
						const grade_tag = _.getGrade(_.parmaeter.charType === 'all' ? item.curRank : item.subCurRank);
						return `<tr>` +
                   						`<td class="rank"><span class="num">${item.curRank}</span><span class="ui-rank ${rank_tag}">${rank_val == 0 ? `-` : rank_val}</span></td>` +
                   						`<td>${item.name}</td>` +
                   						`<td>${class_desc}</td>` +
                   						`<td class="grade"><span class="star ${grade_tag}"></span></td>` +
                   					`</tr>`;
					}).join('');
					_.wrap_list.css('display', 'block');
				} else {
           					_.wrap_list.css('display', 'none');
           					$('.section-ranking-list').append(`<div class="nodata"><p>랭킹 정보가 없습니다.</p></div>`);
				}
				_.wrap.html(tpl);// 렌더링
				_.loader.css('display', 'none');
			}
		});
	}

	getGradeMy(rank) {
   		if (rank >= 1 && rank <= 10)
			return 'grade4';
   		if (rank >= 11 && rank <= 20)
			return 'grade3';
   		if (rank >= 21 && rank <= 60)
			return 'grade2';
   		if (rank >= 61 && rank <= 80)
			return 'grade1';
   		return 'grade0';
	}

	getGrade(rank) {
		if (rank == 1)
			return 'top1';
		if (rank == 2)
			return 'top2';
		if (rank == 3)
			return 'top3';
   		if (rank >= 4 && rank <= 10)
			return 'grade4';
   		if (rank >= 11 && rank <= 20)
			return 'grade3';
   		if (rank >= 21 && rank <= 60)
			return 'grade2';
   		if (rank >= 61 && rank <= 80)
			return 'grade1';
   		return 'grade0';
	}

	resize() {
		const _ = this;

		if (!_.my_char_rank) {
			return;
		}
		_.my_char_rank.slick('resize');
	}

	addEvents() {
		const _ = this;

	  	let windowWidth = $(window).width();
   		const selector = $('.ui-select-tab.select-tab-class');
		const select_tab = $('.select-tab.option > li > a');

		// 브라우저 사이즈 변화
   		$(window).resize(function () {
   			const width_size = window.outerWidth;// 사이즈 변화에 대한 넓이
   			windowWidth = width_size;// 전역 변수 넓이
   			if (width_size <= 960) {
   				if (selector.find('.select').hasClass('open')) {
   					selector.find('.select').removeClass('open');
   					selector.find('.select-tab.option').css('display', 'none');
					_.resize();
   				}
   			} else {
   				if (!selector.find('.select').hasClass('open')) {
   					selector.find('.select').addClass('open');
   					selector.find('.select-tab.option').css('display', 'block');
					_.resize();
   				}
   			}
   		})
   	
   		select_tab.on('click', function(e){
   			const charType = $(this).attr('data-type');
   			if (_.parmaeter.charType === charType) {
   				if (windowWidth <= 960 && selector.find('.select').hasClass('open')) {
   	   				selectorClose();
				}
   				eventStop(e);
   				return;
   			}
			_.parmaeter.charType = charType;
   			select_tab.removeClass('selected');
   			$(this).addClass('selected');
   			$('#rankingtop').text(charType === 'all' ? rank_total_range : rank_class_range);
   			selector.find('.select').text($(this).text());
   			_.container.destory;
   			_.setClassRanking();
   		
   			if (windowWidth <= 960 && selector.find('.select').hasClass('open')) {
   				selectorClose();
			}
   			eventStop(e);
   		});
   	
   		selector.find('.select').on('click', function(){
   			if (!$(this).hasClass('open')) {
				selectorOpen();
   			} else {
				selectorClose();
			}
   		});
   	
   		let selectorOpen = function(){
   			selector.find('.select').addClass('open');
			selector.find('.select-tab.option').css('display', 'block');
   		};
   		let selectorClose = function(){
   			selector.find('.select').removeClass('open');
			selector.find('.select-tab.option').css('display', 'none');
   		};
   	
   		// 영역밖 클릭
   		$('body').mouseup(function (e){
   			if (windowWidth <= 960 && !selector.has(e.target).length && !select_tab.has(e.target).length) {
   				selectorClose();
			}
   			eventStop(e);
   		});
   	
   		if (windowWidth <= 960) {
			selectorClose();
   		} else {
			selectorOpen();
		}
	}
}

Ranking.instance;