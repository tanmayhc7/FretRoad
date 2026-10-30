# Contributing to fretRoad

fretRoad is a free, non-commercial guitar-learning game, kept by one maintainer. The most useful thing you can do is **tell me what works and what does not**.

## Feedback first
- Use the **Report a problem or share an idea** link at the bottom of the game. It opens a pre-filled GitHub issue; nothing is sent until you press Submit.
- Or [open an issue](https://github.com/tanmayhc7/FretRoad/issues/new/choose) directly. Tell me the device and browser, what you did, what you expected and what happened. For mic drills, say whether you used the mic or the Tap button.
- The tester build (`dist/fretroad-tester.html`, or `index.html?tester=1`) unlocks everything and has a checklist and a copyable report.

## Code
Pull requests are welcome, but this stays one person's design, so I may decline or rework changes that do not fit. Please open an issue first for anything large.

- No build step, no dependencies. Open `index.html`. Scripts are plain classic scripts and load order matters (see `index.html`).
- Run the tests before sending a change: see [tests/README.md](tests/README.md). `python3 tests/globals.py` must pass (no two scripts may define the same global name).
- Keep new drills testable without a microphone where you can (the rhythm drills accept the Tap button).

## Licence and sign-off
fretRoad is under the [GNU AGPL-3.0](LICENSE). By sending a contribution you agree it is licensed under the same terms. Please add a `Signed-off-by` line to your commits (`git commit -s`), which certifies you wrote the change or have the right to share it ([Developer Certificate of Origin](https://developercertificate.org/)). There is no contributor agreement to sign.

## Conduct
Be kind and stay on topic. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
