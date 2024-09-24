/*!
 * project : util
 * author : LINOFFICE
 * 유틸 스크립트
 */

/**
 * html include
 * @param divContainer 반환된 html이 들어갈 컨테이너
 * @param urlHTML 포함시킬 html 경로
 */
function includeHTML(divContainer, urlHTML) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
    	if (this.readyState == 4) {
    		if (this.status == 200) {
    			divContainer.innerHTML = this.responseText;
    		}
    		if (this.status == 404) {
    			divContainer.innerHTML = "Page not found.";
    		}
    	}
    }
    xhttp.open("GET", urlHTML, true);
    xhttp.send();
}

/**
 * html include
 * @param divContainer 반환된 html이 들어갈 컨테이너
 * @param urlHTML 포함시킬 html 경로
 * @param version 버전
 */
function includeHTML(divContainer, urlHTML, version) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
    	if (this.readyState == 4) {
    		if (this.status == 200) {
    			divContainer.innerHTML = this.responseText;
    		}
    		if (this.status == 404) {
    			divContainer.innerHTML = "Page not found.";
    		}
    	}
    }
    xhttp.open("GET", `${urlHTML}?${version}`, true);
    xhttp.send();
}

/**
 * html include
 * @param divContainer 반환된 문서가 들어갈 컨테이너
 * @param urlHTML 포함시킬 문서 경로
 * @param version 버전
 * @param callback 콜백함수
 */
function includeHTML(divContainer, urlHTML, version, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
    	if (this.readyState == 4) {
    		if (this.status == 200) {
    			divContainer.innerHTML = this.responseText;
			if (callback) {
				callback();
			}
    		}
    		if (this.status == 404) {
    			divContainer.innerHTML = "Page not found.";
    		}
    	}
    }
    xhttp.open("GET", `${urlHTML}?${version}`, true);
    xhttp.send();
}

/**
 * script include
 * @param urlJs 포함시킬 스크립트 경로
 */
function includeJS(urlJs) {
	const element = document.createElement("script");
	element.src = urlJs;
	document.body.appendChild(element);
}

/**
 * script include
 * @param urlJs 포함시킬 스크립트 경로
 * @param version 버전
 */
function includeJS(urlJs, version) {
	const element = document.createElement("script");
	element.src = `${urlJs}?${version}`;
	document.body.appendChild(element);
}

/**
 * script include
 * @param urlJs 포함시킬 스크립트 경로
 * @param version 버전
 * @param callback 콜백함수
 */
function includeJS(urlJs, version, callback) {
	const element = document.createElement("script");
	element.src = `${urlJs}?${version}`;
	if (callback) {
		element.addEventListener('load', callback);
	}
	document.body.appendChild(element);
}

/**
 * rest api 호출 promise
 * @param urls 호출 경로 배열
 * @param resolvedCallback 성공 처리 콜백
 * @param rejectedCallback 실패 처리 콜백
 */
let getDatas = function (urls, resolvedCallback, rejectedCallback) {
	let promises = [];

	for (let i = 0, max = urls.length; i < max; i++) {
		const promise = $.ajax({
			type: 'GET',
			url: urls[i],
			dataType: 'json'
		});
		promises.push(promise);
	}

	$.when.apply($, promises)
		.then(resolvedCallback)
		.fail(rejectedCallback);
};

/**
 * rest api 호출 promise
 * @param jQueryAjaxOptions ajax옵션 배열
 * @param resolvedCallback 성공 처리 콜백
 * @param rejectedCallback 실패 처리 콜백
 */
let getDatasWithOption = function (jQueryAjaxOptions, resolvedCallback, rejectedCallback) {
	let promises = [];

	for (let i = 0, max = jQueryAjaxOptions.length; i < max; i++) {
		const promise = $.ajax(jQueryAjaxOptions[i]);
		promises.push(promise);
	}

	$.when.apply($, promises)
		.then(resolvedCallback)
		.fail(rejectedCallback);
};

const ua = window.navigator.userAgent;
const uaLow = ua.toLowerCase();

const locationOriginRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})/;
const mobileMatch = /iphone|ipod|ipad|android|blackberry|windows ce|nokia|webos|opera mini|sonyericsson|opera mobi|iemobile|aarch/;// 모바일 디바이스

const isMobile = (function () {
	return mobileMatch.test(uaLow);
}());

const isIngame = (function () {
	return uaLow.indexOf('nc ingame') !== -1;
}());

const isLauncher = (function () {
	return uaLow.indexOf('nc launcher') !== -1;
}());

const isWeb = (function () {
	return !isIngame && !isLauncher;
}());

const device = (function () {
	return isMobile ? 'mobile' : isIngame ? 'ingame' : isLauncher ? 'launcher' : 'pc';
}());

const isIE = (function () {
	return /msie/i.test(ua) || /trident/i.test(ua);
}());

let isEdge = (userAgent) => {
	return ( /Gecko/i.test(userAgent) && /Edge/i.test(userAgent) );
};

