/**
 * 指定したアカウントのプロフィール情報を取得する
 */
function getLineProfile(mid) {
  var url = "https://trialbot-api.line.me/v1/profiles?mids=" + mid;
  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
    "X-Line-ChannelID" : channel_id,
    "X-Line-ChannelSecret" : channel_secret,
    "X-Line-Trusted-User-With-ACL" : mid
  };

  var postData = {
    "mids" : mid,
  };

  var options = {
    "method" : "get",
    "headers" : headers,
  };

  response = UrlFetchApp.fetch(url, options);  
  data = JSON.parse(response.getContentText("UTF-8"));
  return data;
}

/**
 * docomoの雑談対話APIを使って返信をする
 */
function talk(text, to) {
  data = getLineProfile(to);
  name = data.contacts[0].displayName;
  
  var url = "https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue?APIKEY=" + docomoApiKey;
  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
  };
  
  var postData =   {
    "utt": text,
    "context": "10001",
    "nickname":name,
    "nickname_y":name,
    "sex": "女",
    "bloodtype": "B",
    "birthdateY": "1997",
    "birthdateM": "5",
    "birthdateD": "30",
    "age": "16",
    "constellations": "双子座",
    "place": "東京",
    "mode": "dialog"
  };

  var options = {
    "method" : "post",
    "headers" : headers,
    "payload" : JSON.stringify(postData),
    "muteHttpExceptions":true
  };

  response = UrlFetchApp.fetch(url, options);  
  data = JSON.parse(response.getContentText("UTF-8"));

  return data.yomi;
}

/**
 * docomoの知識Q&Aを使用して結果を返す
 */
function search(text, to) {  
  var url = "https://api.apigw.smt.docomo.ne.jp/knowledgeQA/v1/ask?APIKEY=" + docomoApiKey + "&q="+encodeURIComponent(text);
  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
  };

  var options = {
    "headers" : headers
  };

  response = UrlFetchApp.fetch(url, options);  
  data = JSON.parse(response.getContentText("UTF-8"));
  result = data.message.textForDisplay
  Logger.log(data);

  if (result.match('わかりませんでした。')) {
    result = keyword(text, to);
  } else {
    if (result.match('インターネットで調べたところ、一位は、')) {
      result = result.replace( /インターネットで調べたところ、一位は、/g , "" ) ;
    }
    if (result.match('インターネットで調べたところ、')) {
      result = result.replace( /インターネットで調べたところ、/g , "" ) ;
    }
    
    if (data.answers.length > 0 && data.answers[0].answerText) {
      if (data.answers[0].answerText.match('http')) {
        result += '\n' + data.answers[0].answerText;
      } else {
        result = data.answers[0].answerText + 'です';
      }
    }
  }

  return result;
}

/**
 * yahooのテキスト解析APIのキーフレーズ抽出を行う
 */
function keyword(text, to) {
  var url = "http://jlp.yahooapis.jp/KeyphraseService/V1/extract?appid=" + yahooAppId + "&output=json&sentence="+encodeURIComponent(text);
  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
  };

  var options = {
    "headers" : headers
  };

  response = UrlFetchApp.fetch(url, options);  
  data = JSON.parse(response.getContentText("UTF-8"));
  searchWord = '';
  for(key in data){
    if (data[key] >= 50) {
      searchWord += key + ',';
    }
    Logger.log(key + ' ' + data[key]);
  }
  result = '';
  if (searchWord != '') {
    result = chiebukuro(searchWord, to);
  }
  if (result == '') {
    result = talk(text, to);
  }
  Logger.log(data);
  return result;
}

/**
 * yahooの知恵袋で検索を行う
 */
function chiebukuro(text) {
  var url = 'http://chiebukuro.yahooapis.jp/Chiebukuro/V1/questionSearch?appid=' + yahooAppId + '&type=phrase&&output=json&sort=-anscount&condition=solved&results=1&query='+ encodeURIComponent(text);
  var headers = {
    'Content-Type' : 'application/json; charset=UTF-8',
  };

  var options = {
    'headers' : headers
  };

  response = UrlFetchApp.fetch(url, options);  
  data = XML_to_JSON(response);
  if (data.ResultSet.totalResultsReturned > 0) {
    Logger.log(data.ResultSet.Result.Question.BestAnswer.Text);
    return data.ResultSet.Result.Question.BestAnswer.Text;
  } else {
    return '';
  }
}

function searchTest() {
  setConfig();
  data = keyword('カレーライスの作り方は？', to);
  Logger.log(data);
}

function getGnavi(latitude, longitude) {
  var headers = {
    keyid: gnaviApiKeyId,
    format: 'json',
    latitude: latitude,
    longitude: longitude,
    range: 1
  };
    var options = {
    "headers" : headers
  };
  
  var strRespons = UrlFetchApp.fetch("http://api.gnavi.co.jp/RestSearchAPI/20150630/?keyid=" + gnaviApiKeyId + "&format=json&latitude=" + latitude + "&longitude=" + longitude + "&range=2&lunch=1&hit_per_page=200", options);
  var data = JSON.parse(strRespons.getContentText());
  var data = shuffle(data.rest);
  for (i = 0; i < data.length; i++) {
    Logger.log(data[i].name + ' ' + data[i].url);
  }
  return data;
}
