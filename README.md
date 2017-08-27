# Grid

This is a JS app that allows the implementation of a GRID type data structure and combines it with a visualization of the COBIT framework. Useful for organizations that are implementing COBIT and the GQM+Strategies proposed in the book Aligning Organizations Through Measurement..

## Tech Stack
 * Database: neo4j
 * Backend: Express js
 * Frontend: EJS with flat ui library.
 
 ## Features

 Currently you can create nodes, assign them categories, filter them and visualize them in the COBIT treemap.

 ## Installation

 In dev, is currently run as a vagrant machine. 

 * Install Vagrant
 * `cd` into vagrant folder.
 * Run `vagrant up` in this folder and wait until installation is complete.
 * To set up the app, `vagrant ssh` and then `cd grid/`. Inside run `bower install` to install all css and js libraries.
 * To run the app, run `gulp` in the same folder.
 * Go to localhost:3000 to check the app.
 * Go to localhost:7474 to see the database manager