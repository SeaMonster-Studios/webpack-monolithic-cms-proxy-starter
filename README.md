# Webpack Proxy Starter

This was created to handle asset bundling for websites with a monolithic CMS, such as WordPress.

## Features

* Webpack 4
* Hot Reloading
* Modern JS
* ES Modules
* Scss, CSS

## Setup (WordPress)

1.  Copy all files in the repo to the _wp-content/_ directory of your WordPress install, except for the _wordpress-dependencies_.
2.  Copy the _wordpress-dependencies/wp-webpack-scripts.php_ into your theme and include it within your _functions.php_ file.
3.  Zip and upload the _wordpress-dependencies/make-paths-relative_ plugin into wordpress, and activate it. Then go to the plugin's settings and check all the boxes to make everything relative paths, save your changes.

* I'd love to find a way around needing to use this, but this is a solution that works. If you don't want this plugin on your site, then just don't activate it in production.

4.  Rename the _.env.example_ file to _.env_

* Add your _PROXY_URL_, example: `http://my-awesome-wp-blog.lndo.site`
* Add your _PUBLIC_PATH_, example: `/wp-content/themes/<MY_AWESOME_THEME_NAME>/dist`

5.  In the terminal and from the _wp-content/_ directory, run `npm install`.
6.  Run `npm start`.

## Terminal Commands

1.  `npm start` will run the webpack dev server and proxy the local install of your WordPress site.

2.  `npm run build` will create the production build of your assets.

## License

MIT
