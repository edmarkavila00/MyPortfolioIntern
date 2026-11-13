# Edmark Portfolio

A responsive personal portfolio website for Edmark, an Information Technology student and aspiring developer in the Philippines. It introduces Edmark, highlights selected projects and skills, and provides ways to get in touch.

[View the live portfolio demo](https://my-intern-portfolio-project.vercel.app/).

## Features

- Responsive layout for desktop and mobile
- About, projects, skills, and contact sections
- Light and dark themes
- Keyboard-accessible mobile navigation and project carousel
- Resume download
- Contact form that opens the visitor's default email application

## Run locally

No build tools or dependencies are required. Open `index.html` in a browser, or serve the project directory with any local static web server.

For example, if Python is installed:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## Project files

```text
.
├── index.html       # Portfolio page
├── style.css        # Layout, responsive styles, and themes
├── script.js        # Navigation, theme, carousel, and contact behavior
├── DEMO.md          # Demo walkthrough
└── assets/          # Images and downloadable resume
```

## Deployment

The live portfolio is deployed on Vercel: [my-intern-portfolio-project.vercel.app](https://my-intern-portfolio-project.vercel.app/). Push changes to the connected repository to trigger a new deployment.

## Customization

- Edit the page content and project links in `index.html`.
- Update colors, typography, and layout in `style.css`.
- Update interactions in `script.js`.
- Replace images and the resume in `assets/`, keeping the filenames or updating their references in `index.html`.
