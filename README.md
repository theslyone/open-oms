# OpenOMS

This is an open source order management system that can be integrated to the Nigerian stock market exchange server [nse](http://nse.com.ng/) using the popular FIX protocol implementation [Quickfix](http://www.quickfixengine.org/).

## Screenshot
![screenshot](https://github.com/theslyone/open-oms/blob/master/img/snapshot.png).

## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
* Bower - You're going to use the [Bower Package Manager](http://bower.io/) to manage your front-end packages. Make sure you've installed Node.js and npm first, then install bower globally using npm:

```bash
$ npm install -g bower
```

* Sails - Application is implemented on the popular [sails](http://sailsjs.com/) nodejs framework hence you might also want to take a look and become familiar with it's folder structure and backend middleware routing. Make sure you've installed Node.js and npm first, then install sails globally using npm:

```bash
$ npm -g install sails
```

* Grunt - [Grunt Task Runner](http://gruntjs.com/) is highly recommend to automate your development process. Make sure you've installed Node.js and npm first, then install grunt globally using npm:

```bash
$ npm install -g grunt-cli
```

## Running Your Application
After the install process is over, you'll be able to run your application using 

```
$ sails lift
```

## Credits
Electronifie [node-quickfix](https://github.com/electronifie/node-quickfix)

