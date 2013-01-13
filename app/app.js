sp  = getSpotifyApi(1);

var spm = sp.require("app/spotify-metadata"),
    m   = sp.require('sp://import/scripts/api/models'),
    ui  = sp.require("sp://import/scripts/ui");
 views  = sp.require("sp://import/scripts/api/views");

var BEST_OF_OVERVIEW_NUM_ALBUMS = 4;
var BEST_OF_OVERVIEW_TOTAL_ALBUMS = 25;

function seeMoreAlbumsOfTheYearOnClick(the_year) {
    //window.location = sp:app:chirp:arguments;
    var spm = sp.require("app/spotify-metadata");
    $(".page").hide();   // Hide all sections
    $("."+the_year).show();  // Show current section
    $(".more").show();   
    $(".see_more").hide();  

    if ($("#best_of_"+the_year).hasClass("loaded") == false)
        spm.getBestOf(onBestOfAlbumsLookupReturn, the_year, BEST_OF_OVERVIEW_NUM_ALBUMS, BEST_OF_OVERVIEW_TOTAL_ALBUMS);
}

function readMoreOnClick(id, description) {
    $(".page").hide();   // Hide all sections
    $(".best_of section article").not("#"+id.toString()).hide();
    $(".best_of").show();
    $(".see_more").hide();  
    $(".read_more").hide();
    $(".best_of_header").hide();
    $("#"+id + " p .description_long").show();
    $("#"+id + " p .description").hide();    
    $("#"+id).addClass("verbose");  
}

//callback function when top albums are looked up
var onTopAlbumsLookupReturnFile = function(err, albums) {id
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
        data.title = top_album.release;
        data.artist_name = top_album.artist;
        data.artist_id=0;
        data.label = top_album.label;
        data.container_id = "top_recent_albums"
        album = new Album(data);
        album.draw(0);
    });
}

var onBestOfAlbumsLookupReturn = function(err, albums, year, begin_album, end_album) {
    $('#spinner').hide();
    $(document.body).css("background-color", "#ECEBE8")
    var more = false;

    if ($("#best_of_"+year).hasClass("loaded") == false) {
        if(albums.top_albums.length > end_album) {
            //short_list = albums.top_albums[0..num_albums+1];
            short_list = albums.top_albums.slice(begin_album,end_album);
            $("#best_of_"+year).addClass("started");            
        }
        else if($("#best_of_"+year).hasClass("started") == true) {
            short_list = albums.top_albums.slice(begin_album,end_album);
            $("#best_of_"+year).addClass("loaded");
            more = true;
        }
        else {
            short_list = albums.top_albums;
            $("#best_of_"+year).addClass("loaded");
        } 

        short_list.forEach(function (top_album) {
            data=new Object();
            data.title = top_album.release;
            data.artist_name = top_album.artist;
            data.description = top_album.description;
            data.artist_id=0;
            data.container_id = "best_of_" + year;     
            data.year =  year;  
            data.label = top_album.label;
            if (more == true)
                data.more = true;
            album = new Album(data);
            album.draw(0);
        });
    }    
}

function switchTabs() {
    var args = m.application.arguments;
    console.log(args);
    $(".page").hide();   // Hide all sections
    $("."+args[0]).show();  // Show current section
    $(".see_more").show();
    $(".best_of section article").show();
    $(".best_of section article").removeClass('verbose');      
    $(".best_of section article p .description_long").hide();
    $(".best_of section article p .description").show();   
    $(".more").hide();   // Hide the rest of the albums
    $(".read_more").show();      
    $(".best_of_header").show();  
   

    if(args[0] == 'best_of') {
        for (the_year = 2009; the_year <= 2012; the_year++) {
            //for (the_year = 2012; the_year >= 2009; the_year--) {
            if ($("#best_of_"+the_year).hasClass("started") == false) {
                $('#spinner').show();
                $(document.body).css("background-color", "#ECEBE8")
                elem = $("<div class='page best_of " + the_year + "'><h2 class='best_of_header'>Best of "+ the_year +"</h2><section id='best_of_" + the_year + "'></section><a href='#' class='see_more' onclick='seeMoreAlbumsOfTheYearOnClick(" + the_year + ");'>See More</a></div>");
                //TODO: add after top_recent section instead of end of body
                $(document.body).append(elem);                 
                spm.getBestOf(onBestOfAlbumsLookupReturn, the_year, 0, BEST_OF_OVERVIEW_NUM_ALBUMS);
            }
        }
    }
};

var Album = function(data)
{
    var title    = data.title,
        artist   = data.artist_name,
        description = data.description,
        container_id = data.container_id,
        more     = data.more,
        artistId = data.artist_id,
        year     = data.year,
        label    = data.label, 
        top      = 0,
        album    = null,
        id       = null,
        pl       = null,
        elem     = $("<article class='track'>" +
                   "<p>" +
                        "<strong class='artist'>" + artist + "</strong>" +
                        //"<span class='song'>" + title + "</span> from" + 
                        "<em class='album'>" + title + "</em>" +
                        "<span class='label'>" + (label ? "Label: " + label : "") + "</span><br>" +
                        "<span class='description'>" + (description ? description.substring(0, 50)+"..." : "") + "</span>" +
                        "<span class='description_long' style='display:none;'>" + (description ? description : "") + "</span>" +                        
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

            if (description) {
                var link = document.createElement('a');
                link.href = "#"; 
                link.appendChild(document.createTextNode('Read More'));
                link.setAttribute('class', 'read_more');

                link.addEventListener("click", 
                    function (event) {
                        event.preventDefault();
                        readMoreOnClick(id, description);                
                    }, 
                    false);
                $(elem).append(link);
            }

            if (more == true)
                $(elem).addClass("more");          
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
            m.application.observe(m.EVENT.ARGUMENTSCHANGED, switchTabs);
            //spm.getTopAlbumsNoJQuery(onTopAlbumsLookupReturn);
            spm.getTopAlbums(onTopAlbumsLookupReturn);
            return this;
        }        
    };

};

exports.App  = App;
exports.Album = Album;