let isOpera = (userAgent) => {
	return ( /Opera/i.test(userAgent) || /OPR\//i.test(userAgent) );
};

let isChrome = (userAgent) => {
	return ( !isEdge(userAgent) && !isOpera(userAgent) && /Chrome/i.test(userAgent) );
};

let isIOS = (userAgent) => {
	return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
};

let isAndroid = (userAgent) => {
	return /android/i.test(userAgent);
};

let truthy = function truthy(object) {
	return !!object;
};

let falsy = function falsy(object) {
	return !!!object;
};

let existy = (obj) => {
	return obj != null;
};

let isDefined = (obj) => {
	let flag = true;
	if (obj === null || typeof obj === 'undefined') return false;
	return flag;
};

let isInteger = (obj) => {
	if (!isDefined(obj) || obj.constructor !== Number) return false;

	// https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
	return (isFinite(obj) && Math.floor(obj) === obj);
};

let isString = (obj) => {
	if (!isDefined(obj)) return false;
	return (obj.constructor === String);
};

let isNumber = function isNumber(obj) {
	if (!isDefined(obj)) return false;
	return (obj.constructor === Number);
};

let isBoolean = (obj) => {
	if (!isDefined(obj)) return false;
	return (obj.constructor === Boolean);
};

let isObject = (obj) => {
	if (!isDefined(obj)) return false;
	return (obj.constructor === Object);
};

let isFunction = (obj) => {
	if (!isDefined(obj)) return false;
	return (obj.constructor === Function);
};

let isRegExp = (obj) => {
	if (!isDefined(obj)) return false;
	return (obj.constructor === RegExp);
};

let not = (func) => {
	if (!isFunction(func)) throw new TypeError('func parameter type of not() must be Function.');

	return (object) => {
		return !func(object);
	};
};

let isNotDefined = not(isDefined);

let parseInt10 = (number) => {
	return parseInt(number, 10);
};

let parseStrIntToInt = (strIntOrInt) => {
	let val = strIntOrInt;

	if (!isDefined(val)) return 0;
	if (typeof(val) === 'number') return val;

	return parseInt10(val.split(',').join(''));
};

let removeElementInArray = function removeElementInArray(arr, target) {
	if (!Array.isArray(arr)) throw new TypeError('arr parameter type of removeElementInArray() must be Array.');

	var clonedArr = arr.slice(0),
	index = clonedArr.indexOf(target);

	if (index >= 0) clonedArr.splice(index, 1);

	return clonedArr;
};

let allOf = function allOf(/*args*/) {
	const args = Array.prototype.slice.call(arguments);

	return args.every(function (val) {
		return (val === true);
	});
};

let anyOf = function anyOf(/*args*/) {
	const args = Array.prototype.slice.call(arguments);

	return args.some(function (val) {
		return (val === true);
	});
};

let getDefined = function (val, defaultVal) {
	return (isDefined(val)) ? val : defaultVal;
};

let notSingleEle = not(($ele) => {
	return $ele.length === 1;
});

let each = (dataCanLoop, func, context) => {
	let _context = (existy(context)) ? context : null;

	if (!(Array.isArray(dataCanLoop) || isString(dataCanLoop))) throw new TypeError('dataCanLoop parameter type of each() must be Array or String.');

	let result = false;
	for (let i = 0, max = dataCanLoop.length; i < max; i++) {
		result = func.call(_context, dataCanLoop[i]);
		if (result === false) break;
	}
};

let getFileExtension = (fileName) => {
	if (!isString(fileName)) throw new TypeError('getFileExtension() requires String parameter.');

	if (fileName.length <= 0) return '';

	var lastDotIndex = fileName.lastIndexOf('.'),
	extension = fileName.substr(lastDotIndex + 1);

	return extension;
};

let getFirstObjectHasProperty = function (arrayHasObjects, propertyKey, findPropertyValueOrRegex) {
	if (!Array.isArray(arrayHasObjects) || arrayHasObjects.length <= 0) return null;
	if (!isString(propertyKey)) return null;

	let obj, result = null;
	for (let i = 0, max = arrayHasObjects.length; i < max; ++i) {
		obj = arrayHasObjects[i];
		if (!obj.hasOwnProperty(propertyKey)) continue;

		if (isRegExp(findPropertyValueOrRegex)) {
			if (findPropertyValueOrRegex.test(obj[propertyKey])) {
				result = obj;
				break;
			}
		} else {
			if (obj[propertyKey] === findPropertyValueOrRegex) {
				result = obj;
				break;
			}
		}
	}
	return result;
};

let getObjectHasProperty = function getObjectHasProperty(arrayHasObjects, propertyKey ) {
	if (!Array.isArray(arrayHasObjects) || arrayHasObjects.length <= 0) return null;
	if (!isString(propertyKey)) return null;
	let obj, result = null;

	each(arrayHasObjects, (obj) => {
		if(obj.hasOwnProperty(propertyKey)) result = obj[propertyKey];
	});
	//  console.log( '=> util.js getObjectHasProperty() result : ', propertyKey, result );
	return result;
};

let overlappedConditionSortByProperty = function sortByProp(_datas, _conditions, _conditionIndex) {
	let datas = Array.prototype.slice.call(_datas);

	if (!_conditions || _conditions.constructor !== Array || _conditions.length < 0) return datas;

	let conditionIndex = (_conditionIndex >= 0) ? _conditionIndex : 0,
	condition = _conditions[conditionIndex];

	if (conditionIndex <= 0) datas.sort(condition.func);

	if (_conditions.length <= 1) return datas;

	if (conditionIndex < _conditions.length - 1) {
		let prevProperty = condition.property,
		nextConditionIndex = conditionIndex + 1,
		nextCondition = _conditions[nextConditionIndex];

		let memoObj = {},
		memoArr = [],
		arr = [];

		let obj, prop;
		for (let i = 0, max = datas.length; i < max; i++) {
			obj = datas[i];
			prop = String(obj[prevProperty]);

			if (!memoObj[prop]) {
				memoObj[prop] = [];
				memoArr.push(memoObj[prop]);
			}

			arr = memoObj[prop];
			arr.push(obj);
		}

		for (let j = 0, len = memoArr.length; j < len; j++) {
			arr = memoArr[j];
			arr.sort(nextCondition.func);

			memoArr[j] = overlappedConditionSortByProperty(arr, _conditions, nextConditionIndex);
		}

		let resultArr = memoArr.reduce((acc, curVal, curIndex, array) => acc.concat(curVal));

		return resultArr;
	}

	return datas;
}

let getPositionFromTranslateStr = (str) => {
	let obj = {x: 0, y: 0};
	if (!isDefined(str)) return obj;

	let values = str.match(/[+-]?(\d*\.)?\d+/g);
	if (values.length <= 0) return obj;

	if (/translateX/g.test(str)) {
		obj.x = parseFloat(values[0]);
		return obj;
	}

	if (/translateY/g.test(str)) {
		obj.y = parseFloat(values[0]);
		return obj;
	}

	obj.x = parseFloat(values[0]);
	if (values.length > 1) obj.y = parseFloat(values[1]);

	return obj;
};

let isIndexInLoop = function isIndexInLoop(totalLength, loopGap, firstIndex, searchIndex) {
	const args = Array.prototype.slice.call(arguments);
	if (args.length < 4) throw Error('isIndexInLoop function requires 4 arguments.');

	if (!isInteger(totalLength) || !isInteger(loopGap) || !isInteger(firstIndex) || !isInteger(searchIndex)) {
		throw Error('arguments must be Integer Number.');
	}
	if (totalLength < 1 || firstIndex < 1) {
		throw Error('totalLength and startIndex can not smaller than 1.');
	}
	if (loopGap > totalLength) {
		throw Error('loopGap can not bigger than totalLength.');
	}

	let index = firstIndex;
	for (let i = 0; i < loopGap; i++) {
		if (index === searchIndex) return true;
		index = (index + 1 > totalLength) ? 1 : index + 1;
	}

	return false;
};

let getLoopedLastIndex = function getLoopedLastIndex(totalLength, loopGap, firstIndex) {
	const args = Array.prototype.slice.call(arguments);
	if (args.length < 3) throw Error('getLoopedLastIndex function requires 3 arguments.');

	if (!isInteger(totalLength) || !isInteger(loopGap) || !isInteger(firstIndex)) {
		throw Error('arguments must be Integer Number.');
	}
	if (totalLength < 1 || firstIndex < 1) {
		throw Error('totalLength and firstIndex can not smaller than 1.');
	}
	if (loopGap > totalLength || firstIndex > totalLength) {
		throw Error('loopGap and firstIndex can not bigger than totalLength.');
	}

	let index = firstIndex;
	for (let i = 0; i < loopGap - 1; i++) {
		index++;
		if (index > totalLength) index = 1;
	}
	return index;
};

let getReverseLoopedFirstIndex = function getReverseLoopedFirstIndex(totalLength, loopGap, lastIndex) {
	const args = Array.prototype.slice.call(arguments);
	if (args.length < 3) throw Error('getReverseLoopedFirstIndex function requires 3 arguments.');

	if (!isInteger(totalLength) || !isInteger(loopGap) || !isInteger(lastIndex)) {
		throw Error('arguments must be Integer Number.');
	}
	if (totalLength < 1 || lastIndex < 1) {
		throw Error('totalLength and lastIndex can not smaller than 1.');
	}
	if (loopGap > totalLength || lastIndex > totalLength) {
		throw Error('loopGap and lastIndex can not bigger than totalLength.');
	}

	let index = lastIndex;
	for (let i = 0; i < loopGap - 1; i++) {
		index = (index - 1 < 1) ? totalLength : index - 1;
	}

	return index;
};

let getResolution = (breakpoint = {tablet: 640, pc: 960, max: 1260}, global = window) => {
	let resolution = '';
	if (breakpoint.max && global.innerWidth >= breakpoint.max) {
		resolution = 'max';

	} else if (breakpoint.pc && global.innerWidth >= breakpoint.pc) {
		resolution = 'pc';

	} else if (breakpoint.tablet && global.innerWidth >= breakpoint.tablet) {
		resolution = 'tablet';

	} else {
		resolution = 'phone';
	}

	return resolution;
};

let isPhoneResolution = (resolution) => {
	return resolution === 'phone';
};

let isTabletResolution = (resolution) => {
	return resolution === 'tablet';
};

let isMobileResolution = (resolution) => {
	return ( resolution === 'phone' || resolution === 'tablet');
};

let numberWithCommas = (number) => {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

let getUriParams = (uri) => {
	if (uri.length < 1) return null;
	let str = uri.split('#')[0];

	let tmpArr = str.split('?');
	if (tmpArr.length < 2) return null;

	let paramStr = tmpArr[1],
	params = paramStr.split('&');

	let keyValueArr, obj = {};
	for (let i = 0, max = params.length; i < max; ++i) {
		keyValueArr = params[i].split('=');
		if (keyValueArr.length > 1) obj[keyValueArr[0]] = keyValueArr[1];

		// if (keyValueArr.length <= 1) return null;
		// obj[keyValueArr[0]] = keyValueArr[1];
	}
	return obj;
};

let getUriCombinedParams = (uri, params) => {
	if (!uri) return '';
	if (!params) return uri;

	let str = '';
	for (let key in params) {
		str += '&' + key + '=' + String(params[key]);
	}
	if (str === '') return uri;

	var tmpArr = uri.split('#'),
	uri = tmpArr[0],
	hashStr = (isDefined(tmpArr[1])) ? '#' + tmpArr[1] : '';

	uri = ((uri.indexOf('?') >= 0) ? (uri + str) : (uri + '?' + str.substr(1))) + hashStr;
	return uri;
};

let getHashParams = (hashStr) => {
	let str = hashStr;
	if (str.length < 1) return null;

	let tmpArr = str.split('#');
	if (tmpArr.length < 2) return null;

	let paramStr = tmpArr[1],
	params = paramStr.split('&');

	let keyValueArr, obj = {};
	for (let i = 0, max = params.length; i < max; ++i) {
		keyValueArr = params[i].split('=');
		if (keyValueArr.length <= 1) return null;

		obj[keyValueArr[0]] = keyValueArr[1];
	}

	return obj;
};

let getHashCombinedParams = (uri, params) => {
	if (!params) return uri;

	let str = '';
	for (let key in params) {
		str += '&' + key + '=' + String(params[key]);
	}
	if (str === '') return uri;

	uri = (uri.indexOf('#') >= 0) ? (uri + str) : (uri + '#' + str.substr(1));
	return uri;
};

let getObjForPagination = function (totalPostNum, displayPostNumPerPage, displayPaginationBtnNum, pageIndex) {
	const args = Array.prototype.slice.call(arguments);

	if (args.length < 4) throw new Error('getObjForPagination() requires 4 parameters.');

	if (!isInteger(totalPostNum) || !isInteger(displayPostNumPerPage) || !isInteger(displayPaginationBtnNum) || !isInteger(pageIndex)) {
		throw new TypeError('getObjForPagination() requires Integer Number parameters.');
	}
	if (totalPostNum <= 0 || displayPostNumPerPage <= 0 || displayPaginationBtnNum <= 0 || pageIndex <= 0) {
		throw new TypeError('getObjForPagination() requires positive Integer Number parameters.');
	}

	let totalPageNum = Math.ceil(totalPostNum / displayPostNumPerPage);
	if (pageIndex < 1) pageIndex = 1;
	if (pageIndex > totalPageNum) pageIndex = totalPageNum;

	let paginationBtnGroupIndex = Math.floor((pageIndex - 1) / displayPaginationBtnNum),
	prevPageIndex = paginationBtnGroupIndex * displayPaginationBtnNum,
	firstPageIndex = (paginationBtnGroupIndex * displayPaginationBtnNum) + 1,
	lastPageIndex = firstPageIndex + displayPaginationBtnNum - 1,
	nextPageIndex = lastPageIndex + 1;

	if (lastPageIndex > totalPageNum) lastPageIndex = totalPageNum;
	if (nextPageIndex > totalPageNum) nextPageIndex = 0;

	return {
		totalPostNum: totalPostNum,
		displayPostNumPerPage: displayPostNumPerPage,
		displayPaginationBtnNum: displayPaginationBtnNum,
		pageIndex: pageIndex,

		totalPageNum: totalPageNum,
		prevPageIndex: prevPageIndex,
		firstPageIndex: firstPageIndex,
		lastPageIndex: lastPageIndex,
		nextPageIndex: nextPageIndex
	};
};

let getDivideIntStrByThousandUnit = (intStr_) => {
	if (not(isDefined)(intStr_)) return ['0'];

	const DIVIDE_UNIT = 4;

	let intStr = String(parseStrIntToInt(intStr_)),
	intStrs = [];

	if (intStr.length <= DIVIDE_UNIT) return [String(intStr)];

	let lastIndex = 0, unitStr = '';
	while (intStr.length > DIVIDE_UNIT) {
		lastIndex = intStr.length;
		unitStr = intStr.substr(lastIndex - DIVIDE_UNIT, lastIndex);

		intStr = intStr.substr(0, lastIndex - DIVIDE_UNIT);
		intStrs.unshift(unitStr);
	}
	intStrs.unshift(intStr);

	return intStrs;
};

let getMarketPriceStr = (str) => {
	const UNIT_PRICE = ['', '만', '억'];

	let val = ( isDefined(str) ) ? str : '0',
	unitValues = getDivideIntStrByThousandUnit(val);

	unitValues.reverse();

	let priceStr = '', unitVal = 0;
	for (let i = 0, max = unitValues.length; i < max; i++) {
		unitVal = parseInt10(unitValues[i]);
		if (unitVal <= 0) continue;

		priceStr = (numberWithCommas(unitVal) + UNIT_PRICE[i]) + priceStr;
		if (i !== unitValues.length) priceStr = ' ' + priceStr;
	}
	priceStr = priceStr.trim();

	if (!priceStr) return '0';
	return priceStr;
};

let getEmphasizedStrByQuery = (str, query) => {
	return (str || '').split(query).join(`<strong>${query}</strong>`);
};

let getSeparatedDateStr = (moment, dateStr, DAYS = {
	'Sunday': '일',
	'Monday': '월',
	'Tuesday': '화',
	'Wednesday': '수',
	'Thursday': '목',
	'Friday': '금',
	'Saturday': '토'
}) => {
	let val = '';

	const MIN_TO_SEC = 60,
	HOUR_TO_SEC = 3600,
	DAY_TO_SEC = 86400;

	const now = new Date(),
	past = new Date(dateStr),
	diffSeconds = Math.floor((now - past) / 1000);

	if (diffSeconds < DAY_TO_SEC) {
		if (diffSeconds < HOUR_TO_SEC) {
			if (diffSeconds < MIN_TO_SEC) {
				val = `${diffSeconds}초 전`;

			} else {
				const diffMinutes = Math.floor(diffSeconds / MIN_TO_SEC);
				val = `${diffMinutes}분 전`;
			}

		} else {
			const diffHours = Math.floor(diffSeconds / HOUR_TO_SEC);
			val = `${diffHours}시간 전`;
		}

	} else {
		const date = moment(dateStr),
		day = (DAYS[date.format('dddd')] || '');

		val = date.format(`YYYY-MM-DD`);
		// val = date.format(`YYYY.MM.DD. (${day})`);
	}

	return val;
};

let namespace = (namespace, parent) => {
	if (!isString(namespace)) throw new TypeError('namespace parameter type of namespace() must be String.');
	if (!(isObject(parent) || !isDefined(parent))) throw new TypeError('parent parameter type of namespace() must be Object or null or undefined.');

	let ns = parent || window;

	if (namespace) {
		let parts = namespace.split('.');

		for (let i = 0, max = parts.length; i < max; i++) {
			if (!ns[parts[i]]) ns[parts[i]] = {};
			ns = ns[parts[i]];
		}
	}

	return ns;
};

let template = function template(strings, ...keys) {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
	return (function (...values) {
		let dict = values[values.length - 1] || {};

		let result = [strings[0]];
		keys.forEach(function (key, i) {
			let value = Number.isInteger(key) ? values[key] : dict[key];
			result.push(value, strings[i + 1]);
		});

		return result.join('');
	});
};

/**
 * 숫자 컴마 추가
 * @param amt
 */
function commaAdd(amt) {
	let str = String(amt);
	return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

/**
 * 숫자 컴마 추가
 * @param psNum
 */
function formatCommas(psNum) {
	if (isNaN(psNum))
		return "";

	var vsNum = new String(psNum);
	var veFormat = /(^[+-]?\d+)(\d{3})/;

	while(veFormat.test(vsNum)){
		vsNum = vsNum.replace(veFormat, '$1' + ',' + '$2');
	}

	return vsNum;
}

/**
 * 숫자 컴마 제거
 * @param amt
 */
function commaRemove(amt) {
	let str	= String(amt);
	return str.replace(/[^\d]+/g, '');
}

/**
 * 컴마 제거
 * @param val
 */
function removeCommas(val) {
	if (val != undefined) {
		return str = parseInt(val.replace(/[^\d]/g, ""));
	}
}

/**
 * 숫자 입력값 포맷
 * @param obj
 */
function inputNumberFormat(obj) {
	obj.value=commaAdd(commaRemove(obj.value));
}

/**
 * 인풋 문자열 숫자 조사
 * @param input
 */
function getAmt(input_val) {
	var obj = 0;
	var amt = input_val;

	amt = amt.replace(/^0*|\s/g, '');
	if (amt == "") {
		obj = "";
	} else {
		obj = Number(removeCommas(amt));
	}
	return obj;
}

function setNumberToComma(amt, input) {
	var amtComma = formatCommas(amt);
	$(input).val(amtComma);
}

/**
 * 인풋 입력값 콤마 변환
 * @param input
 */
function setInputToComma(input) {
	// 자유충전 금액 입력 키다운시
	input.on("keydown",function(e){
		if ((e.keyCode == 17 ) || (e.keyCode == 18)) {
			return false;
		}
		if (!((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode == 8 || e.keyCode ==9)) {
			return false;
		}
		amt = getAmt(input.val());
		setNumberToComma(amt, input)
	});

	// 금액 유저가 직접 입력시 처리 방안.
	input.on("keyup",function(){
		var amt = getAmt(input.val());
		setNumberToComma(amt, input)
	});

	// 포커스 아웃
	input.on("blur",function(){
		if ($(this).val()=='') {
			return false;
		}
		var amt = getAmt(input.val());
		setNumberToComma(amt, input)
	});
}


/**
 * 하이픈 자동 입력
 * @param oTa
 */
function OnCheckPhone(oTa){
    var oForm		= oTa.form;
    var sMsg		= oTa.value;
    var onlynum		= ""; 
    var imsi		= 0;
    onlynum		= RemoveDash2(sMsg);
    onlynum		= checkDigit(onlynum);
    var retValue	= ""; 
    if (event.keyCode != 12) {
        if (onlynum.substring(0,2) == '02') {
        	if (GetMsgLen(onlynum) <= 1) { oTa.value = onlynum; }
        	if (GetMsgLen(onlynum) == 2) { oTa.value = onlynum + "-"; }
        	if (GetMsgLen(onlynum) == 4) { oTa.value = onlynum.substring(0,2) + "-" + onlynum.substring(2,3); }
        	if (GetMsgLen(onlynum) == 4) { oTa.value = onlynum.substring(0,2) + "-" + onlynum.substring(2,4); }
        	if (GetMsgLen(onlynum) == 5) { oTa.value = onlynum.substring(0,2) + "-" + onlynum.substring(2,5); }
        	if (GetMsgLen(onlynum) == 6) { oTa.value = onlynum.substring(0,2) + "-" + onlynum.substring(2,6); }
        	if (GetMsgLen(onlynum) == 7) { oTa.value = onlynum.substring(0,2) + "-" + onlynum.substring(2,5) + "-" + onlynum.substring(5,7); }
        	if (GetMsgLen(onlynum) == 8) { oTa.value = onlynum.substring(0,2) + "-" + onlynum.substring(2,6) + "-" + onlynum.substring(6,8); }
        	if (GetMsgLen(onlynum) == 9) { oTa.value = onlynum.substring(0,2) + "-" + onlynum.substring(2,5) + "-" + onlynum.substring(5,9); }
        	if (GetMsgLen(onlynum) == 10) { oTa.value = onlynum.substring(0,2) + "-" + onlynum.substring(2,6) + "-" + onlynum.substring(6,10); }
        	if (GetMsgLen(onlynum) == 11) { oTa.value = onlynum.substring(0,2) + "-" + onlynum.substring(2,6) + "-" + onlynum.substring(6,10); }
        	if (GetMsgLen(onlynum) == 12) { oTa.value = onlynum.substring(0,2) + "-" + onlynum.substring(2,6) + "-" + onlynum.substring(6,10); }
        }
        if (onlynum.substring(0,2) == '05') {
        	if (onlynum.substring(2,3) == '0') {
            	if (GetMsgLen(onlynum) <= 3) { oTa.value = onlynum; }
            	if (GetMsgLen(onlynum) == 4) { oTa.value = onlynum + "-"; }
            	if (GetMsgLen(onlynum) == 5) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,5); }
            	if (GetMsgLen(onlynum) == 6) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,6); }
            	if (GetMsgLen(onlynum) == 7) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,7); }
            	if (GetMsgLen(onlynum) == 8) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,8); }
            	if (GetMsgLen(onlynum) == 9) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,7) + "-" + onlynum.substring(7,9); }
            	if (GetMsgLen(onlynum) == 10) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,8) + "-" + onlynum.substring(8,10); }
            	if (GetMsgLen(onlynum) == 11) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,7) + "-" + onlynum.substring(7,11); }
            	if (GetMsgLen(onlynum) == 12) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,8) + "-" + onlynum.substring(8,12); }
            	if (GetMsgLen(onlynum) == 13) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,8) + "-" + onlynum.substring(8,12); }
            } else {
            	if (GetMsgLen(onlynum) <= 2) { oTa.value = onlynum; }
                if (GetMsgLen(onlynum) == 3) { oTa.value = onlynum + "-"; }
                if (GetMsgLen(onlynum) == 4) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,4); }
                if (GetMsgLen(onlynum) == 5) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,5); }
                if (GetMsgLen(onlynum) == 6) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,6); }
                if (GetMsgLen(onlynum) == 7) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7); }
                if (GetMsgLen(onlynum) == 8) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,6) + "-" + onlynum.substring(6,8); }
                if (GetMsgLen(onlynum) == 9) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7) + "-" + onlynum.substring(7,9); }
                if (GetMsgLen(onlynum) == 10) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,6) + "-" + onlynum.substring(6,10); }
                if (GetMsgLen(onlynum) == 11) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7) + "-" + onlynum.substring(7,11); }
                if (GetMsgLen(onlynum) == 12) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7) + "-" + onlynum.substring(7,11); }
            }
        }

        if (onlynum.substring(0,2) == '03' || onlynum.substring(0,2) == '04' || onlynum.substring(0,2) == '06' || onlynum.substring(0,2) == '07' || onlynum.substring(0,2) == '08') {
        	if (GetMsgLen(onlynum) <= 2) { oTa.value = onlynum; }
        	if (GetMsgLen(onlynum) == 3) { oTa.value = onlynum + "-"; }
        	if (GetMsgLen(onlynum) == 4) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,4); }
        	if (GetMsgLen(onlynum) == 5) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,5); }
        	if (GetMsgLen(onlynum) == 6) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,6); }
        	if (GetMsgLen(onlynum) == 7) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7); }
        	if (GetMsgLen(onlynum) == 8) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,6) + "-" + onlynum.substring(6,8); }
        	if (GetMsgLen(onlynum) == 9) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7) + "-" + onlynum.substring(7,9); }
        	if (GetMsgLen(onlynum) == 10) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,6) + "-" + onlynum.substring(6,10); }
        	if (GetMsgLen(onlynum) == 11) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7) + "-" + onlynum.substring(7,11); }
        	if (GetMsgLen(onlynum) == 12) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7) + "-" + onlynum.substring(7,11); }
        }
        if (onlynum.substring(0,2) == '01') {
            if (GetMsgLen(onlynum) <= 2) { oTa.value = onlynum; }
            if (GetMsgLen(onlynum) == 3) { oTa.value = onlynum + "-"; }
            if (GetMsgLen(onlynum) == 4) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,4); }
            if (GetMsgLen(onlynum) == 5) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,5); }
            if (GetMsgLen(onlynum) == 6) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,6); }
            if (GetMsgLen(onlynum) == 7) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7); }
            if (GetMsgLen(onlynum) == 8) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7) + "-" + onlynum.substring(7,8); }
            if (GetMsgLen(onlynum) == 9) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7) + "-" + onlynum.substring(7,9); }
            if (GetMsgLen(onlynum) == 10) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,6) + "-" + onlynum.substring(6,10); }
            if (GetMsgLen(onlynum) == 11) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7) + "-" + onlynum.substring(7,11); }
            if (GetMsgLen(onlynum) == 12) { oTa.value = onlynum.substring(0,3) + "-" + onlynum.substring(3,7) + "-" + onlynum.substring(7,11); }
        }
        if (onlynum.substring(0,1) == '1') {
            if (GetMsgLen(onlynum) <= 3) { oTa.value = onlynum; }
            if (GetMsgLen(onlynum) == 4) { oTa.value = onlynum + "-"; }
            if (GetMsgLen(onlynum) == 5) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,5); }
            if (GetMsgLen(onlynum) == 6) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,6); }
            if (GetMsgLen(onlynum) == 7) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,7); }
            if (GetMsgLen(onlynum) == 8) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,8); }
            if (GetMsgLen(onlynum) == 9) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,8); }
            if (GetMsgLen(onlynum) == 10) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,8); }
            if (GetMsgLen(onlynum) == 11) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,8); }
            if (GetMsgLen(onlynum) == 12) { oTa.value = onlynum.substring(0,4) + "-" + onlynum.substring(4,8); }
        }
    }
}
function RemoveDash2(sNo) {
	let reNo = "";
	for (var i=0; i<sNo.length; i++) {
		if (sNo.charAt(i) != "-") { 
			reNo += sNo.charAt(i);
		}
	}
	return reNo;
}
function GetMsgLen(sMsg) { // 0-127 1byte, 128~ 2byte
	let count = 0;
	for (var i=0; i<sMsg.length; i++) {
		if (sMsg.charCodeAt(i) > 127) { count += 2; }
		else { count++; }
	}
	return count;
}

