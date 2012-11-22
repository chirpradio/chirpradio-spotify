//api: https://developer.spotify.com/technologies/web-api
var _ = sp.require('libs/js/underscore')._;
var m = sp.require('sp://import/scripts/api/models');

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

exports.searchForAlbum = function (artist, album, callback) {
  var q = $.param({q: ['artist:' + artist, 'album:' + album].join(' ')});
  //Format: http://ws.spotify.com/search/1/album.json?q=artist%3ABat+for+Lashes+album%3AThe+Haunted+Man

  $.ajax({
    async: false,
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

      if (callback) callback(null, albums);
    },
     error: function(data) {
      if (callback) callback(err);
    },   
  });
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
