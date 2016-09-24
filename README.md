# Googleカレンダーの予定をLINE BOTを使って通知させよう！

- Googleカレンダーに登録されている予定をLINEに通知する
- 場所(予定の内容)によって通知する時間を変更することができる
   - 例えば、``[会議室]A``の場合は15分前に通知させることができる

## 準備作業

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
