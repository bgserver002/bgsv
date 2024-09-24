/*!
 * project : blood
 * author : LINOFFICE
 * 혈맹
 */

let blood_singleton = null;
let blood_singletonEnforcer = 'singletonEnforcer';
class Blood {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== blood_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!blood_singleton) blood_singleton = new Blood(blood_singletonEnforcer);
		return blood_singleton;
	}

	// 초기 설정
	init() {
		const _ = this;

   		_.parmaeter = {
   			query : '',
   			sortType : 0
   		};

		_.wrap = $(".table-list");
		_.container = $('.pagination');
		_.loader = $('.data-loader');

		_.setInstance();
		_.addEvents();
	}

	setInstance() {
		const _ = this;

		_.loader.css('display', 'block');
   		_.container.pagination({
			dataSource: function(done) {
				getDatasWithOption([{
					type: 'POST',
					url: '/define/pledge',
					dataType: 'json',
					contentType: 'application/json',
					Accept: 'application/json',
					data: _.parmaeter
				}], (data) => {
					if (data) {
               	        				if (account && account.firstChar && account.firstChar.pledge) {
							//let ingame_btn = account.ingame ? '<div class="wrap-button"><a class="button selected btn-myblood" href="javascript:L1.OpenPledgeUI()">내 혈맹</a></div>' : '';// 인게임 팅김
							let ingame_btn = '';
               	        					let tpl_my_pledge = `<h2><strong>내혈맹</strong></h2>` +
                   						`<div class="detail-info">` +
               							`<div class="blood-title">` +
               								`<span class="blood-icon"><i class="icon-pledge"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43 41"><path fill="#C69C7C" d="M36.797 6.243c-.523-.561-1.446-.29-1.446-.29-4.355.54-7.672-.004-10.167-.984-3.122-1.227-4.954-3.14-5.92-4.47a1.191 1.191 0 0 0-1.898-.053c-1.9 2.351-6.699 6.61-15.991 5.504A1.213 1.213 0 0 0 .017 7.118C-.133 11.43.318 28.484 17.994 40c3.39-1.786 6.531-4.488 8.794-6.741 5.662-5.638 8.146-12.278 9.203-17.62 0 0 1.552-8.595.806-9.396" mask="url(#b)"></path><path fill="#FFF" d="M28.878 27.143l.002-.003.01-.014c.078-.122.168-.345.061-.434-.115-.096-.264.023-.4.13l-.114.086c-1.077.746-2.079 1.066-3.189 1.107-1.373.04-2.244-.346-2.39-1.06-.046-.223.036-.716.097-.975a8.704 8.704 0 0 0 .123-3.375c-.388-2.268-1.545-4.091-2.475-5.555l-.211-.333c-.311-.501-.861-1.515-.889-1.617l-.002-.007-.004-.012c-.313-.664-.266-.984-.172-1.134a.344.344 0 0 1 .252-.159s.174-.02.32.039c.047-.249-.087-.39-.087-.39-.23-.237-.574-.408-.704-.472l-.028-.013c-.809-.413-2.736-.933-3.833-.951-.11 0-.2-.013-.233.057-.03.064.006.2.012.226.344 1.587.71 2.718 3.776 5.8.076.073.462.47.726.753.48.53 1.946 2.148 2.243 3.253.479 1.754-.824 4.385-2.326 6.214-.365.444-.524.773-.487 1.008.024.15.12.225.19.27.267.183 2.46.601 5.692-.257.049-.01.306-.074.336-.082 2.367-.683 3.336-1.61 3.704-2.1"></path></svg></i></span>` +
               								`<span class="blood-name"><strong class="name">${account.firstChar.pledge.name}</strong>${ingame_btn}</span>` +
               							`</div>` +
               							`<div class="blood-info">` +
               								`<ul>` +
               									`<li><span>혈맹군주</span><strong class="leader">&nbsp;&nbsp;&nbsp;&nbsp;${account.firstChar.pledge.leader_name}</strong></li>` +
               									`<li><span>혈맹원수 (최근/전체)</span><strong><strong class="count">${account.firstChar.pledge.member_size}</strong>/50명</strong></li>` +
               								`</ul>` +
               								`<ul>` +
               									`<li><span>혈맹공헌도</span><strong><strong class="exp">${commaAdd(account.firstChar.pledge.contribution)}</strong>P</strong></li>` +
               									`<li><span>아지트</span><strong class="has">${account.firstChar.pledge.castle_desc ? account.firstChar.pledge.castle_desc : account.firstChar.pledge.agit_desc}</strong></li>` +
               								`</ul>` +
               							`</div>` +
               						`</div>`;
               	        					$('.wrap-detail-info').html(tpl_my_pledge);
               	        				} else {
               	        					$('.wrap-detail-info').remove();
               	        				}
					}
					done(data);
				}, (data) => {
					throw new Error("render from blood.js Error");
				});
			},
			pageSize: 20,// 한 화면에 보여질 개수
			showPrevious: false,// 처음버튼 삭제
			showNext: false,// 마지막버튼 삭제
			showPageNumbers: true,// 페이지 번호표시
			callback: function (data, pagination) {// 화면 출력
				let tpl = '';
				if (data.length) {
					var is_ingame = account && account.ingame;
					$.each(data, function (index, val) {
						tpl +=
                   					`<div class="tr">` +
		        					`<div class="td-row"><span class="td-blood">${val.name}</span><span class="td-master">${val.leader_name}</span><span class="td-member">${val.member_size}/50명</span></div>` +
		        					`<div class="td-row">` +
		        						`<span class="td-point"><strong>${commaAdd(val.contribution)}</strong>P</span>` +
		        						`<span class="td-azit">${val.castle_desc ? val.castle_desc : val.agit_desc}</span>` +
		        						`<span class="td-join">${is_ingame ? val.join_button : ``}</span>` +
		        					`</div>` +
		        				`</div>`;
					});
				} else {
					tpl = `<div class="nodata"><p>혈맹 정보가 존재하지 않습니다.</p></div>`;
				}
				_.wrap.html(tpl);// 렌더링
				_.loader.css('display', 'none');
			}
		});
	}

	addEvents() {
		const _ = this;

		const sortor = $('.section-blood-list.section-blood-info > .tab > li');
   		const searchInput = $('#suggestInput');
   		const searchResetBtn = $('.icon-delete');
   		const searchSubmitBtn = $('#suggestSubmit');

		// 정렬 탭 클릭 이벤트
   		sortor.on('click', function(event) {
   			const sortValue = $(this).children('a').attr('data-sort-type');
   			if (_.parmaeter.sortType !== sortValue) {
   				_.parmaeter.sortType = sortValue;
   				sortor.removeClass('active');
   				$(this).addClass('active');
   				_.setInstance();
   			}
		});

		// 검색 인풋 키보드 이벤트
		searchInput.keyup(function(event){
			const input_length = searchInput.val().length;
			searchResetBtn.css( 'display', (input_length ? '' : 'none') );

			// enter key
			if (event.keyCode === 13) {
				_.parmaeter.query = input_length ? searchInput.val() : '';
				_.setInstance();
			}
		});

		// 검색 인풋 초기화
		searchResetBtn.on('click', function(event) {
			searchInput.val('');
			searchResetBtn.css('display', 'none');
			searchInput.focus();
		});

		// 검색 이벤트
		searchSubmitBtn.on('click', function(event) {
			const input_length = searchInput.val().length;
			_.parmaeter.query = input_length ? searchInput.val() : '';
			_.setInstance();
		});
	}
}

Blood.instance;