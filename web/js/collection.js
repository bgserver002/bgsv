/*!
 * project : collection
 * author : LINOFFICE
 * 아이템 컬렉션
 */

let tab_type;
let total_size = 0;
let current_size = 0;
$(function() {
	if (!tab_type) {
		tab_type = 'ALL';
	}
	// 대분류 생성
	create_category();

	// 닫기 버튼 클릭 이벤트
	$('.btn_close').on('click', function(e){
		window.self.close();
	});
	// 새로고침 버튼 클릭 이벤트
	$('.btn_reload').on('click', function(e){
		location.reload();
	});

	// initialize rendering
	render_list(collections);

	// 스크롤바 활성화
	$('.scrollbar-macosx').scrollbar();
});

// 대분류 명칭 배열
const CATEGORY_DESCS = {
	'ALL' : '전체',
	'NORMAL' : '일반',
	'ADVANCED' : '고급',
	'RARE' : '희귀',
	'HERO' : '영웅',
	'LEGEND' : '전설',
	'MYTH' : '신화',
	'ONLY' : '유일',
	'EVENT' : '이벤트',
	'LEVEL' : '레벨'
}

// 대분류 생성
function create_category() {
	if (!collections) {
		return;
	}
	let tabWidth = 100 / (collections.length + 1);
	let tabHtml = '';
	let total_size = 0;
	for (var i=0; i<collections.length; i++) {
		let category = collections[i];
		let section_size = !category.section_list ? 0 : category.section_list.length;
		total_size += section_size;
		let category_desc = `${CATEGORY_DESCS[category.category]}(${section_size})`;
		tabHtml += `<li style="width: ${tabWidth}%;"><a href="javascript:change_tab('${category.category}')" data-value="${category.category}" class="${tab_type == category.category ? `on` : ``}">${category_desc}</a></li>`;
	}
	$('#collectionTab .handle .btns').html(`<li style="width: ${tabWidth}%;"><a href="javascript:change_tab('ALL')" data-value="ALL" class="${tab_type == 'ALL' ? `on` : ``}">전체(${total_size})</a></li>${tabHtml}`);
}

// 탭 변경
function change_tab(tab_val) {
	if (tab_type == tab_val) {
		return;
	}
	$('#collectionTab .btns > li > a').removeClass('on');
	$('#collectionTab .btns > li > a[data-value=' + tab_val + ']').addClass('on');
	tab_type = tab_val;
	
	if (tab_type == 'ALL') {
		render_list(collections);
	} else {
		let type_container = [];
		for (var i=0; i<collections.length; i++) {
			if (collections[i].category == tab_type) {
				type_container.push(collections[i]);
			}
		}
		render_list(type_container);
	}
	$('.scrollbar-macosx').scrollbar();
}

// 슬롯 조사
function get_slot(category_val, section_id_val, slot_id_val) {
	if (!collections) {
		return null;
	}
	for (var i=0; i<collections.length; i++) {
		let category = collections[i];
		if (category.category == category_val) {
			for (var j=0; j<category.section_list.length; j++) {
				let section = category.section_list[j];
				if (section.section_id == section_id_val) {
					for (var s=0; s<section.slot_list.length; s++) {
						let slot = section.slot_list[s];
						if (slot.slot_id == slot_id_val) {
							return slot;
						}
					}
				}
			}
		}
	}
	return null;
}

// 슬롯 명
function get_slot_desc(slot) {
	let slot_desc = '';
	if (slot.bless != 1) {
		slot_desc += `<i class="${slot.bless == 0 ? `blessed` : `cursed`}">`;
	}
	if (slot.enchant > 0) {
		slot_desc += `+${slot.enchant} `;
	}
	slot_desc += slot.item.name;
	if (slot.amount > 1) {
		slot_desc += ` (${commaAdd(slot.amount)})`;
	}
	if (slot.bless != 1) {
		slot_desc += `</i>`;
	}
	return slot_desc;
}

// 인벤토리 아이템 조사
function get_inventory_item(slot) {
	if (!inventory) {
		return null;
	}
	for (var i=0; i<inventory.length; i++) {
		let inv_val = inventory[i];
		if (inv_val.item_id == slot.item.itemid && inv_val.amount >= slot.amount && inv_val.enchant == slot.enchant && inv_val.bless == slot.bless) {
			return inv_val;
		}
	}
	return null;
}