/**
 * 숫자외 제거
 * @param num
 */
function checkDigit(num) { 
    var Digit	= "1234567890",
    	string	= num,
    	len		= string.length,
    	retVal	= "";
    for (i=0; i<len; i++) {
        if (Digit.indexOf(string.substring(i, i+1))>=0) {
	retVal=retVal+string.substring(i, i+1);
	}
    }
    return retVal;
}

/**
 * 인풋 입력값 숫자 체크
 * @param obj
 */
function inputNumberAll(obj){
	let inpurNumber		= obj.value;// 입력 숫자
	let changeNumber	= checkDigit(inpurNumber);// 숫자체크
	obj.value			= changeNumber;// 재입력
}

/**
 * 인풋 입력값 숫자 체크(0 허용안함)
 * @param obj
 */
function inputNumber(obj){
	let inpurNumber		= obj.value;// 입력 숫자
	let changeNumber	= checkDigit(inpurNumber);// 숫자체크
	if (changeNumber == 0) { changeNumber = ""; }// 0이 되면 공백처리
	obj.value			= changeNumber;// 재입력
}

/**
 * 인풋 입력값 숫자 체크
 * @param obj
 */
function inputCheckNumber(obj){
	let inpurNumber		= obj.value;// 입력 숫자
	let changeNumber	= checkDigit(commaRemove(inpurNumber));// 컴마 제거후 숫자체크후 컴마추가
	changeNumber		= commaAdd(Number(changeNumber));
	if (changeNumber == 0) { changeNumber = ""; }// 0이 되면 공백처리
	obj.value			= changeNumber;// 재입력
}

