# fretRoad on a Chromecast / TV: full setup guide

This guide covers every step, including the small ones. There are two routes. Pick one.

| | Route A: Cast receiver (built) | Route B: Android TV app (APK) (planned) |
|---|---|---|
| Works on | Any Chromecast or TV with Google Cast | Chromecast **with Google TV** (has a remote and a home screen) or any Android TV |
| Phones | Needed as controllers (Chrome on Android or a laptop; not iPhone) | Not needed to run; optional as a mic |
| Cost | About US$5 one time (Cast console) | Free if sideloaded; US$25 one time for the Play Store |
| Status | Code is in the repo, untested on real hardware | To be built (see "Route B" at the end) |

---

## Route A: Cast receiver

### What it does
- The TV shows a **lobby** with every player's progress (stops cleared, streak, level, practised today).
- **Group jam:** the TV shows the current and next chord with diagrams, a beat indicator and a count-in. Every phone and the TV use one shared start time, so everyone sees the same chord on the same beat.
- **Daily exercise:** the TV shows the exercise, its tab and a shared 5-minute clock.
- Players are profiles stored on each phone (Settings > Players). Only small summaries (name, colour, stops cleared, streak, level) are sent to the TV, never a full save.

### Before you start
1. A Chromecast (or a TV with Google Cast built in), powered on and on the **same Wi-Fi** as your phone or laptop.
2. A Google account.
3. A card for the one-time Cast developer fee (about US$5).
4. The pull request "Player profiles + Chromecast receiver" merged into `main`, and GitHub Pages deployed. Check that this page opens in a browser (it shows a dark screen saying fretRoad / waiting for players):
   `https://tanmayhc7.github.io/FretRoad/cast/receiver.html`
   If it shows a 404, wait a minute after the merge and refresh.

### Step 1: Find your Chromecast's serial number
You need this because an unpublished Cast app only runs on devices you register.
1. On your phone open the **Google Home** app.
2. Tap your Chromecast.
3. Tap the **gear icon** (Settings) at the top right.
4. Scroll to **Device information** and tap it.
5. Read the **Serial number** (a long string). Write it down exactly. Some models also print it on the box or the device.

### Step 2: Create a Cast developer account
1. Open <https://cast.google.com/publish> in a browser, signed in with your Google account.
2. Accept the developer terms.
3. Pay the one-time registration fee when asked.
4. Wait for the confirmation; it is usually immediate.

### Step 3: Register the receiver
1. In the console click **Add new application**.
2. Choose **Custom Receiver**.
3. Fill in:
   - **Name:** fretRoad
   - **Receiver Application URL:** `https://tanmayhc7.github.io/FretRoad/cast/receiver.html`
   - Leave Guest Mode off.
4. Click **Save**.
5. The application list now shows your app with an **Application ID** (about 8 letters and digits). Copy it. You paste it into fretRoad later.

### Step 4: Register your Chromecast as a test device
1. In the console open the **Devices** tab (or **Add new device**).
2. Enter your Chromecast **serial number** from Step 1 and a description such as "Living room".
3. Click **Save**.
4. **Reboot the Chromecast:** unplug its power for 10 seconds, plug it back in, and wait until the home screen appears.
5. It can take up to 15 minutes before the device accepts the app. If the app is not found at first, wait and try again.
6. Publishing the app (Console > your app > Publish) removes the need for step 4 for everyone, but an unpublished app is fine for personal use.

### Step 5: Tell fretRoad the Application ID
1. On your phone open Chrome and go to `https://tanmayhc7.github.io/FretRoad/`.
2. Tap **Settings** in the header.
3. Find the **TV** row and paste the Application ID.
4. The page shows a note to reload. Reload it (pull to refresh, or close the tab and open it again).
5. A **TV** button now appears in the header. If it does not, check you are in Chrome and not another browser or iOS, and that the ID has no spaces.

You can also pass the ID once in the address: `https://tanmayhc7.github.io/FretRoad/?castid=YOURID`.

### Step 6: Add the players
1. Open **Settings > Players**.
2. Type a name and tap **Add**. The app switches to the new player and shows the story picker; pick a story.
3. Repeat on each phone for the people using it. Each phone keeps its own players.
4. To change player later: Settings > Players > **Switch** next to the name. The page reloads with that player's progress.
5. **Rename** and **Remove** are next to each name. Remove asks twice and deletes that player's progress. The last player cannot be removed.

