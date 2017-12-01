# Learning Map v1.5
hello@mattperkins.me

Learning Map application that integrates with Moodle LMS, Learning Locker LRS, and PostGREST copy of Moodle DB.

API Keys and full configuration are located in the config.json file which is *not* included in this repo.

---

Static assets for the front end are `front/www/*` and all app development files are located in `front/app/*`.
On build, the `front/www/js/app` directory is cleaned and new code is bundled there. 

JS Entry point is `front/app/index.js`
SASS is `front/app/index.sass`

## Build options

`npm run dev` to start the webpack-dev-server with hot reloading at localhost:3000. Will also open the default browser to the site.
`npm run build:prod` to clean and create a production build of the app

## Notes

- When the application start, it will try to load ./front/www/config.json for special configuration options for the running app. If there is a problem, a warning will appear in the log and the app will try to run normally.