/*!
 * project : beginner
 * author : LINOFFICE
 * 용사 가이드
 */

let beginner_singleton = null;
let beginner_singletonEnforcer = 'singletonEnforcer';
class Beginner {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== beginner_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!beginner_singleton) beginner_singleton = new Beginner(beginner_singletonEnforcer);
		return beginner_singleton;
	}

	// 초기 설정
	init() {
		const _ = this;

		_.boss_container = [];

		_.selectBoss($('.article-tab #bossTab .tab-item.on a').attr('data-id'));

		_.addEvents();
	}

	getBossData(boss_id) {
		const _ = this;

		_.boss_container.map( (item, index) => {
			if (item.key == boss_id) {
				return item;
			}
		});
		return null;
	}

	changeBoss(boss_id) {
		const _ = this;

		$('.wrap-section-boss .article-tab #bossTab .tab-item').removeClass('on');
		const tab = $('.wrap-section-boss .article-tab #bossTab .tab-item a[data-id=' + boss_id + ']');
		tab.parent('.tab-item').addClass('on');
		$('.article-boss .table').removeClass('on');
		$('.article-boss #boss-' + boss_id).addClass('on');
		_.selectBoss(boss_id);
	}

	selectBoss(boss_id) {
		const _ = this;

		let bossContent = _.getBossData(boss_id);
		if (bossContent) {
			$(".article-boss .table-bundle .table-bundle-row").html(bossContent.value);
			return;
		}
		const boss_data = guideBossData[boss_id];
		if (!boss_data) {
			return;
		}

		let tpl_name = ``;
		let tpl_thumnail = ``;
		let tpl_loc = ``;
		let tpl_time = ``;
		let tpl_drop = ``;
		for (var i=0; i<boss_data.length; i++) {
			const boss = boss_data[i];
			tpl_name += `<th class="name"><a href="/powerbook/search?searchType=2&amp;query=${boss.bossName}">${boss.bossName}</a></th>`;
			tpl_thumnail += `<td class="thumbnail"><a href="/powerbook/search?searchType=2&amp;query=${boss.bossName}"><img src="${boss.bossImg}" class="thumb"></a></td>`;
			tpl_loc += `<td class="zone">${boss.spawnLoc}</td>`;
			tpl_time += `<td class="spawn">${boss.spawnTime}</td>`;
			tpl_drop += `<td class="drop">${boss.dropName}</td>`;
		}
		let tpl = `<table class="table table-size-${boss_data.length} on" id="boss-${boss_data[0].loc}"><thead><tr><th class="name thead"><span>몬스터명<br> (레벨)</span></th>${tpl_name}` +
			`</tr></thead><tbody><tr><td class="thumbnail thead"><span>이미지</span></td>${tpl_thumnail}` +
			`</tr><tr><td class="zone thead"><span>출현지역</span></td>${tpl_loc}` +
			`</tr><tr><td class="spawn thead"><span>출현시간</span></td>${tpl_time}` +
			`</tr><tr><td class="drop thead"><span>주요 드롭<br> 아이템</span></td>${tpl_drop}` +
			`</tr></tbody></table>`;
			
		const push_data = { key: boss_id, value: tpl };
		_.boss_container.push(push_data);// 컨테이너 등록
		$(".article-boss .table-bundle .table-bundle-row").html(tpl);
	}

	addEvents() {
		const _ = this;

		const quickmenu	= $('.quickmenu');
		const huntOption	= $('.wrap-section-hunt .article-tab > ul > li');
		const huntBundle	= $('.wrap-section-hunt .article-hunt .table-bundle-row > table');
		const helpers	= $('.wrap-section-item .section-item .icon-helper');
		let bossSlickWork	= true;

		quickmenu.find('button').on('click', function(e){
			quickmenu.toggleClass('off');
		});
		quickmenu.find('a').on('click', function(e){
			const section = $(this).attr('class');
			$('html, body').stop().animate({
				scrollTop: ($('.wrap-section-' + section).offset().top - 74)
			}, 600);
			e.preventDefault();
		});

		helpers.on('click', function(e){
			if ($(this).hasClass('on')) {
				$(this).removeClass('on');
				$(this).parent('header').children('.wrap-helper').fadeOut();
			} else {
				$(this).addClass('on');
				$(this).parent('header').children('.wrap-helper').fadeIn();
			}
		});

		huntOption.on('click', function(e){
			if (!$(this).hasClass('on')) {
				huntOption.removeClass('on');
				$(this).addClass('on');
				const pagelevel = $(this).children('a').attr('data-lv');
				huntBundle.css('display', 'none');
				$('.wrap-section-hunt .article-hunt .table-bundle-row > #hunt-' + pagelevel).css('display', 'table');
			}
			eventStop(e);
		});
	
		// slick Update
		let bossSlick = $('.wrap-section-boss .article-tab #bossTab').slick({
			dots: false,
			arrows: false,
			infinite: true,
			slidesToShow: 13,
			slidesToScroll: 13,
			responsive: [
				{
					breakpoint: 960,
					settings: {
						slidesToShow: 1,
						slidesToScroll: 1,
						arrows: true,
					}
				}
			]
		});

		if (window.outerWidth > 960) {
			bossSlick.slick('unslick');
			bossSlickWork = false;
		}
	
		bossSlick.on('beforeChange', function(event, slick, currentSlide, nextSlide){
			_.changeBoss(nextSlide);
			eventStop(event);
		});

		$('#bossTab .tab-item a').on('click', function(e){
			if (!bossSlickWork) {
				_.changeBoss($(this).attr('data-id'));
			}
			eventStop(e);
		});
	
		$( window ).resize( function() {
			const reWidth = window.outerWidth;
			if (reWidth > 960 && bossSlickWork) {
				bossSlick.slick('destroy');
				bossSlickWork = false;
			} else if (reWidth <= 960 && !bossSlickWork) {
				bossSlick.slick('refresh');
				bossSlickWork = true;
			}
		});
	
		// slick Update
		$('.wrap-section-recommend .article-recommend').slick({
			dots: true,
			arrows: false,
			infinite: true,
			slidesToShow: 6,
			slidesToScroll: 6,
			responsive: [
				{
					breakpoint: 960,
					settings: {
						slidesToShow: 3,
						slidesToScroll: 3
					}
				}
			]
		});
	}

}

Beginner.instance;