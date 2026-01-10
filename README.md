**Project:**
- **Name:** Simple Quiz with starfield background — interactive quiz UI using HTML, CSS, and JavaScript.

**Files:**
- **HTML:** [Quiz.html](Quiz.html) — main page.
- **Script:** [script.js](script.js) — application logic, quiz loading, and canvas starfield.
- **Quizzes:** [quizzes.json](quizzes.json) — optional external quiz data. A fallback in-code dataset is used if loading fails.
- **Styles:** [styles.css](styles.css)

**Run (quick):**
- Serve the folder over HTTP (recommended). From the project folder run:

```bash
# Python 3
python -m http.server 8000

# Then open in browser:
http://localhost:8000/Quiz.html
```

**Why a server?**
- Modern browsers block `fetch()` for local files when opening `file://` directly. Serving via HTTP allows the app to fetch `quizzes.json`.

**Adding quizzes:**
- Create or edit [quizzes.json](quizzes.json) using the structure shown in `script.js` (array of quiz objects with `id`, `title`, `icon`, `description`, and `questions`).
- If `quizzes.json` cannot be fetched, the app uses the embedded fallback quizzes.

**Troubleshooting:**
- If you see "Could not load quizzes.json — using embedded fallback":
  - Ensure the server is running and [quizzes.json](quizzes.json) is in the same folder as [Quiz.html](Quiz.html).
  - Check browser console for CORS or network errors.
  - If you prefer not to run a server, rename `quizzes.json.txt` to `quizzes.json` (but serving is still recommended).

**Next steps (optional):**
- Add a runtime fallback to try `quizzes.json.txt` automatically if `quizzes.json` is missing.
- Add instructions to commit changes or add more quizzes.

**License:**
- No license specified (add one if you plan to share publicly).
