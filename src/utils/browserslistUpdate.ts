
/**
 * Helper utility to update browserslist database
 * 
 * This can be run as a one-time script:
 * 1. In development: `npx update-browserslist-db@latest`
 * 2. In CI/CD: Add as a pre-build step
 * 
 * Note: This file doesn't do anything when imported, it's just documentation
 * since we can't modify package.json directly to add scripts.
 */

export const updateBrowserslistInfo = `
To update the browserslist database, run:

npx update-browserslist-db@latest

This will resolve the warning:
"Browserslist: browsers data (caniuse-lite) is X months old"

You can add this command to your CI/CD pipeline as a pre-build step.
`;
