/*!
 * project : editor
 * author : LINOFFICE
 * 서머노트 편집기
 */

let editor_singleton = null;
let editor_singletonEnforcer = 'singletonEnforcer';
class Editor {
	// 생성자
	constructor(enforcer) {
		if (enforcer !== editor_singletonEnforcer) throw 'Cannot--construct singleton';
	}

	// 싱글톤 인스턴스 생성
	static get instance() {
		if (!editor_singleton) editor_singleton = new Editor(editor_singletonEnforcer);
		return editor_singleton;
	}

	static get images() {
		return editor_singleton.images;
	}

	// 초기 설정
	init(is_insert, images) {
		const _ = this;
		
		_.is_insert = is_insert;

		_.images = !images ? [] : images;

		_.editor = $('#summernote');
		
		_.create_editor();
		_.create_emoticon();

		_.is_submit = false;

		_.addEvents();
	}

	// 에디터 생성
	create_editor() {
		const _ = this;

		_.editor.summernote({
			height :		500,	// set editor height
			minHeight :	null,	// set minimum height of editor
			maxHeight :	null,	// set maximum height of editor
			focus :		false,	// set focus to editable area after initializing summernote
			lang :		'ko-KR',	// default: 'en-US'
			placeholder :	'내용',	// placeholder name
			tabDisable :	true,
			toolbar : [
				['style', 
					[ 'style' ]
				],
				['fontstyle', 
					[ 'bold', 'underline', 'color' ]
				],
				['paragraph', 
					[ 'paragraph', 'height', 'ul', 'ol' ]
				],
				['insert', 
					[ 'link', 'table', 'picture', 'video' ]
				],
				['custom',
					[ 'emoticon' ]
				]
			],
			buttons : {
				emoticon : () => {
					const ui = $.summernote.ui;
					let button = ui.button({
						contents : '<i class="xi-emoticon-smiley-o">',
						tooltip : '이모티콘',
						click : function() {
							_.show_emoticon();
						}
					});
					return button.render();
				}	
			},
			callbacks : {
				onImageUpload : function(files, editor, welEditable) {
					_.image_upload(files);
				}
			}
		});
	}

	// 이모티콘 생성
	create_emoticon() {
		const _ = this;

		const emoticons = [
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_01.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_02.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_03.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_04.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_05.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_06.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_07.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_09.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_10.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_11.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_12.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_13.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char2_14.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_01.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_02.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_03.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_04.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_05.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_06.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_07.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_08.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_09.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_10.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_11.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_12.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char3_13.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_01.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_02.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_03.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_04.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_05.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_06.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_07.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_08.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_09.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_10.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_11.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_12.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_13.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_14.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_15.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_16.png',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_01.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_02.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_03.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_04.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_05.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_06.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_07.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_08.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_09.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_10.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_11.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_12.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_13.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_14.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_15.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/char9_v2_16.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_001_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_002_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_003_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_004_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_005_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_006_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_007_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_008_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_009_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_010_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_011_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_012_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_013_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_014_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_015_x3.gif',
			'https://cdn.jsdelivr.net/gh/bgserver002/bgsv@main/web/img/emoticon/emot_016_x3.gif'
		];

		let emoticon_val = emoticons.map( (item, i) => {
			return `<li class="emoticon-items"><img src="${item}" class="fe-emoticon" data-emoticon="true" alt=""></li>`;
		}).join('');
		$('.note-editor.note-frame.panel.panel-default').append(`<div id="emoticonLayer1" aria-hidden="false" tabindex="-1" role="dialog" aria-label="이모티콘" class="editor-layer-emoticon"><div class="editor-layer-header"><h2 class="editor-layer-title">이모티콘</h2><button type="button" class="fe-btn fe-btn-close"><i class="editor-icon-close"></i></button></div><div class="editor-layer-body"><div class="emoticon-wrap"><ul class="emoticon-list">${emoticon_val}</ul></div></div></div>`);

		_.emoticon_layer = $('#emoticonLayer1');

		// 이모티콘 선택 이벤트
		$('.emoticon-list .emoticon-items').on('click', function(e) {
			_.add_emoticon($(this));
		});

		// 이모티콘 박스 닫기 버튼 클릭 이벤트
		$('#emoticonLayer1 .fe-btn.fe-btn-close').on('click', function(e) {
			_.hide_emoticon();
		});

		// 영역밖 클릭 이벤트
		$('body').mouseup(function (e){
			if (!_.emoticon_layer.has(e.target).length) {
				_.hide_emoticon();
			}
			eventStop(e);
		});
	}

	// 이모티콘 목록 출력
	show_emoticon() {
		const _ = this;

		if (!_.emoticon_layer.hasClass('active')) {
			$('.dimmed').css('display', 'block');
			$('body').css('overflow', 'hidden');
			_.emoticon_layer.addClass('active');
		}
	}

	// 이모티콘 목록 감추기
	hide_emoticon() {
		const _ = this;

		if (_.emoticon_layer.hasClass('active')) {
			$('.dimmed').css('display', 'none');
			$('body').css('overflow', '');
			_.emoticon_layer.removeClass('active');
		}
	}

	// 이모티콘 추가
	add_emoticon(obj) {
		const _ = this;

		const target_src = $(obj).children('img').attr('src');
		_.editor.summernote('pasteHTML', `<img src="${target_src}" width="140" height="140" alt="">`);
		_.hide_emoticon();
	}

	// 이미지 업로드
	image_upload(files) {
		const _ = this;

		const limitSize = 1 * 1024 * 1024;// 1MB
		const dividPath = $('#dividPath').val();
		for (var i=0; i<files.length; i++) {
			if (files[i].size >= limitSize) {
				popupShow('이미지는 1MB이하로 등록하십시오.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
				return;
			} else {
				(function(i) {
					var formdata = new FormData();
					formdata.append('uploadFile', files[i]);
					formdata.append('dividPath', dividPath);
					getDatasWithOption([{
						type: 'POST',
						url: '/define/editor/upload',
						contentType: false,
						processData: false,
		 	        			cache: false,
						data: formdata
					}], (data) => {
						if (!data) {
							popupShow('이미지는 1MB이하로 등록하십시오.', '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
						} else {
							data = data.replaceAll('\\', '/');
							_.editor.summernote('editor.insertImage', data);
							_.images.push(data);
						}
					}, (data) => {
						console.log('fail upload');
					});
				})(i);
			}
		}
	}

	setSubmit() {
		// 저장, 수정이 정상적으로 완료
		this.is_submit = true;
	}

	addEvents() {
		const _ = this;

		// 브라우저 새로고침, 뒤로가기로 인한 더미 파일 제거
		window.addEventListener("beforeunload", function (e) {
			if (_.is_submit) {// 저장, 수정이 정상적으로 완료된 경우 컨트롤러에서 처리한다.
				return;
			}
			if (!_.images || _.images.length <= 0) {// 더미 이미지 존재 검증
				return;
			}
			const sendData = {
				'content' : $('#oriContent').val(),// 비교할 내용
				'images' : _.images,// 사용된 이미지 경로
				'is_insert' : _.is_insert
			};
			getDatasWithOption([{
				type: 'POST',
				url: '/define/editor/cancel',
				dataType: 'json',
				contentType: 'application/json',
				Accept: 'application/json',
				data: sendData,
				cache: false
			}], null, null);
		});
	}
}