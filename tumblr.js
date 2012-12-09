( function ( window ) {
  var $ = function ( selector, context ) {
    return ( context || document ).querySelector( selector );
  },

  Tumblr = {
    apiKey: 'PyezS3Q4Smivb24d9SzZGYSuhMNPQUhMsVetMC9ksuGPkK1BTt',
    changeImageDelay: 10000,
    requestDelay: 5000,
    offsetIncrement: 20,
    imageHolder: $( '#image-holder' ),
    postCountChangedCallback: undefined,

    url: function ( blog ) {
      return 'http://api.tumblr.com/v2' +
             '/blog/' + blog.name + '.tumblr.com/posts?' +
             'api_key=' + Tumblr.apiKey +
             '&offset=' + blog.offset +
             ( blog.tag.length ? '&tag=' + blog.tag : '' ) +
             '&callback=Tumblr.response';
    },

    init: function ( names ) {
      Tumblr.blogs = Tumblr.initBlogs( names );

      Tumblr.changeImage();
      Tumblr.initKeyboard();
      Tumblr.request( Tumblr.currentBlog );
    },

    initKeyboard: function () {
      key( 'x', function () { 
        Tumblr.purgeCurrentImage();
        Tumblr.changeImage();
      } );

      key( 'n', function () {
        Tumblr.changeImage();
      } );
    },

    initBlogs: function ( names ) {
      return names.map ( function ( name ) {
        var segments = name.split( '#' );
        var blog = Tumblr.storage.get( name );

        return blog || {
          storageKey: name,
          name:       segments[0],
          tag:        segments[1] || '',
          offset:     0,
          posts:      []
        }
      } );
    },

    request: function ( blog ) {
      var element = document.createElement( 'script' );
      var url = Tumblr.url( blog );

      element.setAttribute( 'src', url );
      document.documentElement.appendChild( element );
    },

    response: function ( json ) {
      var blog = Tumblr.blogs.find( function ( blog ) {
        return ( blog.name == json.response.blog.name );
      } );

      if ( json.response.posts.length > 0 ) {
        var gifs = Tumblr.getGifs( json.response.posts );

        if ( gifs.length > 0 ) {
          blog.posts = blog.posts.concat( gifs );
          blog.offset += Tumblr.offsetIncrement;
          Tumblr.storage.set( blog );

          if ( Tumblr.postCountChangedCallback ) {
            Tumblr.postCountChangedCallback( blog );
          }

          if ( !Tumblr.currentImage ) {
            Tumblr.changeImage();
          }
        }

        setTimeout( function () {
          Tumblr.request ( blog );
        }, Tumblr.requestDelay );
      }
    },

    getGifs: function ( posts ) {
      return posts.reduce( function( photos, post ) {
        switch ( post.type ) {
          case "photo":
            return photos.concat( Tumblr.extractGifsFromPostPhotos( post.photos ) );
          case "text":
            return photos.concat( Tumblr.extractGifsFromHtml( post.body ) );
          default:
            return photos;
        }
      }, [] );
    },

    extractGifsFromPostPhotos: function ( photos ) {
      var photoUrls = photos.map( function( photo ) {
        return photo.original_size.url;
      } );
      return photoUrls.filter( function( url ) {
        return url.match( /\.gif$/ );
      } );
    },

    extractGifsFromHtml: function ( html ) {
      return html.match( /http[^"]*?\.gif/g );
    },

    changeImage: function () {
      clearTimeout ( Tumblr.changeImageTimeoutId );

      Tumblr.currentBlog = Tumblr.blogs.rand() || null;
      Tumblr.currentImage = Tumblr.currentBlog.posts.rand() || null;

      var preload = new Image();

      preload.onload = function () {
        Tumblr.imageHolder.style.backgroundImage = 'url(' + Tumblr.currentImage + ')';
        Tumblr.changeImageTimeoutId = setTimeout( Tumblr.changeImage, Tumblr.changeImageDelay );
      };

      preload.onerror = function () {
        Tumblr.changeImageTimeoutId = setTimeout( Tumblr.changeImage, 0 );
      };

      preload.src = Tumblr.currentImage;
    },

    purgeCurrentImage: function () {
      var imageIndex = Tumblr.currentBlog.posts.indexOf( Tumblr.currentImage );

      if ( imageIndex >= 0 ) {
        Tumblr.currentBlog.posts.splice( imageIndex, 1 );
        Tumblr.storage.set( Tumblr.currentBlog );
      }
    },

    storage: {
      get: function ( storageKey ) {
        var blog = localStorage.getItem( storageKey );
        if (blog)
          return JSON.parse( blog );
        else
          return null;
      },

      set: function ( blog ) {
        localStorage.setItem( blog.storageKey, JSON.stringify( blog ) );
      }
    }
  },

  // General utils
  Util = {
    // Thanks http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
    getParameterByName: function ( name ) {
      var match = RegExp( '[?&]' + name + '=([^&]*)' ).exec( window.location.search );
      return match && decodeURIComponent( match[1] );
    }
  };

  Array.prototype.rand = function () {
    var index;

    if ( this.length > 0 ) {
      index = Math.floor( this.length * Math.random() );
      return this[index];
    }
  };

  Array.prototype.find = function ( predicate ) {
    return this.filter( predicate )[0];
  };

  var t = Util.getParameterByName( 't' ) || 'classics',
      viewingListEl = $( '.viewing-list' ),
      blogTemplate = $( '#blog[type="text/template"]' ).innerHTML;

  window.Tumblr = Tumblr;
  Tumblr.init( t.split( ',' ) );

  Tumblr.postCountChangedCallback = function ( blog ) {
    $( '.blog[data-name="' + blog.name + '"] .count' ).innerHTML = blog.posts.length;
  }

  $( 'form' ).addEventListener( 'submit', function ( event ) {
    var blogs = Tumblr.blogs.map( function ( blog ) { return blog.name } ),
        newBlog = $( 'input', event.target ).value;
    
    blogs.push( newBlog );

    window.location.search = '?t=' + blogs;
    event.preventDefault();
  });

  // Update page elements
  Tumblr.blogs.forEach( function ( blog ) {
    var view = blogTemplate.replace( /\{\{ name \}\}/g, blog.name ).
               replace( /\{\{ count \}\}/g, blog.posts.length );

    viewingListEl.innerHTML += view;
  });

}( window ) );
