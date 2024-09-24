/*!
 * project : ncoin_utils
 * author : LINOFFICE
 * N코인 유틸
 */

var NCoinUtils = {

    // 널체크 및 공백 체크
    isEmptyOrNull : function(obj) {
        if (obj == null) return true;
        if (obj == undefined) return true;
        if (obj == 'undefined') return true;
        if (obj.length > 0) return false;
        if (obj.length === 0) return true;
        if (typeof obj !== "object") return true;

        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    },

    toNumber : function(psText) {
        var trnsNumber = {"만" : "0000", "천" : "000" , "백" : "00" , "십" : "0" };
        var vasText = psText.split("");
        var rtnValue = new Array(vasText);

        for ( var i = 0  ; i < vasText.length ; i++) {
            rtnValue.splice(i,1, vasText[i] in trnsNumber ? trnsNumber[vasText[i]] : vasText[i]);
        }
        return rtnValue.join("");
    },
    numberToKor : function(number) {
        var inputNumber  = number < 0 ? false : number;
        var unitWords    = ['','만'];
        var splitUnit    = 10000;
        var splitCount   = unitWords.length;
        var resultArray  = [];
        var resultString = '';

        for (var i = 0; i < splitCount; i++){
            var unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
            unitResult = Math.floor(unitResult);
            if (unitResult > 0){
                resultArray[i] = unitResult;
            }
        }

        for (var i = 0; i < resultArray.length; i++){
            if(!resultArray[i]) continue;
            resultString = String(resultArray[i]) + unitWords[i] + resultString;
        }

        return resultString;
    },

    formatCommas : function(psNum) {
        if (isNaN(psNum))
            return "";

        var vsNum = new String(psNum);
        var veFormat = /(^[+-]?\d+)(\d{3})/;

        while(veFormat.test(vsNum)){
            vsNum = vsNum.replace(veFormat, '$1' + ',' + '$2');
        }

        return vsNum;
    },

    removeCommas : function (val) {
        if (val != undefined) {
            return str = parseInt(val.replace(/[^\d]/g, ""));
        }
    },

    getChargeAmt : function() {
        var obj = 0;
        var chargeAmtObj = $('.charge-value .chargeAmt');
        var chargeAmt = chargeAmtObj.val();

        chargeAmt = chargeAmt.replace(/^0*|\s/g, '');
        if (chargeAmt == "") {
            obj = "";
        } else {
            obj = Number(NCoinUtils.removeCommas(chargeAmt));
        }
        return obj;
    },

    getCashAmountPrice : function() {
        var obj = 0;
        var cashAmtPriceObj = $('.static .wrapper .cash-amount .price');
        var cashAmtPrice = cashAmtPriceObj.text().trim();

        cashAmtPrice = cashAmtPrice.replace(/^0*|\s/g, '');
        if (cashAmtPrice == "") {
            obj = "";
        } else {
            obj = Number(NCoinUtils.removeCommas(cashAmtPrice));
        }
        return obj;
    }
};