//api: https://developer.spotify.com/technologies/web-api
var _ = sp.require('libs/js/underscore')._;
var m = sp.require('sp://import/scripts/api/models');

//search for track by artist name and track name and trigger callback afterwards
exports.searchForTrack = function (artist, track, callback) {
  var q = $.param({q: ['artist:' + artist, 'track:' + track].join(' ')});
  //http://ws.spotify.com/search/1/track.json?q=artist%3ABat+for+Lashes+track%3AHorses+of+the+Sun
  $.getJSON('http://ws.spotify.com/search/1/track.json?' + q)
      .success(function (data) {
        var tracks = [];

        data.tracks.forEach(function (track) {
          var territories = track.album.availability.territories;

          if (territories == 'worldwide' ||
              territories.split(' ').indexOf(sp.core.country) >= 0) {
            tracks.push(m.Track.fromURI(track.href));
          }
        });

        if (callback) callback(null, tracks);
      })
      .error(function (err) { if (callback) callback(err) });
}

//returns top albums (tagged with 'heavy rotation')
//hardcoded to a json instead 
exports.getTopAlbumsFile  = function (callback) {
  var jsonString = '{"top_albums":[{"artist":"Chandeliers","label":"Pickled Egg","release":"Dirty Moves","play_count":"15","lastfm_urls":{"med_image":"http://userserve-ak.last.fm/serve/64s/68918564.jpg","sm_image":"http://userserve-ak.last.fm/serve/34s/68918564.jpg","_processed":true,"large_image":"http://userserve-ak.last.fm/serve/174s/68918564.jpg"}},{"artist":"The Promise Ring","label":"ANTI-","release":"Wood/Water","play_count":"10","lastfm_urls":{"med_image":"http://userserve-ak.last.fm/serve/64s/8670313.jpg","sm_image":"http://userserve-ak.last.fm/serve/34s/8670313.jpg","_processed":true,"large_image":"http://userserve-ak.last.fm/serve/174s/8670313.jpg"}},{"artist":"Beck","label":"DGC","release":"Midnite Vultures","play_count":"5","lastfm_urls":{"med_image":"http://userserve-ak.last.fm/serve/64s/84092723.png","sm_image":"http://userserve-ak.last.fm/serve/34s/84092723.png","_processed":true,"large_image":"http://userserve-ak.last.fm/serve/174s/84092723.png"}}]}';
  jsonObject = jQuery.parseJSON( jsonString );

  if (callback) callback(null, jsonObject);
}

//returns top albums (tagged with 'heavy rotation')
exports.getTopAlbums = function (callback) {
  $.ajax({
    async: true,
    url: 'https://chirpradio.appspot.com/api/stats?src=chirpradio-spotify',
    dataType: "json",
    success: function(data) {
      //jsonObject = jQuery.parseJSON( data );
      if (callback) callback(null, data);
    },
    error: function(data) {
      if (callback) callback(data);
    },
  });
}

exports.getBestOf = function (callback, the_year, track_num_begin, track_num_end) {
  //console.log("getBestOf called: " + the_year + " track_num_begin=" + track_num_begin + " track_num_end="  + track_num_end);
  $.ajax({
    async: true,
    url: 'best_of_' + the_year + '.json',
    dataType: "json",
    success: function(data) {
      //jsonObject = jQuery.parseJSON( data );
      if (callback) callback(null, data, the_year, track_num_begin, track_num_end);
    },
    error: function(data) {
      if (callback) callback(data);
    },
  });
}

//search for album by artist name and album name and trigger callback afterwards
exports.searchForAlbum = function (artist, album, callback) {
  var q = $.param({q: ['artist:' + artist, 'album:' + album].join(' ')});
  //Format: http://ws.spotify.com/search/1/album.json?q=artist%3ABat+for+Lashes+album%3AThe+Haunted+Man

  $.ajax({
    async: true,
    url: 'http://ws.spotify.com/search/1/album.json?' + q,
    dataType: "json",
    success: function(data) {
      var albums = [];

      data.albums.forEach(function (album) {
        var territories = album.availability.territories;

        if (territories == 'worldwide' ||
            territories.split(' ').indexOf(sp.core.country) >= 0) {
          albums.push(m.Album.fromURI(album.href));
        }
      });

      if (callback) callback(null, albums, artist, album);
    },
    error: function(data) {
      if (callback) callback(err);
    },
  });

  // this is the getJSON way to fetch the album info:
  // $.getJSON('http://ws.spotify.com/search/1/album.json?' + q)
  //     .success(function (data) {
  //       var albums = [];

  //       data.albums.forEach(function (album) {
  //         var territories = album.availability.territories;

  //         if (territories == 'worldwide' ||
  //             territories.split(' ').indexOf(sp.core.country) >= 0) {
  //           albums.push(m.Album.fromURI(album.href));
  //         }
  //       });

  //       if (callback) callback(null, albums);
  //     })
  //     .error(function (err) { if (callback) callback(err) });
}
