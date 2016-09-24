# Googleカレンダーの予定をLINE BOTを使って通知させよう！

- Googleカレンダーに登録されている予定をLINEに通知する
- 場所(予定の内容)によって通知する時間を変更することができる
   - 例えば、``[会議室]A``の場合は15分前に通知させることができる

	 ![image1](https://raw.githubusercontent.com/IwakamiYuki/line_bot/master/image/line1.png)

- Google Apps Scriptを使っています

## 準備作業

### LINE BOTをGoogle Apps Scriptで利用できるようにする
以下のサイトを見ながら設定できました！
> [Line BotをGoogle App Scriptで無料で手軽に試してみる。](http://qiita.com/osamu1203/items/0de2909821a1b3cbb350)

### 自分のLINEアカウントのMIDを取得する

`src/main.js`の`①送信者のmidを返す`の行のコメントアウトを外すと自分のLINEアカウントのMIDを返してくれます

### config(Googleスプレッドシート)に記入する

それぞれのパラメータ名(A列)に対するパラメータをB列に記入する

| A | B |
|:-:|:-:|
|lineChannelId|LINE developersのchannel id|
|lineChannelSecretId|LINE developersのchannel secret|
|lineMid|LINE developersのMID|
|lineMyMid|送信先のLINEアカウントのmid(自分のアカウントになるはず)|
|calendarId|取得したいGoogleカレンダーのid|
|yahooAppId|yahoo apiのapp id|
|docomoApiKey|docomo apiのapi key|
|gnaviApiKeyId|ぐるなびAPIのkey id|
|placeDataSpreadsheet|場所と時間を記入したスプレッドシートID|

### 場所と時間(スプレッドシート)を記入する

A列に場所、B列に時間(分)を記入する

| A | B |
|:-:|:-:|
|[会議室]A|15|
|[会議室]B|5|
|[会議室]|1|

### トリガーの設定をする

Google Apps Scriptのトリガーの設定をする

|実行|イベント|
|checkSchedule|時間主導型 分タイマー 1分ごと|

![image2](https://raw.githubusercontent.com/IwakamiYuki/line_bot/master/image/gas1.png)
