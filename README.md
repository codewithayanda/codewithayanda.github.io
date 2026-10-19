# Ayanda Biyela: portfolio

Personal portfolio site for [Ayanda Biyela](https://github.com/codewithayanda), a .NET and Angular developer in Durban, South Africa.

It is a dependency-free static site (HTML, CSS and a little vanilla JavaScript). There is no build step, so GitHub Pages serves the files exactly as they are.

## Run it locally

```bash
python -m http.server 8123
```

Then open <http://localhost:8123>. Any static file server works (`npx serve`, VS Code Live Server and so on).

## Where things live

| Path | What it is |
| --- | --- |
| `index.html` | All the content, the SEO and social-preview tags, and the icon sprite |
| `assets/css/styles.css` | Design tokens (light and dark), layout and components |
| `assets/js/main.js` | Theme toggle, navigation, reveal-on-scroll, screenshot lightbox, GitHub "Updated" dates, contact form |
| `assets/imgs/` | Portrait, project screenshots, favicon, iOS icon and the social-preview image |
| `assets/docs/curriculum_vitae.pdf` | The CV behind every "Download CV" button |

## Updating the content

- **CV:** replace `assets/docs/curriculum_vitae.pdf` and keep the file name.
- **Experience:** edit the `tl-item` blocks in the Experience section.
- **A new project:** copy an existing `project-card` in the Projects section. Add `data-repos="Repo-Name"` (space-separated for several repos) and a hidden `<span class="pc-meta" hidden>` in the footer to get a live "Updated 3 days ago" label from GitHub.
- **Colors and fonts:** the tokens at the top of `assets/css/styles.css`.

## Deploying on GitHub Pages

The site is published from the root of the `main` branch.

For the address `https://codewithayanda.github.io/` the repository has to be named `codewithayanda.github.io`. If it keeps a different name, GitHub serves it from a sub-path instead (`https://codewithayanda.github.io/<repo-name>/`). Every link inside the site is relative, so it works either way, but update the absolute URLs in `index.html` (`canonical`, `og:url`, `og:image` and the JSON-LD block) so link previews point at the right address.

## Contact form

The form sends through [EmailJS](https://www.emailjs.com/). The public key, service ID and template ID are at the top of `assets/js/main.js` (they are public by design). The template receives `name`, `email`, `message` and `subject`. If EmailJS is blocked or fails, the form shows a direct email link instead.

## Credits

Fonts: [Inter](https://rsms.me/inter/) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/) via Google Fonts. Icons: [Lucide](https://lucide.dev/)-style strokes, plus the GitHub and LinkedIn marks from [Simple Icons](https://simpleicons.org/).