/**
 * 이메일 정규식 검증
 * @param email
 */
function is_email_check(email) {
	var reg = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
	return reg.test(email);
}

/**
 * 이벤트 전달 중단
 * @param event
 */
function eventStop(event){
	event.preventDefault();				//현재 이벤트의 기본 동작을 중단
	event.stopPropagation();			//현재 이벤트가 상위로 전파되지 않도록 중단
	event.stopImmediatePropagation();	//현재 이벤트가 상위뿐 아니라 현재 레벨에 걸린 다른 이벤트도 동작 중단
}

/**
 * 바이트 문자 입력가능 문자수 체크
 * 
 * @param id : tag id 
 * @param title : tag title
 * @param mb : 최대 입력가능 수 (MB)
 * @returns {Boolean}
 */
function maxByteCheck(str, mb){
	if (Number(byteCheck(str)) > Number(mb) * 1024 * 1024) {
		popupShow(`최대 용량을 초과 하였습니다.(최대 용량 : ${mb}MB)`, '<span class="type2"><a href="javascript:popupClose();" class="close">닫기</a></span>', null);
		return false;
	} else {
		return true;
	}
}
 
/**
 * 바이트수 반환  
 * 
 * @param el : tag jquery object
 * @returns {Number}
 */
function byteCheck(str){
    let codeByte = 0;
    for (var idx = 0; idx < str.length; idx++) {
    	var oneChar = escape(str.charAt(idx));
    	if (oneChar.length == 1) {
		codeByte++;
    	} else if (oneChar.indexOf("%u") != -1) {
		codeByte += 2;
    	} else if (oneChar.indexOf("%") != -1) {
		codeByte++;
	}
    }
    return codeByte;
}

