var Router = Backbone.Router.extend({

  routes: {
    "" : "index",
    "photo/:id" : "photoView",
    "index/:tag" : "index"
  },

  index: function(tag) {
    tag = tag || "potato";
    this.collection = new Photos(tag);

    var feed = new Feed({
      collection: this.collection
    });

    this.collection.fetch({
      success: function() {
        feed.render();
      }
    });
  },

  photoView: function(id) {
    var photo = this.collection.get(id),
        tag = this.collection.tag,
        view = new PhotoView(photo, tag);
    view.render();
  }
});

var Photo = Backbone.Model.extend({
});

var Photos = Backbone.Collection.extend({
  model: Photo,

  initialize: function(tag) {
    this.url = "https://api.flickr.com/services/feeds/photos_public.gne?tags=" +
               tag + "&tagmode=all&format=json&jsoncallback=?";
    this.tag = tag;
  },

  parse: function(payload) {
    var result = payload.items, regExp = /\(([^)]+)\)/;
    for (var i = 0; i < result.length; i++) {
      result[i].img = result[i].media.m;
      result[i].id = i;
      result[i].author_link = "https://www.flickr.com/photos/" +
                              result[i].author_id;
      result[i].author = regExp.exec(result[i].author)[1];
      result[i].published = result[i].published.slice(0, 10) + " at " +
                            result[i].published.slice(11, -1);
      result[i].tags = this.parseTags(result[i].tags);
    }
    return result;
  },

  parseTags: function(tags) {
    var tagArr = tags.split(" "), result = "", i;
    for (i = 0; i < tagArr.length; i += 1) {
      result += "<a href='#/index/" + tagArr[i] + "'>" + tagArr[i] +
                "</a> ";
    }
    return result;
  }
});

var Feed = Backbone.View.extend({
  el: $('#views'),

  initialize: function(options) {
    this.collection = options.collection;
    $(window).resize(function() {
      this.adjustElements();
    }.bind(this));
  },

  adjustElements: function() {
    var i;
    if (window.innerWidth < 800) {
      for (i = 0; i < this.collection.length; i++) {
        $('#published' + i).insertBefore($('#authorLink' + i));
      }
    } else {
      for (i = 0; i < this.collection.length; i++) {
        $('#authorLink' + i).insertBefore($('#published' + i));
      }
    }
  },

  template: _.template($('#feedTemplate').html()),

  render: function() {
    $(this.el).html(this.template({ photos: this.collection }));
    this.adjustElements();
  }
});

var PhotoView = Backbone.View.extend({
  el: $('#views'),

  initialize: function(photo, tag) {
    this.model = photo;
    this.tag = tag;
  },

  template: _.template($('#photoTemplate').html()),

  render: function() {
    $(this.el).html(this.template({ photo: this.model, tag: this.tag }));
  }
});

$(document).ready(function() {
  router = new Router();
  Backbone.history.start();
});
