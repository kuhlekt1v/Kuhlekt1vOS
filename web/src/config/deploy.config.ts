/** Output folder for the website build */
export const BUILD_DIR = 'dist';

/** Domain to deploy the website to */
export const DOMAIN = 'orange-grass-03e4cc80f.3.azurestaticapps.net';
/** Base URL of the website, that consists of the http protocol and the domain */
export const BASE_URL = `https://${DOMAIN}/`;

/** Properties of the GitHub repository with the source code of the website */
export const REPO = { owner: 'kuhlekt1v', name: 'Kuhlekt1vOS', branch: 'main' };
/** URL of the GitHub repository with the source code of the website */
export const REPO_URL = `https://github.com/${REPO.owner}/${REPO.name}`;

/** Commit message for GitHub Pages deployments */
export const COMMIT_MESSAGE = 'Deployed build to GitHub Pages';

