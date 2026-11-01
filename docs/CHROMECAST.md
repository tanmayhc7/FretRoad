# fretRoad on Chromecast

Group practice on the TV. Everyone's phone is a controller; the TV shows each player's progress, a shared jam chart, or the daily exercise on one clock. Several players can be on one phone, and each phone can bring its own players.

## What you need (one time)

1. A Chromecast (or a TV with Google Cast built in) on the same Wi-Fi as the phones.
2. A [Google Cast Developer Console](https://cast.google.com/publish) account (a one-time fee, about US$5).
3. The receiver page on a public HTTPS address. With GitHub Pages it is `https://<you>.github.io/FretRoad/cast/receiver.html`.

## Register the app

1. In the Cast console choose **Add new application** and pick **Custom Receiver**.
2. Name it fretRoad and paste the receiver URL above.
3. Save. You get an **Application ID** (letters and digits).
4. While the app is unpublished, add your Chromecast under **Add new device** (its serial number) and restart the Chromecast. It can take up to 15 minutes before it accepts the app. Publishing the app removes this step for everyone.

## Connect the phones

1. In fretRoad open **Settings** and paste the Application ID into **TV**. Reload the page.
2. In Chrome (Android or desktop) a **TV** button appears in the header. Tap it and pick the Chromecast.
3. The TV lobby lists every player on every connected phone: name, stops cleared, streak, level and whether they have practised today. Use **Settings > Players** to add or switch players.

## What the TV shows

- **Lobby:** player cards with progress.
- **Group jam:** open any song or jam track and press Start. The TV shows the current and next chord with diagrams, the beat, and a count-in, all computed from one shared start time so everybody sees the same chord on the same beat. Each person plays on their own guitar; backing audio plays from the host phone.
- **Daily exercise:** on the Daily page press **Show on TV**. The exercise, tab and a shared five-minute clock appear on the TV.

## Limits

- iPhones cannot cast from a web page; Chrome on Android and on a laptop can. (iOS would need a native app.)
- Listening and scoring still happen on each phone's own microphone, and only progress summaries are sent to the TV. A whole save never leaves the device.
- The TV and phones need a roughly correct clock (they sync it automatically; a few hundred milliseconds of drift is fine).

## Testing without a Chromecast

Open `cast/receiver.html` in a normal browser and feed it messages from the console:

```js
fretroadReceiver.handle('s1',{t:'hello',device:'d1',players:[{id:'p1',name:'Ana',color:'#e6b95f',cleared:7,total:19,streak:3,level:'intermediate',practisedToday:true,active:true}]});
fretroadReceiver.handle('s1',{t:'jam',title:'Four-chord pop',seq:['G','D','Em','C'],bpm:90,bpb:4,bpc:4,countIn:1,startAt:Date.now()+3000});
```