/**
 * contextPath
 * 
 * @returns path
 */
function getContextPath(){
	var hostIndex = location.href.indexOf(location.host) + location.host.length;
	return location.href.substring(hostIndex, location.href.indexOf('/', hostIndex + 1));
}

/**
 * %d전 데이트타입 포멧
 * 
 * @param dt
 * @returns format str
 */
function getNowDayTimeToFormat(dt) {
	var min		= 60000;
	var c		= new Date();// 현재 시간
	var d		= new Date(dt);// 체크할 시간
	var minsAgo	= Math.floor((c - d) / (min));
	if (minsAgo == 0) {
		return `방금 전`;
	}
	if (minsAgo < 60) {
		return `${minsAgo}분 전`;// 1시간 내
	}
	if (minsAgo < 1440) {
		return `${Math.floor(minsAgo / 60)}시간 전`;// 하루 내
	}
	return moment(new Date(dt)).format('YYYY-MM-DD');
};

/** 쿠키를 조회한다.
 *
 * @param name 쿠키 이름
 * @returns cookie value
 */
function getCookie(name) {
  var x, y;
  var val = document.cookie.split(';');

  for (var i = 0; i < val.length; i++) {
    x = val[i].substr(0, val[i].indexOf('='));
    y = val[i].substr(val[i].indexOf('=') + 1);
    x = x.replace(/^\s+|\s+$/g, ''); // 앞과 뒤의 공백 제거하기
    if (x == name) {
      return unescape(y); // unescape로 디코딩 후 값 리턴
    }
  }
}

