/*!
 * project : schedule
 * author : LINOFFICE
 * 아덴 스케줄
 */

$(function() {
	const today = new Date();
	
	const year = today.getFullYear(); // 년도
	const month = today.getMonth() + 1; // 월
	const date = today.getDate(); // 일
	const hours = today.getHours(); // 시
	const minutes = today.getMinutes(); // 분

	const weekday = [ '일', '월', '화', '수', '목', '금', '토' ];
	const day = weekday[today.getDay()];
	
	const today_format = `${year}. ${month < 10 ? `0` : ``}${month}. ${date < 10 ? `0` : ``}${date}. (${day})`;
	const time_format = `현재시간 ${hours < 10 ? `0` : ``}${hours}:${minutes < 10 ? `0` : ``}${minutes}`;
	$('.schedule-header .today').text(today_format);
	$('.schedule-header .schedule-header-time .time').text(time_format);

	let day_index = 0;
	switch (day) {
	case '월':
		day_index = 1;
		break;
	case '화':
		day_index = 2;
		break;
	case '수':
		day_index = 3;
		break;
	case '목':
		day_index = 4;
		break;
	case '금':
		day_index = 5;
		break;
	case '토':
		day_index = 6;
		break;
	case '일':
		day_index = 7;
		break;
	}
	const selected_head_li = $('.schedule-table-head .schedule-table-row > li:nth-child(' + day_index + ')');
	selected_head_li.addClass('today');
	selected_head_li.addClass('selected');

	const selected_body = $('.schedule-table-body .schedule-table-row > li:nth-child(' + day_index + ')');
	const selected_body_a = selected_body.children('a');
	selected_body_a.addClass('now');

	let width_flag = false;
	if (window.outerWidth <= 960) {
		selected_body.addClass('show');
		width_flag = true;
	}
	$( window ).resize( function() {
		var reWidth = window.outerWidth;
		if (reWidth > 960 && width_flag == true) {
			$('.schedule-table-head .schedule-table-row > li').removeClass('selected');
			selected_head_li.addClass('selected');
			$('.schedule-table-body .schedule-table-row > li').removeClass('show');
			width_flag = false;
		} else if (reWidth <= 960 && width_flag == false) {
			$('.schedule-table-body .schedule-table-row > li').removeClass('show');
			selected_body.addClass('show');
			width_flag = true;
		}
	});

	$('.schedule-table-head .schedule-table-row > li').on('click', function(e){
		if (window.outerWidth <= 960 && !$(this).hasClass('selected')) {
			$('.schedule-table-head .schedule-table-row > li').removeClass('selected');
			$(this).addClass('selected');
			let select_index = $('.schedule-table-head .schedule-table-row > li').index(this) + 1;
			$('.schedule-table-body .schedule-table-row > li').removeClass('show');
			$('.schedule-table-body .schedule-table-row > li:nth-child(' + select_index + ')').addClass('show');
		}
	});
});