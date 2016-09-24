function pokegotest() {
  pokego(35.659054, 139.700566);
}
function pokego(latitude, longitude) {
    var headers = {
    format: 'json',
    latitude: latitude,
    longitude: longitude,
  };
    var options = {
    "headers" : headers
  };
  var strResponse = UrlFetchApp.fetch("https://pokevision.com/map/scan/" + latitude + "/" + longitude + "", options);
  var data = JSON.parse(strResponse.getContentText());
  if (data.status == "success") {
    Logger.log(data.jobId);
    Utilities.sleep(1500);
    var url = "https://pokevision.com/map/data/" + latitude + "/" + longitude + "/" + data.jobId;
    Logger.log(url);
    var strResponse = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(strResponse.getContentText()); 
    var pokemon = data.pokemon;

    if (pokemon.length == 0) {
      return "";
    }
    Logger.log(pokemon[0]);
    Logger.log(pokemon.length);
    var result = "【近くのポケモン情報です】\n";
    for (i = 0; i < pokemon.length; i++) {
      p = pokemon[i];
      Logger.log(p);
      var distance = Math.sqrt(Math.pow((p.latitude - latitude) / 0.0111, 2) + Math.pow((p.longitude - longitude) / 0.0091, 2)) * 1000;
      Logger.log(distance * 1000 + "m");
      Logger.log("http://maps.google.co.jp/maps?q=" + p.latitude + "," + p.longitude);

      if (distance<500) {
        result += 
          "◆約" + Math.floor(distance) + "m離れたところに "
          + getPokemonName(p.pokemonId) + " がいます!!(あと"
          + Math.floor(p.expiration_time - new Date()/1000) + "秒)\n"
          + "http://maps.google.co.jp/maps?q=" + p.latitude + "," + p.longitude
          + "\n\n";
      }
    }
    Logger.log(result);
    return result;
  }
}
function getPokemonName(n) {
  var headers = {
    format: 'json',
  };
  var options = {
    "headers" : headers
  };
  var strResponse = UrlFetchApp.fetch("http://pokemonapi.net/pokemon/" + n + ".json", options);
  var data = JSON.parse(strResponse);
  return data.name;
}