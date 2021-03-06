const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const GlobalConfig = require('./../../config/config');

const Schema = mongoose.Schema;

/* eslint-disable camelcase */
const schema = new Schema({

  // GitHub Profile Id
  _id: {
    type: Number
  },

  // last time the data was updated in the MongoDb (not on GitHub!)
  // Todo: rename to s5r_last_check (to be consistent)
  last_check: {
    type: Date,
    default: new Date().setUTCHours(0, 0, 0, 0),
    null: false
  },

  login: {
    type: String,
    null: false,
    required: true
  },

  name: {
    type: String,
    null: false,
    required: true
  },

  public_repos: {
    type: Number,
    null: false,
    default: 0
  },

  public_gists: {
    type: Number,
    null: false,
    default: 0
  },

  followers: {
    type: Number,
    null: false,
    default: 0
  },

  following: {
    type: Number,
    null: false,
    default: 0
  },

  total_private_repos: {
    type: Number,
    null: false,
    default: 0
  },

  owned_private_repos: {
    type: Number,
    null: false,
    default: 0
  },

  collaborators: {
    type: Number,
    null: false,
    default: 0
  },

  s5r_created_at: {
    type: Date,
    null: false,
    default: new Date()
  },
  s5r_updated_at: {
    type: Date,
    null: true
  }

}, {noId: true, noVirtualId: true, collection: GlobalConfig.COLLECTION_PREFIX + GlobalConfig.COLLECTION_PROFILES, strict: false});
/* eslint-enable camelcase */

schema.plugin(uniqueValidator, null);
/**
 * Methods
 */
// ProfileSchema.method( {} );

/**
 * Statics
 */
// ProfileSchema.static( {} );

// Don't use arrow functions here, will not work ...
schema.pre('save', next => { // eslint-disable-line func-names
  // this.s5r_updated_at = Date.now;
  // this.wasNew = this.isNew;
  // if ( !this.isNew ) {
  //  console.log( 'hey, we are updating' );
  //  console.log( 'saveHistory: ', this.saveHistory );
  // }
  next();
});

schema.post('save', () => { // eslint-disable-line func-names
  // if ( !this.wasNew ) {
  //  console.log( 'save:was not new' );
  // } else {
  //  console.log( 'save:was new' );
  // }
});

schema.pre('update', next => { // eslint-disable-line func-names
  // this.s5r_updated_at = Date.now;
  // this.wasNew = this.isNew;
  // if ( !this.isNew ) {
  //  console.log( 'update: hey, we are updating' );
  //  console.log( 'saveHistory: ', this.saveHistory );
  // }
  next();
});

schema.post('update', () => { // eslint-disable-line func-names
  // if ( !this.wasNew ) {
  //  console.log( 'update: was not new' );
  // } else {
  //  console.log( 'update: was new' );
  // }
});

module.exports.Schema = schema;
module.exports.Model = mongoose.model(GlobalConfig.COLLECTION_PROFILES, schema);
