import ProfileFollowersHistoryBL from './../../src/api/modules/profile-followers-history/profile-followers-history.bl';
import Context from './../../src/api/config/context';
import DBHelpers from './../lib/db-helpers';
import _ from 'lodash';
import Promise from 'bluebird';

describe( 'profile-followers-history.bl', () => {

  let dbHelpers;
  let context;

  before( ( done ) => {
    context = Context.instance();
    dbHelpers = new DBHelpers();
    dbHelpers.dropDatabase( done );
  } );

  beforeEach( () => {
    return Promise.all( [
      ProfileFollowersHistoryBL.removeAll()
    ] );
  } );

  it( 'has some methods', () => {
    expect( ProfileFollowersHistoryBL ).to.have.a.property( 'ensure' );
    expect( ProfileFollowersHistoryBL ).to.have.a.property( 'getActiveFollowersByProfile' );
    expect( ProfileFollowersHistoryBL ).to.have.a.property( 'count' );
    expect( ProfileFollowersHistoryBL ).to.have.a.property( 'countByProfileId' );
    expect( ProfileFollowersHistoryBL ).to.have.a.property( 'removeByProfileId' );
    expect( ProfileFollowersHistoryBL ).to.have.a.property( 'removeAll' );
  } );

  it( '`removeAll` removes all documents', () => {
    return ProfileFollowersHistoryBL.removeAll()
      .then( ( result ) => {
        expect( result ).to.exist;
        expect( result ).to.have.property( 'message' );
        expect( result ).to.have.property( 'result' );
        expect( result ).to.have.property( 'result' ).to.have.property( 'ok' );
      } );
  } );

  it( '`ensure` creates a new entry (with default values)', () => {

    let doc = {
      profile_id: 1,
      user_id: 1
    };

    return ProfileFollowersHistoryBL.ensure( _.clone( doc ) )
      .then( ( result ) => {
        expect( result ).to.exist;
        expect( result ).to.have.property( 'profile_id' );
        expect( result ).to.have.a.property( 'date_from' ).to.exist;
        expect( result ).to.have.a.property( 'date_to' ).to.not.exist;
        expect( result ).to.have.a.property( 'last_check' ).to.exist;
      } )
      .then( () => { return ProfileFollowersHistoryBL.countByProfileId( doc.profile_id ) })
      .then( (count) => {
        expect(count).to.be.equal(1);
      })

  } );

  it( '`save` does not create a new entry for same profile_id, user_id combination (if date_to is null)', () => {

    let doc1 = {
      profile_id: 1,
      user_id: 1,
      date_from: new Date().setUTCHours( 0, 0, 0, 0 )
    };
    let doc2 = {
      profile_id: 1,
      user_id: 1,
      date_from: new Date().setUTCHours( 0, 0, 0, 0 )
    };

    return ProfileFollowersHistoryBL.ensure( _.clone( doc1 ) )
      .then( () => { return Promise.delay( 1000 ) } )
      .then( () => { return ProfileFollowersHistoryBL.ensure( _.clone( doc2 ) ) } )
      .then( ( result ) => {
        expect( result ).to.exist;
        expect( result.date_to ).to.not.exist;
        expect( result ).to.have.property( 's5r_created_at' );
        expect( result ).to.have.property( 's5r_updated_at' );

        // last_check should be larger than the creation date
        expect( result.s5r_created_at.getTime() ).to.be.below( result.s5r_updated_at.getTime() );
      } )
      .then( () => { return ProfileFollowersHistoryBL.count() } )
      .then( ( count ) => {
        expect( count ).to.be.equal( 1 );
      } )
  } );

  it( '`ensure` => last_check gets updated on findOneAndUpdate', () => {
    let doc1 = {
      profile_id: 1,
      user_id: 1,
      date_from: new Date().setUTCHours( 0, 0, 0, 0 )
    };
    let doc2 = {
      profile_id: 1,
      user_id: 1,
      date_from: new Date().setUTCHours( 0, 0, 0, 0 )
    };

    let vLastCheck1;
    let vLastCheck2;
    return ProfileFollowersHistoryBL.ensure( _.clone( doc1 ) )
      .then( ( result ) => {
        expect( result ).to.have.property( 'last_check' );
        vLastCheck1 = result.last_check.getTime();
      } )
      .then( () => { return Promise.delay( 1000 ) } )
      .then( () => { return ProfileFollowersHistoryBL.ensure( _.clone( doc2 ) ) } )
      .then( ( result ) => {
        expect( result ).to.have.property( 'last_check' );
        vLastCheck2 = result.last_check.getTime();
        expect( vLastCheck1 ).to.be.below( vLastCheck2 );
      } )

  } );

  it( '`ensure` creates a new entry for the same profile_id, user if date_to is not null', () => {
    let dateToday = new Date();
    let doc1 = {
      profile_id: 1,
      user_id: 1,
      date_from: new Date( dateToday.setDate( dateToday.getDate() - 2 ) ).setUTCHours( 0, 0, 0, 0 ),
      date_to: new Date( dateToday.setDate( dateToday.getDate() - 1 ) ).setUTCHours( 0, 0, 0, 0 )
    };
    let doc2 = {
      profile_id: 2,
      user_id: 1,
      date_from: new Date().setUTCHours( 0, 0, 0, 0 )
    };

    return ProfileFollowersHistoryBL.ensure( _.clone( doc1 ) )
      .then( () => { return ProfileFollowersHistoryBL.ensure( _.clone( doc2 ) ) } )
      .then( () => { return ProfileFollowersHistoryBL.count() } )
      .then( ( count ) => {
        expect( count ).to.be.equal( 2 );
      } )
  } );

  it( '`ensure` can also handle multiple entries', () => {

    let doc1 = {
      profile_id: 1,
      user_id: 1,
      date_from: new Date().setUTCHours( 0, 0, 0, 0 )
    };
    let doc2 = {
      profile_id: 2,
      user_id: 1,
      date_from: new Date().setUTCHours( 0, 0, 0, 0 )
    };

    let docs = [];
    docs.push( doc1 );
    docs.push( doc2 );

    return ProfileFollowersHistoryBL.ensure( docs )
      .then( ( result ) => {
        expect( result ).to.be.an.array;
        expect( result ).to.be.of.length( 2 );
      } )
      .then( () => { return ProfileFollowersHistoryBL.count() } )
      .then( ( count ) => {
        expect( count ).to.be.equal( 2 );
      } )

  } );

  it( '`removeByProfile` removes only the entries for the profile', () => {
    let doc1 = {
      profile_id: 1,
      user_id: 1,
      date_from: new Date().setUTCHours( 0, 0, 0, 0 )
    };
    let doc2 = {
      profile_id: 2,
      user_id: 1,
      date_from: new Date().setUTCHours( 0, 0, 0, 0 )
    };

    return ProfileFollowersHistoryBL.ensure( _.clone( doc1 ) )
      .then( () => { return ProfileFollowersHistoryBL.ensure( _.clone( doc2 ) )} )
      .then( () => { return ProfileFollowersHistoryBL.removeByProfileId( doc2.profile_id )} )
      .then( () => { return ProfileFollowersHistoryBL.count()} )
      .then( ( count ) => {
        expect( count ).to.be.equal( 1 );
      } )

  } );

  it( '`getActiveFollowersByProfile` returns the active followers only', () => {

    let dateToday = new Date();
    let doc1 = {
      profile_id: 1,
      user_id: 1,
      date_from: new Date( dateToday.setDate( dateToday.getDate() - 5 ) ).setUTCHours( 0, 0, 0, 0 ),
      date_to: new Date( dateToday.setDate( dateToday.getDate() - 4 ) ).setUTCHours( 0, 0, 0, 0 )
    };
    let doc2 = {
      profile_id: 1,
      user_id: 1,
      date_from: new Date( dateToday.setDate( dateToday.getDate() - 3 ) ).setUTCHours( 0, 0, 0, 0 ),
      date_to: new Date( dateToday.setDate( dateToday.getDate() - 2 ) ).setUTCHours( 0, 0, 0, 0 )
    };
    let doc3 = {
      profile_id: 1,
      user_id: 1,
      date_from: new Date( dateToday.setDate( dateToday.getDate() - 4 ) ).setUTCHours( 0, 0, 0, 0 )
    };

    return ProfileFollowersHistoryBL.ensure( _.clone( doc1 ) )
      .then( () => { return ProfileFollowersHistoryBL.ensure( _.clone( doc2 ) ) } )
      .then( () => { return ProfileFollowersHistoryBL.ensure( _.clone( doc3 ) ) } )
      .then( () => {return ProfileFollowersHistoryBL.count()} )
      .then( ( count ) => {

        // 3 in total
        expect( count ).to.be.equal( 3 );
      } )
      .then( () => { return ProfileFollowersHistoryBL.getActiveFollowersByProfile( doc1.profile_id ) } )
      .then( ( result ) => {
        expect( result ).to.exist.and.to.be.an.array;

        // but only 1 active
        expect( result ).to.have.length( 1 );
      } )
  } )

} );
