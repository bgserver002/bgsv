/*!
 * project : websocket
 * author : LINOFFICE
 * 웹소켓
 */

let ws_handler;
class WebSocketHandler {
	ws = null;
	url = null;
	callback = null;
	reconnect_max_count = 10;
	constructor(_data, _callback) {
		if (!_data || !_data.is_enable || ws_handler || !_callback) {
			return false;
		}
		this.url = device === 'ingame' ? _data.ingame_url : _data.url;
		this.callback = _callback;
	}
	// 소켓 연결
	connect() {
		if (!this.url) {
			console.log('disable websocket');
			return;
		}
		if (this.is_open()) {
			console.log(`already open : state(${this.ws.readyState})`);
			return;
		}
		this.ws = new WebSocket(this.url);
		this.ws.onopen = (e) => {
			this.callback.on_open(e);
		};
		this.ws.onmessage = (e) => {
			this.callback.on_message(e);
		};
		this.ws.onclose = (e) => {
			this.callback.on_close(e);
			// 정상적인 종료가 아닌경우 재연결
			if (!e.wasClean) {
				this.reconnect();
			}
		};
		this.ws.onerror = (e) => {
			console.log(e);
		};
	}
	// 소켓 재연결
	reconnect() {
		if (--this.reconnect_max_count < 0) {
			return;
		}
		setTimeout(() => {
			this.connect();
		}, 1000);
	}
	// 소켓 종료
	close() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}
	// 소켓 접속중 검증
	is_connecting() {
		return this.ws && this.ws.readyState == WebSocket.CONNECTING;
	}
	// 소켓 활성화 검증
	is_open() {
		return this.ws && this.ws.readyState == WebSocket.OPEN;
	}
	// 소켓 종료중 검증
	is_closing() {
		return this.ws && this.ws.readyState == WebSocket.CLOSING;
	}
	// 소켓 종료 검증
	is_closed() {
		return this.ws && this.ws.readyState == WebSocket.CLOSED;
	}
	// 소켓에 데이터 송신
	send(type, data) {
		if (this.is_open()) {
			this.ws.send(type + JSON.stringify(data));
		}
	}
}
