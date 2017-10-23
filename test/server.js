const should = require('./chai-config.js');
const request = require('superagent');
require('../server.js');

describe('server', () => {
  it('should treat a post request and check if all required datas were sent', (done) => {
    request
      .post('http://localhost:3000/addpr')
      .send({ owner: 'SoftEng-HEIGVD', repo: 'Teaching-HEIGVD-RES-2017-Labo-01' })
      .end((err, res) => {
        should.not.exist(err);
        should.exist(res);
        done();
      });
  });
});
