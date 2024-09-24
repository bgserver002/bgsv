/*!
 * project : powerbook
 * author : LINOFFICE
 * 파워북
 */

$(function() {
	$('.recommend__list').slick({
		dots:		true,
		arrows:		false,
		infinite:		true,
		slidesToShow:	1,
		slidesToScroll:	1
	});
	$('.recommend__controller-prev').on('click', function (e) {
		$('.recommend__list').slick('slickPrev');
	});
	$('.recommend__controller-next').on('click', function (e) {
		$('.recommend__list').slick('slickNext');
	});
	
	const guideSlick = $('.guide__list');
	let slickOptions = {
		dots:		false,
		arrows:		false,
		infinite:		true,
		slidesToShow:	1,
		slidesToScroll:	1	
	}
	
	let slick_flag = false;
	if ($(window).width() < 640) {
		guideSlick.not('.slick-initialized').slick(slickOptions);
		slick_flag = true;
	}
	
	$(window).resize(function (){
		if (!slick_flag && $(window).width() < 640) {
			guideSlick.not('.slick-initialized').slick(slickOptions);
			slick_flag = true;
		} else {
			if (slick_flag) {
				guideSlick.slick("unslick");
				slick_flag = false;
			}
		}
	})
	
	// 검색 자동 제안 설정
	create_auto_suggest({
		selector: '#suggestForm',
		size: 5,
		action: '/powerbook/search',
		useDelbtn: true,
		type: '0'
	});
});