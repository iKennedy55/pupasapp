# pupusas.beta

Minimal ordering app for pupusas. Handles multiple named orders, per-person tracking, specialty pricing, and order history with localStorage persistence.

## Tech Stack

- HTML, CSS, JavaScript (ES modules)
- No frameworks, no build tools
- localStorage for persistence

## Folder Structure

```
pupusas/
├── README.md
├── .gitignore
├── src/
│   ├── index.html
│   ├── css/
│   │   ├── variables.css
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── utilities.css
│   │   └── main.css
│   └── js/
│       ├── main.js
│       └── modules/
│           ├── state.js
│           ├── views.js
│           ├── order.js
│           ├── summary.js
│           ├── settings.js
│           └── toast.js
└── legacy/
    └── pupusas_counter.py
```

## Usage

Serve `src/` with any local server:

```bash
npx serve src
```

Or use VS Code Live Server pointed at `src/index.html`.

## Notes

- ES modules require a local server (`file://` protocol won't work)
- All data persists in `localStorage`
- `legacy/` contains the original CLI version in Python
