# Login Watch – Alexa Security Alert Skill

A simulated Alexa+ experience that detects brute force login attempts. Paste authentication logs, click "Alexa, check my logs", and the app flags any source IP with more than 3 failed logins, shows a red alert, and speaks a warning.

Live demo: https://alexa-security-alert.vercel.app/

## Run locally

Requires Node.js 18 or higher.

```bash
git clone https://github.com/AadhithyaB-cyber/alexa-security-alert.git
cd alexa-security-alert
npm install
npm run dev
```

Open http://localhost:3000 in Chrome or Edge and click "Alexa, check my logs". Sample logs are preloaded.

## How it works

- `app/page.js` parses the pasted logs in the browser and counts failed logins per source IP.
- Any IP over 3 failures is flagged as suspicious.
- The browser's Web Speech API (speech synthesis) simulates Alexa's spoken alert.

## Built with

Next.js, React, Vercel, Web Speech API

## License

MIT