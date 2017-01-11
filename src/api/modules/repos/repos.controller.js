const HttpStatus = require('http-status');
const ReposBL = require('./repos.bl');

class ReposController {
  constructor(context) {
    this.profileBL = new ReposBL(context);
  }

  get(req, res) {
    return res.status(HttpStatus.NOT_IMPLEMENTED);
  }
}

module.exports = ReposController;