/** 쿠키를 설정한다.
 *
 * @param name 쿠키 이름
 * @param value 쿠키 값
 * @param max_age null 을 입력하면 일시적인 쿠키를 생성한다. 0 보다 큰 값을 입력하면 쿠키 지속 시간을 포함한 쿠키를 생성한다. 0 을 입력하면 쿠키를 삭제한다.
 * @same_site 쿠키 보안
 */
function SetCookie( name, value, max_age, same_site )
{
	var strCookie = `${name}=${encodeURIComponent(value)}`;
	if( typeof max_age === "number" )
	{
		strCookie += `; max-age=${max_age}`;
	}
	if ( typeof same_site === 'string')
	{
		strCookie += `; SameSite=${same_site}`;
	}

	// QQQ: path, domain 유효범위를 설정하고 싶으면 여기서 strCookie 변수에 추가해 주어야 한다.
	document.cookie = strCookie;
}

/** 쿠키를 가져온다.
 *
 * @param name 쿠키 이름
 */
function GetCookie( name ) {
	var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	return value? value[2] : null;
}

/** 쿠키를 삭제한다.
 *
 * @param name 쿠키 이름
 */
function DelCookie( name ) {
	document.cookie = `${name}=; expires=Thu, 01 Jan 1999 00:00:10 GMT;`;
}
