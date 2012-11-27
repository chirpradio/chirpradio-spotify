//forked from https://github.com/alexmic/mood-knobs
var spm = sp.require("app/spotify-metadata"),
    m   = sp.require('sp://import/scripts/api/models'),
    ui  = sp.require("sp://import/scripts/ui");
 views  = sp.require("sp://import/scripts/api/views");

var Album = function(data)
{
    var title    = data.title,
        artist   = data.artist_name,
        artistId = data.artist_id, 
        top      = 0,
        album    = null,
        id       = null,
        pl       = null,
        elem     = $("<div style='display:block'>" +
                      "<div class='dets'>" + 
                        "<div class='artist'>" +
                            artist +
                        "</div>" +
                        "<div class='title'>" +
                            title +
                        "</div>" +
                        "<button id='savePlaylist' class='add-playlist sp-button sp-icon' <span class='sp-plus'></span>Add as Playlist</button>" +
                      "</div>");
                    
    var onSearchReturn = function(err, albums) {
        if (err) {
            throw "error hitting the Spotify search API";
        }
        if (albums && albums.length > 0) {
            album = albums[0];
            id  = album.uri.split(":")[2];
            $(elem).attr("id", id);
            //var img = new ui.SPImage(album.data.cover);
            //$(elem).append(img.node);
            var player = new views.Player();
            //$(elem).append(album.node);

            $(elem).find("#savePlaylist").click((function(a){
                return function() {

                pl = new m.Playlist(album.name);
                $.each(album.tracks,function(index,track) {
                    pl.add(m.Track.fromURI(track.uri));
                });
                    //pl.name  = album.name;

                    //var playlist = m.Playlist.fromURI(a.uri);
                    pl.subscribed = true;
                    pl.observe(m.EVENT.CHANGE, function() {
                        console.log("Playlist is subscribed!");
                    });
                }
            })(album));

            player.track = null;
            setTimeout(function() { player.context = album;}, 500);
            //player.context = album;

            //var image = new views.Image("mySource", album.data.cover, album.name);
            //$(player.node).find('.sp-player-image').replaceWith(image.node);

            $(elem).prepend(player.node);
            $('#container').append(elem)

        } else {
            console.log('No albums found.');
        }
    }
    
    spm.searchForAlbum(artist, title, onSearchReturn);
    
    return {
        album: function() {
            return album;
        },
        title: function() {
            return title;
        },
        artist: function() {
            return artist;
        },
        id: function() {
            return id;
        },
        draw: function(fade) {
            //$("#anim").prepend(elem);
            if (fade) {
                elem.fadeIn();
            } else {
                //$('#container').append(elem)
                //elem.show();
            }
        }
    };
};

var App = function()
{
    return {
        init: function()
        {
            data=new Object();
            data.title = "American Beauty";
            data.artist_name="Grateful Dead";
            data.artist_id=0;
            album = new Album(data);
            album.draw(0);
            return this;
        }        
    };

};

exports.App  = App;
exports.Album = Album;