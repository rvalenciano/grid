# Grid

This is a JS app that allows the implementation of a GRID type data structure and combines it with a visualization of the COBIT framework. Useful for organizations that are implementing COBIT and the GQM+Strategies proposed in the book Aligning Organizations Through Measurement..

Please check the basic usage guide with a lot of images in this wiki page:

https://github.com/rvalenciano/grid/wiki/Basic-Usage


## Tech Stack
 * Database: neo4j
 * Backend: Express js
 * Frontend: EJS with flat ui library.
 
 ## Features

 Currently you can create nodes, assign them categories, filter them and visualize them in the COBIT treemap.
 Also you can save grids, load them and delete specific nodes. We have a user system in place. Also we use `localStorage` to save the status of the grid for navigation in the system. You can clear the `localStorage` cache in the profile page section.


 ## Installation

 In dev, is currently run as a vagrant machine. 

 * Install Vagrant
 * `cd` into vagrant folder.
 * Run `vagrant up` in this folder and wait until installation is complete.
 * To set up the app, `vagrant ssh` and then `cd grid/`. Inside run `npm install`  and `bower install` to install all server side libraries and also all css and js libraries.
 * To run the app, run `gulp` in the same folder.
 * Go to localhost:3000 to check the app.
 * Go to localhost:7474 to see the database manager