// 등록 섹션 정보
function get_regist(category, section_id) {
	if (!regist || !regist.regist_list) {
		return null;
	}
	for (var i=0; i<regist.regist_list.length; i++) {
		let regist_val = regist.regist_list[i];
		if (regist_val.category == category && regist_val.section_id == section_id) {
			return regist_val;
		}
	}
	return null;
}

// 섹션 상태 html
function get_section_status_html(regist_val) {
	if (!regist_val) {
		return '';
	}
	if (regist_val.is_complete) {
		return '<strong class="section_complete">완성</strong>';
	}
	return '';
}

// 슬롯 상태
function get_slot_status(slot, regist_val, inv_val) {
	if (regist_val && regist_val.slot_list && regist_val.slot_list.length) {
		for (var i=0; i<regist_val.slot_list.length; i++) {
			let regist_slot_val = regist_val.slot_list[i];
			if (regist_slot_val.slot_id == slot.slot_id 
				&& regist_slot_val.item.itemid == slot.item.itemid 
				&& regist_slot_val.amount == slot.amount 
				&& regist_slot_val.enchant == slot.enchant 
				&& regist_slot_val.bless == slot.bless) {
				return 1;
			}
		}
	}
	if (!inv_val) {
		return 0;
	}
	return 2;
}

// 슬롯 상태 html
function get_slot_status_html(status, category, section_id, slot_id, inv_val) {
	switch (status) {
	case 0:
		return `<div class="status disable"></div>`;
	case 2:
		return `<div class="status enable"><button onClick="confirm_regist('${category}', ${section_id}, ${slot_id}, ${inv_val.id});">등록</button></div>`;
	default:
		return ``;
	}
}

// 슬롯 정보 출력, 감추기 이벤트
function section_top_click(obj) {
	$(obj).parent('.collection_section').toggleClass('up');
}

// 리스트 출력
function render_list(render_data) {
	$('.data-loader').css('display', 'block');
	let dataHtml = '';
	if (render_data.length > 0) {
		total_size = current_size = 0;
		dataHtml += `<ul id="collection_list">`;
		$.each(render_data, function (index, category) {
			if (category.section_list && category.section_list.length) {
				$.each(category.section_list, function (index, section) {
					let regist_val = get_regist(category.category, section.section_id);
					let section_status_html = get_section_status_html(regist_val);
					total_size++;
					if (section_status_html != '') {
						current_size++;
					}
					dataHtml += `<li class="collection_section" data-category="${category.category}" data-section-id="${section.section_id}"><div class="top" onClick="section_top_click(this);"><div class="section_desc"><strong>${section.section_desc}</strong>${section_status_html}</div><div class="bonus_desc"><div class="scrollbar-macosx"><ul>${section.bonus_desc}</ul></div></div></div><div class="slot_list">`;
					if (section.slot_list && section.slot_list.length) {
						dataHtml += `<ul>`;
						$.each(section.slot_list, function (index, slot) {
							let inv_val = get_inventory_item(slot);
							let status = get_slot_status(slot, regist_val, inv_val);
							let status_html = get_slot_status_html(status, category.category, section.section_id, slot.slot_id, inv_val);
							dataHtml += `<li class="slot" style="background-image : url('/img/item/${slot.item.invgfx}.png');" data-category="${category.category}" data-section-id="${section.section_id}" data-slot-id="${slot.slot_id}">${status_html}<strong class="slot_desc">${get_slot_desc(slot)}</strong></li>`;
						});
						dataHtml += `</ul>`;
					}
					dataHtml += `</div></li>`;
				});
			}
		});
		dataHtml += `</ul>`;
		let progress = `완성률(${current_size}/${total_size} ${Math.max(Math.min(parseInt((current_size / total_size) * 100), 100), 0)}%)`;
		$('header h1 span').text(progress);
	} else {
		dataHtml = `<div><em>데이터가 없습니다.</em></div>`;
	}
	$(".redar_container").html(dataHtml);// 렌더링
	$('.data-loader').css('display', 'none');
}