### Step 7: Cast
1. Tap the **TV** button in the header.
2. Pick your Chromecast in the list.
3. The TV opens the fretRoad lobby with the players from your phone. Other phones connect the same way and their players appear too.

### Step 8: Use it
- **Group jam:** open **Songs**, open a song or jam track, press **Start**. The TV shows a count-in, then the chords in time. Backing audio plays from the phone that pressed Start. Each person plays their own guitar. Press **Stop** to return to the lobby.
- **Daily exercise:** open the daily practice page and press **Show on TV**. The TV shows the exercise and a shared clock.
- Tap the **TV** button again to stop casting.

### Troubleshooting
| Problem | Fix |
|---|---|
| No TV button | Use Chrome on Android or desktop. Make sure the Application ID is saved (Settings > TV) and the page was reloaded. |
| Button shows but no devices | Phone and Chromecast must be on the same Wi-Fi. Turn off VPN. Some guest networks block discovery. |
| Chromecast listed but TV stays on a Cast logo or errors | The device is not registered yet, or you did not reboot it after registering. Wait up to 15 minutes. |
| TV shows a blank page | Open the receiver URL in a browser to check it loads. Check the URL in the console matches exactly (https, no trailing space). |
| Chords on TV drift from the beat | The TV and phone clocks sync automatically. Reconnect (stop casting and cast again). |
| Cast works on laptop but not iPhone | Web pages cannot cast from iOS. Use Android or a laptop, or Route B. |

### Limits
- Not yet verified on a real Chromecast (written and tested against a simulated Cast framework).
- Listening and scoring use each phone's own microphone; the TV only displays.
- Casting from a page works on Chrome for Android and desktop only.

### Testing without a Chromecast
Open `cast/receiver.html` in a normal browser and run in the console:
```js
fretroadReceiver.handle('s1',{t:'hello',device:'d1',players:[{id:'p1',name:'Ana',color:'#e6b95f',cleared:7,total:19,streak:3,level:'intermediate',practisedToday:true,active:true}]});
fretroadReceiver.handle('s1',{t:'jam',title:'Four-chord pop',seq:['G','D','Em','C'],shown:['G','D','Em','C'],bpm:90,bpb:4,bpc:4,countIn:1,startAt:Date.now()+3000});
```
Automated tests: `python3 tests/ui_cast.py` and `python3 tests/ui_profiles.py`.

---

## Route B: Android TV app (APK) — planned

Only works on a **Chromecast with Google TV** (or another Android TV). The plain Chromecast dongle cannot install apps.

### What will be built
1. A TV-friendly layout and remote (D-pad) navigation in the web app.
2. A small Android project (`android/`) that wraps the site in a full-screen WebView with a TV launcher banner.
3. A GitHub Actions workflow that builds `fretRoad.apk` so you can download it from the repo's Actions or Releases page. No Android tooling is needed on your machine.
4. A profile picker on the TV (profiles stored on the TV), with a phone able to act as the microphone later.

### Sideload the APK on a Chromecast with Google TV (once the APK exists)
1. On the Chromecast home screen go to **Settings > System > About** and click **Android TV OS build** seven times until it says you are a developer.
2. Go to **Settings > System > Developer options** and turn on **USB debugging** (or **Network debugging / ADB debugging**).
3. Install the **Downloader** app from the Play Store on the TV, then in Settings > Apps > Security & restrictions > **Unknown sources** allow Downloader.
4. Open Downloader, enter the APK download link from the GitHub release, and install.
5. Alternative with a computer: on the TV note its IP address (Settings > Network), then run `adb connect <tv-ip>:5555` and `adb install fretRoad.apk`.
6. Find fretRoad in **Settings > Apps > See all apps**, or on the home screen row.

### Play Store (optional)
1. Create a Google Play developer account (US$25 one time, identity verification).
2. Create the app, upload a signed AAB, add TV banner (1280x720), screenshots and a privacy note (the app stores progress on the device only).
3. Pass the TV app quality checks (D-pad navigation, no touch-only controls) and submit for review.

### Known limitation
A TV remote's microphone cannot hear a guitar. Listening and scoring needs a phone as the mic or a USB/Bluetooth microphone.
