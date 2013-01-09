//forked from https://github.com/alexmic/mood-knobs
var spm = sp.require("app/spotify-metadata"),
    m   = sp.require('sp://import/scripts/api/models'),
    ui  = sp.require("sp://import/scripts/ui");
 views  = sp.require("sp://import/scripts/api/views");

function showBestOf(the_year) {
    $(".page").hide();   // Hide all sections
}

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
        data.container_id = "top_recent_albums"
        album = new Album(data);
        album.draw(0);
    });
}

var onBestOfAlbumsLookupReturn = function(err, albums, year, num_albums) {
    $('#spinner').hide();
    $(document.body).css("background-color", "#ECEBE8")

    if ($("#best_of_"+year).hasClass("loaded") == false) {
        elem = $("<div class='page best_of_overview'><h2>Best of "+ year +"</h2><section id='best_of_" + year + "'></section><a href='#'' onclick='showBestOf(" + year + ");' return false;'>See More</a></div>");   
        
        //TODO: add after top_recent section instead of end of body
        $(document.body).append(elem);       

        if(albums.top_albums.length > num_albums)
            short_list = albums.top_albums[0..num_albums+1];
        else
            short_list = albums.top_albums;

        short_list.forEach(function (top_album) {
            data=new Object();
            data.title = top_album.release;
            data.artist_name = top_album.artist;
            data.description = top_album.description;
            data.artist_id=0;
            data.container_id = "best_of_" + year;       
            album = new Album(data);
            album.draw(0);
        });
    }

    $("#best_of_"+year).addClass("loaded")
}

m.application.observe(m.EVENT.ARGUMENTSCHANGED, switchTabs);

function switchTabs() {
    var args = m.application.arguments;
    console.log(args);
    $(".page").hide();   // Hide all sections
    $("."+args[0]).show();  // Show current section

    for (the_year = 2009; the_year <= 2012; the_year++) {
    //for (the_year = 2012; the_year >= 2009; the_year--) {
        spm.getBestOf(onBestOfAlbumsLookupReturn, the_year, 5);
    }
};

function showBestOf(the_year) {
    $(".page").hide();   // Hide all sections
}

var Album = function(data)
{
    var title    = data.title,
        artist   = data.artist_name,
        description = data.description,
        container_id = data.container_id,
        artistId = data.artist_id, 
        top      = 0,
        album    = null,
        id       = null,
        pl       = null,
        elem     = $("<article class='track'>" +
                   "<p>" +
                        "<strong class='artist'>" + artist + "</strong>" +
                        //"<span class='song'>" + title + "</span> from" + 
                        "<em class='album'>" + title + "</em>" + (description ? description.substring(0, 50)+"..." : "") +
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
            $("#"+container_id).append(elem);

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