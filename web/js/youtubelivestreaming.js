/*!
 * project : youtubelivestreaming
 * author : LINOFFICE
 * 유튜브 방송 보상
 */

let youtube_singleton = null;
let youtube_singletonEnforcer = 'singletonEnforcer';
class YoutubeLiveStreaming {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== youtube_singletonEnforcer) throw 'Cannot--construct singleton';
		this.init();
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!youtube_singleton) youtube_singleton = new YoutubeLiveStreaming(youtube_singletonEnforcer);
		return youtube_singleton;
	}

	// 초기 설정
	init() {
		const _ = this;

		includeHTML(document.querySelector('#svg-container'), 'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/svg.html', cacheVersion);

		_.param = {
			video_id : undefined,
			channel_id : undefined
		};
		_.regist_lock = false;

		_.init_progress();

		// 닫기 버튼 클릭 이벤트
		document.querySelector('.wrap header .btn_close').addEventListener('click', e => {
			window.self.close();
		});
	}

	// 안내 화면 출력
	init_progress() {
		const _ = this;

		let tpl = `<section class="init_section">` +
		`<div class="message_area"><h1>유튜브 방송 등록 안내</h1><ul>${youtube_message}</ul></div>` +
		`<div class="btn_wrap"><button type="button" class="btn"><span>다음</span></button></div>` +
		`</section>`;
		$('.regist_container').html(tpl);

		// 다음 버튼 클릭 이벤트
		document.querySelector('.init_section .btn_wrap .btn').addEventListener('click', e => {
			_.setting_progress();
		});
	}

	// 입력 화면 출력
	setting_progress() {
		const _ = this;

		_.param.video_id = _.param.channel_id = undefined;

		let tpl = '<section class="setting_section">' +
		'<div class="message_area"><p>유튜브 방송 정보를 입력하십시오.</p></div>' +
		'<div class="input_area">' +
		'<div class="input_box"><label>영상 고유 ID : https://www.youtube.com/watch?v={영상 고유 ID}</label><input type="text" autocomplete="off" placeholder="영상 고유 ID" id="video_id"></div>' +
		'<div class="input_box"><label>채널 고유 ID : 채널 맞춤 설정 -> 채널 URL -> 끝에 있는 숫자와 문자 조합인 고유 채널 ID</label><input type="text" autocomplete="off" placeholder="채널 고유 ID" id="channel_id"></div>' +
		'</div>' +
		'<div class="btn_wrap"><button type="button" class="btn left"><span>이전</span></button><button type="button" class="btn right"><span>다음</span></button></div>' +
		'</section>';
		$('.regist_container').html(tpl);

		// 이전 버튼 클릭 이벤트
		document.querySelector('.setting_section .btn_wrap .btn.left').addEventListener('click', e => {
			_.init_progress();
		});

		// 다음 버튼 클릭 이벤트
		document.querySelector('.setting_section .btn_wrap .btn.right').addEventListener('click', e => {
			_.finish_progress();
		});
	}

	// 완료하기 화면 출력
	finish_progress() {
		const _ = this;

		let video_id = $('#video_id').val();
		if (!video_id) {
			ncuim_modal_show('영상 고유 ID가 설정되지 않았습니다.');
			return;
		}
		let channel_id = $('#channel_id').val();
		if (!channel_id) {
			ncuim_modal_show('채널 고유 ID가 설정되지 않았습니다.');
			return;
		}

		_.param.video_id = video_id;
		_.param.channel_id = channel_id;

		let tpl = `<section class="finish_section">` +
		`<div class="message_area"><p>정보를 확인 후 등록 버튼을 눌러주세요.</p></div>` +
		`<div class="finish_area">` +
		`<div class="txt">영상 고유 ID: <span>${_.param.video_id}</span></div>` +
		`<div class="txt">채널 고유 ID: <span>${_.param.channel_id}</span></div>` +
		`</div>` +
		`<div class="btn_wrap"><button type="button" class="btn left"><span>이전</span></button><button type="button" class="btn right"><span>등록</span></button></div>` +
		`</section>`;
		$('.regist_container').html(tpl);

		// 이전 버튼 클릭 이벤트
		document.querySelector('.finish_section .btn_wrap .btn.left').addEventListener('click', e => {
			_.setting_progress();
		});

		// 다음 버튼 클릭 이벤트
		document.querySelector('.finish_section .btn_wrap .btn.right').addEventListener('click', e => {
			_.regist();
		});
	}

	regist() {
		const _ = this;

		if (_.regist_lock) {
			return;
		}
	
		_.regist_lock = true;
		getDatasWithOption([{
			type: 'POST',
			url: '/define/youtubelivestreaming',
			dataType: 'json',
			contentType: 'application/json',
			Accept: 'application/json',
			data: _.param
		}], (data) => {
			switch (data) {
			case 1:
				ncuim_modal_show('정상적으로 처리되었습니다.');
				break;
			case 2:
				ncuim_modal_show('인게임에서 등록할 수 있습니다.');
				break;
			case 3:
				ncuim_modal_show('계정을 찾을 수 없습니다.');
				break;
			case 4:
				ncuim_modal_show('주 캐릭터를 찾을 수 없습니다.');
				break;
			case 5:
				ncuim_modal_show('인게임 내 캐릭터를 찾을 수 없습니다.');
				break;
			case 6:
				ncuim_modal_show('현재 해당 시스템은 사용할 수 없습니다.');
				break;
			case 7:
				ncuim_modal_show('파라미터가가 누락되었습니다.');
				break;
			case 8:
				ncuim_modal_show('영상 정보를 가져오는중에 오류가 발생하였습니다.');
				break;
			case 9:
				ncuim_modal_show('이미 등록된 영상입니다.');
				break;
			case 10:
				ncuim_modal_show('영상 데이터를 찾을 수 없습니다.');
				break;
			case 11:
				ncuim_modal_show('영상의 상세 데이터를 찾을 수 없습니다.');
				break;
			case 12:
				ncuim_modal_show('채널 고유 ID가 올바르지 않습니다.');
				break;
			case 13:
				ncuim_modal_show('해당 방송은 본 서버의 관련 방송이 아닙니다.');
				break;
			case 14:
				ncuim_modal_show('실시간 방송 데이터를 찾을 수 없습니다.');
				break;
			case 15:
				ncuim_modal_show('실시간 방송이 종료되지 않아 총 시간을 확인할 수 없습니다.');
				break;
			case 16:
				ncuim_modal_show('최소 방송시간이 충족되지 않았습니다.');
				break;
			case 17:
				ncuim_modal_show('등록에 실패하였습니다.');
				break;
			case 18:
				ncuim_modal_show('보상 아이템을 찾을 수 없습니다.');
				break;
			case 19:
				ncuim_modal_show('3일 이상 경과된 방송은 등록할 수 없습니다.');
				break;
			default:
				ncuim_modal_show('알 수 없는 이유로 실패하였습니다.');
				break;
			}
			_.regist_lock = false;// 해재
		}, (data) => {
			_.regist_lock = false;// 해재
		});
	}
}

YoutubeLiveStreaming.instance;