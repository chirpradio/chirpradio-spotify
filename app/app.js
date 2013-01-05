//forked from https://github.com/alexmic/mood-knobs
var spm = sp.require("app/spotify-metadata"),
    m   = sp.require('sp://import/scripts/api/models'),
    ui  = sp.require("sp://import/scripts/ui");
 views  = sp.require("sp://import/scripts/api/views");


m.application.observe(m.EVENT.ARGUMENTSCHANGED, handleArgs);

function handleArgs() {
    var args = m.application.arguments;
    console.log(args);
    $(".tabpage").hide();   // Hide all sections
    $("#"+args[0]).show();  // Show current section
    spm.getBestOf2012(onTopAlbumsLookupReturn);

    // If there are multiple arguments, handle them accordingly
    // if(args[1]) {       
    //     switch(args[0]) {
    //         case "top_recent":
                
    //             break;
    //         case "best_of_2012":
    //             socialInput(args[1]);
    //             break;
    //     }
    // }
};

var Album = function(data)
{
    var title    = data.title,
        artist   = data.artist_name,
        description,
        artistId = data.artist_id, 
        top      = 0,
        album    = null,
        id       = null,
        pl       = null,
        elem     = $("<article class='track'>" +
                   "<p>" +
                        "<strong class='artist'>" + artist + "</strong>" +
                        //"<span class='song'>" + title + "</span> from" + 
                        "<em class='album'>" + title + "</em>" +
                        //<span class="label">(Island)</span> 
                    "</p>" +
                    "<button id='savePlaylist' class='add-playlist sp-button sp-icon'> <span class='sp-plus'></span>Add as Playlist</button>" +
                    "</article>");
        elemDiv  = $("<div style='display:block'>" +
                      "<div class='dets'>" + 
                        "<div class='artist'>" +
                            artist +
                        "</div>" +
                        "<div class='title'>" +
                            title +
                        "</div>" +
                      "</div>");
                    
    //callback when Spotify search API is called
    var onSearchReturn = function(err, albums, artist, album_name) {
        if (err) {
            throw "error hitting the Spotify search API";
        }
        if (albums && albums.length > 0) {
            album = albums[0];
            id  = album.uri.split(":")[2];
            //album = m.Album.fromURI(album.uri);
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

            //adding artifical delay for an unexplainable bug (album cover not showing)
            setTimeout(function() { player.context = album;}, 1000);
            //player.context = album;

            //custom album cover image
            //var image = new views.Image("mySource", album.data.cover, album.name);
            //$(player.node).find('.sp-player-image').replaceWith(image.node);

            $(elem).prepend(player.node);
            $('#container').append(elem)

        } else {
            console.log('The album "' + artist + ' - ' + album_name + '" was not found by Spotify album search API.');
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
    //callback function when top albums are looked up
    var onTopAlbumsLookupReturnFile = function(err, albums) {
        albums.top_albums.forEach(function (top_album) {
            data=new Object();
            data.title = top_album.release
            data.artist_name = top_album.artist
            data.artist_id=0;
            album = new Album(data);
            album.draw(0);
        });
    }

    var onTopAlbumsLookupReturn = function(err, albums) {

        $('#spinner').hide();
        $(document.body).css("background-color", "#ECEBE8")
        
        albums.this_week.releases.forEach(function (top_album) {
            data=new Object();
            data.title = top_album.release
            data.artist_name = top_album.artist
            data.artist_id=0;
            album = new Album(data);
            album.draw(0);
        });
    }

    return {
        init: function()
        {
            //spm.getTopAlbumsNoJQuery(onTopAlbumsLookupReturn);
            spm.getTopAlbums(onTopAlbumsLookupReturn);
            return this;
        }        
    };

};

exports.App  = App;
exports.Album = Album;