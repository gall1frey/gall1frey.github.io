# Engineering notebook: portfolio + blog

Plain HTML, CSS and JavaScript. Content lives in JSON and Markdown files, so you rarely touch the code.
Host from the root of the `gall1frey.github.io` repo on GitHub Pages.

Preview locally (fetch needs http, not file://):

    python3 -m http.server
    # then open http://localhost:8000

## How the site is organised
- **Home**: intro, "on the bench" sticky note, projects (filter by category), notes slider, contact.
- **Project page** (`#/project/<slug>`): summary, links, and the project's journal.
- **Notes** (`#/notes`): standalone blog posts. Project progress goes in the journal instead.
- **About** (`#/about`): full intro, work log, certifications, toolbox.

## Add a project
Add an object to `data/projects.json`:

    {"slug": "my-project", "category": "Robotics", "title": "My project", "when": "Nov 2026",
     "summary": "One line for the card.", "text": ["Longer description, one string per paragraph."],
     "tags": ["ROS2"], "status": "in progress", "group": "bench", "cover": "images/my-project.jpg",
     "links": [{"label": "Code", "href": "https://github.com/..."}]}

- `category` makes the filter tabs. Order the tabs with `categories` in `data/site.json`.
- `group: "bench"` pins it to the sticky note and the front of the grid. Remove it when it is no longer on the bench.
- `cover` is optional; without it the card gets a line drawing for its category.
- Then create `projects/my-project.md` (the journal). It can be empty at first.

## Write a journal entry
Open `projects/<slug>.md` and add an entry at the bottom. Each entry starts with `# date | title`:

    # 2026-11-10 | Title of the entry

    Text, **bold**, *italic*, `code`, ==highlighter==, [links](https://...).

    ![Caption](images/photo.jpg)                  taped-in photo
    ![sketch: Caption](images/sketch.jpg)         page from the sketchbook
    ![diagram: Caption](images/block.png)         flat framed figure
    ![Caption](images/photo.jpg){small}           also {medium} or {wide}; default is natural size up to the column width
    ![Caption](images/photo.jpg){side}            image in the right margin, outside the text column
                                                  (put it directly above the paragraph it belongs next to)
    (two or more images in a row become a gallery)

    @[youtube: Caption](https://youtu.be/ID)      YouTube video or playlist link
    @[vimeo: Caption](123456789)
    @[video: Caption](images/test-run.mp4)        a file you host

    - [ ] to do      - [x] done

Entries are sorted by date, and readers can flip the order. See `projects/_template.md` for a copy-and-paste starter.
Videos from YouTube and Vimeo only load when someone presses play, so the site stays tracking-free until then.

## Add a blog post
1. Create `posts/my-slug.md` and write in Markdown.
2. Add one line to `posts/index.json`:

       {"slug": "my-slug", "title": "My title", "date": "2026-11-01", "tags": ["film"], "summary": "One sentence."}

Photos: put files in `images/` and use `![Caption](images/photo.jpg)`.

## Other content
- Jobs, certifications, tools: `data/experience.json` (new roles at the top of `log`).
- Intro, title block, links, category order: `data/site.json`.
- Old note links such as `#/notes/how-to-fly-like-birds` redirect to the project through its `aliases` list.

## Files
- `index.html`  page shell + SEO tags
- `css/style.css`  the notebook look
- `js/app.js`  reads the data files and draws the pages
- `data/`  site, projects, experience
- `projects/`  one journal (`.md`) per project
- `posts/`  blog posts (`index.json` + one `.md` each)
- `llms.txt`, `robots.txt`, `sitemap.xml`  for crawlers and AI tools