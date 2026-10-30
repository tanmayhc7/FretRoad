# Bring your own model

fretRoad has **no AI model, no AI account and no server**. The riff helper only gives you a plug: you connect a model you
already have, and whether the answers are any good depends on that model.

## What the riff helper does without any AI

On a song with a recording, open **Riff helper**, mark a short single-note bit with **Start here** / **End here**, and press
**Read the notes**. fretRoad listens in your browser, lists the notes, and suggests strings and frets as a tab. This is a
first guess and works best on one note at a time (not chords or busy mixes).

## What is sent when you ask your model

Only text: the notes (name, time or beat, length), the suggested tab, tuning, capo, tempo, and the chord under the riff.
**The audio never leaves your device.** The request goes straight from your browser to the address you set. Your key is
kept only in your browser's local storage on this device and is not part of your saved progress or backups.
Use **Forget my settings** to remove it.

## Providers built in

| Provider | Use it for | Needs |
|---|---|---|
| OpenAI-compatible | OpenAI, Ollama, LM Studio, OpenRouter, vLLM and most others | address, model name, key (optional for local) |
| Anthropic Messages API | Claude models | address, model name, API key |
| My own server (simple JSON) | anything you wrap yourself | an address that accepts the request below |

Plain `http://` is only accepted for `localhost` and your own network, so a key is never sent in the clear over the internet.

### Local models and CORS

Browsers only let a page call a server that allows it. For Ollama, start it with your page's origin allowed, for example
`OLLAMA_ORIGINS=https://tanmayhc7.github.io ollama serve`. LM Studio has a "Enable CORS" switch.

## Your own server (simple JSON)

fretRoad sends `POST` with `Content-Type: application/json`:

```json
{ "task": "riff", "system": "...instructions...", "user": "...notes and tab as text...",
  "data": { "notes": [], "positions": [], "tab": "", "capo": 0, "bpm": 96, "chord": "Am", "tuning": [40,45,50,55,59,64] } }
```

and expects either `{ "text": "the answer" }` or a JSON string. Answers are shown as plain text, never as HTML.

## Writing a provider (a few lines of JavaScript)

Add a file, load it after `js/ai/ai.js`, and register it:

```js
FretRoadAI.register({
  id: 'mine',                      // a-z, 0-9 and -
  name: 'My model',
  fields: [ { key: 'url', label: 'Address' }, { key: 'key', label: 'Key', secret: true, optional: true } ],
  ask: function (req, cfg) {       // req = { task, system, user, data }, cfg = the saved field values
    return fetch(cfg.url, { method: 'POST', body: JSON.stringify(req) })
      .then(function (r) { return r.json(); }).then(function (j) { return j.text; });
  }
});
```

`ask` returns a promise of a string. The provider then shows up under **AI settings**.