// 등록 컨펌
function confirm_regist(category, section_id, slot_id, id) {
	ncuim_modal_show('등록하시겠습니까?', `do_regist('${category}', ${section_id}, ${slot_id}, ${id});`);
}

// 등록 완료
function success_regist(category, section_id, slot_id, id, is_complete) {
	let slot = get_slot(category, section_id, slot_id);
	if (!slot) {
		return;
	}
	if (!regist) {
		regist = {
			'uid' : 0,
			'regist_list' : []
		};
	}
	let regist_list_val;
	for (var i=0; i<regist.regist_list.length; i++) {
		if (regist.regist_list[i].category == category && regist.regist_list[i].section_id == section_id) {
			regist_list_val = regist.regist_list[i];
		}
	}
	if (!regist_list_val) {
		regist_list_val = {
			'category' : category,
			'section_id' : section_id,
			'slot_list' : [],
			'is_complete' : false
		};
		regist.regist_list.push(regist_list_val);
	}
	// 등록
	regist_list_val.slot_list.push(slot);
	if (is_complete) {
		regist_list_val.is_complete = is_complete;
	}
	// 인벤토리 소모
	for (var i=0; i<inventory.length; i++) {
		let inv_val = inventory[i];
		if (inv_val.id == id) {
			if (inv_val.amount == slot.amount) {
				inventory.splice(i, 1);
			} else {
				inv_val.amount -= slot.amount;
			}
		}
	}
	// 화면 처리
	let section_obj = $('.collection_section[data-category=' + category + '][data-section-id=' + section_id + ']');
	let section_obj_desc = section_obj.find('.section_desc');
	let section_obj_slot = section_obj.find('.slot_list .slot[data-slot-id=' + slot_id + ']');
	if (is_complete) {
		section_obj_desc.append('<strong class="section_complete">완성</strong>');
	}
	section_obj_slot.children('.status.enable').remove();
	let progress = `완성률(${current_size}/${total_size} ${Math.max(Math.min(parseInt((current_size / total_size) * 100), 100), 0)}%)`;
	$('header h1 span').text(progress);
}

let registLock = false;// 인게임과의 통신시 딜레이 방지
// 등록 하기
function do_regist(category, section_id, slot_id, id) {
	if (registLock) {
		return;
	}
	registLock = true;// 잠금
	const sendParam = {
		'category' : category,
		'section_id' : section_id,
		'slot_id' : slot_id,
		'id' : id
	};
	getDatasWithOption([{
		type: 'POST',
		url: '/define/collection/regist',
		dataType: 'json',
		contentType: 'application/json',
		Accept: 'application/json',
		data: sendParam
	}], (data) => {
		switch (data) {
		case 1:
			success_regist(category, section_id, slot_id, id, false);
			break;
		case 2:
			success_regist(category, section_id, slot_id, id, true);
			break;
		case 3:
			ncuim_modal_show('인게임에서 등록할 수 있습니다.');
			break;
		case 4:
			ncuim_modal_show('계정 정보를 찾을 수 없습니다.');
			break;
		case 5:
			ncuim_modal_show('대표 캐릭터를 찾을 수 없습니다.');
			break;
		case 6:
			ncuim_modal_show('월드 내 캐릭터를 찾을 수 없습니다.');
			break;
		case 7:
			ncuim_modal_show('파라미터 유효성 검증에 실패하였습니다.');
			break;
		case 8:
			ncuim_modal_show('컬렉션 정보를 찾을 수 없습니다.');
			break;
		case 9:
			ncuim_modal_show('등록가능한 아이템을 찾을 수 없습니다.');
			break;
		case 10:
			ncuim_modal_show('이미 등록된 슬롯입니다.');
			break;
		case 11:
			ncuim_modal_show('이미 완성된 컬렉션입니다.');
			break;
		case 12:
			ncuim_modal_show('아이템 소모에 실패하였습니다.');
			break;
		default:
			ncuim_modal_show('등록에 실패하였습니다.');
			break;
		}
		registLock = false;// 해재
	}, (data) => {
		registLock = false;// 해재
	});
}