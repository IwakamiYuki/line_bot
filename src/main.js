// LINE
var channel_id = ""; //LineBotの管理画面から取得
var channel_secret = ""; //LineBotの管理画面から取得
var mid = ""; //LineBotの管理画面から取得
var to = ''; // 自分のLINEのmid
// Googleカレンダー
var calendarId = ''; // 取得するカレンダーのID
// yahoo api
var yahooAppId = ''; // yahoo apiのapp_id
// docomo api
var docomoApiKey = ''; // docomo api key
// ぐるなびAPI
var gnaviApiKeyId = ''; // gnavi apiのkey_id
// それぞれの場所までの時間が記録されているスプレッドシート
var placeDataSpreadsheet = '';

var config;
/**
 * configを取得してセットする
 * (めんどくさいのでグローバル変数で)
 */
function setConfig() {
  config = getConfig();
  channel_id = config.lineChannelId;
  channel_secret = config.lineChannelSecretId;
  mid = config.lineMid;
  to = config.lineMyMid;
  calendarId = config.calendarId;
  yahooAppId = config.yahooAppId;
  docomoApiKey = config.docomoApiKey;
  gnaviApiKeyId = config.gnaviApiKeyId;
  placeDataSpreadsheet = config.placeDataSpreadsheet;
}


function doGet(e) {
  Logger.log(e);
  return ContentService.createTextOutput(UrlFetchApp.fetch("http://ip-api.com/json"));
}

function doPost(e) {
  setConfig();
  Logger.log(e);
  var json = JSON.parse(e.postData.contents);
  var text = json.result[0].content.text;
  var to = json.result[0].content.from;
  
  //return reply(json.result[0].content.from, json.result[0].content.from); // ①送信者のmidを返す
  //return reply(json.result[0].content.text, json.result[0].content.from); // ②オウム返しする
  
  var location = json.result[0].content.location;
  if (location) {
    gNaviData = getGnavi(location.latitude, location.longitude);
    text = "";
    for (i = 0; i < gNaviData.length; i++) {
      if (i > 5) break;
      text += gNaviData[i].name + "\n";
      text += gNaviData[i].url + "\n";
      text += gNaviData[i].pr.pr_short + "\n\n";
    }
    result = reply(text, to);
    poke = pokego(location.latitude, location.longitude);
    if (poke != "") {
      result = reply (poke,to);
    }
    return result;
  }
  if (text == 'mid') {
    return reply(to, to);
  }

  if ((text.match('？') || encodeURIComponent(text).match('%3F')) && text.length > 3) {
    text = search(text, to);
  } else {
    text = talk(text, to);
  }

  return reply(text, to);
}

/**
 * 指定したtoにtextを送信する
 */
function reply(text, to){
  var url = "https://trialbot-api.line.me/v1/events";
  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
    "X-Line-ChannelID" : channel_id,
    "X-Line-ChannelSecret" : channel_secret,
    "X-Line-Trusted-User-With-ACL" : mid
  };

  var postData = {
    "to" : [to],
    "toChannel" : 1383378250, //これは固定値
    "eventType" : "138311608800106203",  //これは固定値
    "content" : {
      "contentType" : 1,
      "toType" : 1,
      "text" : text
    }
  };

  var options = {
    "method" : "post",
    "headers" : headers,
    "payload" : JSON.stringify(postData)
  };

  return UrlFetchApp.fetch(url, options);  
}

var placeData = null;
/**
 * 場所と時間をセットしておく
 */
function getPlaceData() {
  if (placeData != null) return placeData;
  var id = placeDataSpreadsheet;
  var data = SpreadsheetApp.openById(id).getSheetByName('place').getDataRange().getValues();
  placeData = data;
  return data;
}


/**
 * カレンダーから取得して時間だったらreplyを呼ぶ
 */
function checkSchedule() {
  // 1時から9時までの間は何もしない
  if (1 <= new Date().getHours() && new Date().getHours() < 9) {
    return;
  }
  setConfig();
  var myCal=CalendarApp.getCalendarById(calendarId); //特定のIDのカレンダーを取得
 
  var startDate = new Date(); //取得開始日
  var endDate=new Date();
  startDate.setMinutes(startDate.getMinutes() + 0);
  endDate.setMinutes(startDate.getMinutes() + 60);
 
  var myEvents=myCal.getEvents(startDate,endDate); //カレンダーのイベントを取得
 
  for each(var evt in myEvents){
    var timeOffset = 1; // デフォルトだと1分前
    var placeDataList = getPlaceData();

    for each(var placeData in placeDataList) {
      if (evt.getDescription().indexOf(placeData[0]) >= 0) {
        timeOffset = placeData[1];
        break;
      }
    }
    timeOffset *= 1; // 念のため数値に変換

    var fromDate=new Date(); //取得開始日
    var toDate=new Date();
    fromDate.setMinutes(fromDate.getMinutes() + timeOffset);
    toDate.setMinutes(fromDate.getMinutes() + 1);
    if (fromDate <= evt.getStartTime() && evt.getStartTime() <= toDate) {  
      var text = '';
      text += '【あと約' + timeOffset +'分】';
      text += evt.getTitle() + '\n';
      
      text += getZeroDigit2(evt.getStartTime().getHours()) + ':' + getZeroDigit2(evt.getStartTime().getMinutes()) + ' ~ ';
      text += getZeroDigit2(evt.getEndTime().getHours()) + ':' + getZeroDigit2(evt.getEndTime().getMinutes()) + '';

      text += evt.getDescription();
        
      reply(text, to);
    }
  }
}

