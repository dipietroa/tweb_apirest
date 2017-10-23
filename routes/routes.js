const request = require('superagent');
const Storage = require('../src/storage.js');
const credentials = require('../github-credentials.json');

/**
 * Check if a given repository is in a given array
 * @param {*} array
 * @param {*} obj
 */
function checkIfRepoExists(array, obj) {
  for (let i = 0; i < array.length; i += 1) {
    if (array[i].owner === obj.owner && array[i].repo === obj.repo) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a given repository exists. Yes? Check
 * if there is minimum 1 PR
 * @param {*} owner
 * @param {*} repo
 * @param {*} finish
 */
function checkIfExistsOnGitHub(owner, repo, finish) {
  request
    .get(`https://api.github.com/repos/${owner}/${repo}/pulls`)
    .auth(credentials.username, credentials.token)
    .set('Accept', 'application/vnd.github.v3+json')
    .end((err, res) => {
      if (!err && res) {
        if (res.body.length !== 0) {
          finish(true, 0);
        } else {
          finish(false, 2);
        }
      } else {
        finish(false, 1);
      }
    });
}

/**
 * Defines the routes
 * @param {*} app
 */
const appRouter = (app) => {
  app.get('/', (req, res) => {
    res.send('Hello World');
  });

  /**
   * Catching POST requests to /addpr
   */
  app.post('/addpr', (req, res) => {
    // Checking if the user completed all the fields
    if (!req.body.owner || !req.body.repo) {
      res.send({ status: 'error', message: 'missing a parameter' });
    } else {
      let resdata = [];
      // Get the config file
      request
      // CHANGE THE URL FOR THE URL OF YOUR OWN CONFIG FILE
        .get('https://dipietroa.github.io/generated_files/config.json')
        .auth(credentials.username, credentials.token)
        .set('Accept', 'text/plain')
        .end((err, result) => {
          const json = JSON.parse(result.text);
          const destRepo = 'dipietroa.github.io';

          resdata = json;

          const obj = { owner: req.body.owner, repo: req.body.repo, date: new Date() };

          // Is the repo already in the config file?
          if (!checkIfRepoExists(resdata, obj)) {
            // Is the repo available on GitHub?
            checkIfExistsOnGitHub(obj.owner, obj.repo, (linkExists, code) => {
              if (linkExists) {
                // Publish on GitHub
                const storage = new Storage(credentials.username, credentials.token, destRepo);
                resdata.push(obj);
                storage.publish('generated_files/config.json', JSON.stringify(resdata, null, 2), 'new version of file config.json', (error, resulta) => {
                  if (error === undefined && resulta != null) {
                    res.send({ status: 'success', message: 'your request has been correctly sent to our agent' });
                  } else {
                    res.send({ status: 'error', message: 'Fail on sending your request, please contact the administrator of the application' });
                  }
                });
              } else if (code === 1) {
                res.send({ status: 'error', message: 'The combination (owner, repository) you have entered doesn\'t exist' });
              } else if (code === 2) {
                res.send({ status: 'error', message: 'The specified repository has no pull request, this website will not have anything to show you! Add it when it has PR.' });
              }
            });
          } else {
            res.send({ status: 'error', message: 'The repo is already in our file system. If you cannot see the PR analysis, wait for the next upload process' });
          }
        });
    }
  });
};

module.exports = appRouter;
