# OneClick Legal Pages (`legal.oneclick.hk`)

Static legal pages for Meta / Facebook verification.

Pages are generated from OneClick Admin CMS public API and committed into `docs/` by GitHub Actions every 10 minutes (and on push / manual run).

## Source of truth (CMS)

- `https://app.oneclick.hk/api/app/cms/privacy_policy`
- `https://app.oneclick.hk/api/app/cms/data_deletion`

## Output

GitHub Pages serves `docs/`:

- `/privacy-policy` → redirects to `/privacy-policy.html`
- `/data-deletion` → redirects to `/data-deletion.html`

## GitHub Pages setup

Repo → Settings → Pages:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/docs`
- Custom domain: `legal.oneclick.hk`

## DNS (hostingspeed)

Add CNAME:

- `legal` → `oneclickmedicalhk-source.github.io`

## Meta URLs

- Privacy policy URL: `https://legal.oneclick.hk/privacy-policy`
- User data deletion URL: `https://legal.oneclick.hk/data-deletion`

