// --------------------------------------------------------------------
// These are our app constants.
// --------------------------------------------------------------------
var itemsPerPage = 10; // Number of items per page.
var client_id = 'h14o7walghh59dwsq2939t2seiyrek'; // Our Twicth client id. 
var twitch_api = 'https://api.twitch.tv/kraken/search/streams'; // Our Twitch end point.
var thumbnail_width = 100; // Thumbnail width.
var thumbnail_height = 100; // Thumbnail height.

// --------------------------------------------------------------------
// This is our singleton object which wraps a JSONP response object.
// It can also make JSONP requests to fill itself up with a response. 
// --------------------------------------------------------------------

// The results singleton object. The methods follow below.
var results = {
  json: null
}

// Request the first page of results.
results.requestFirstPage = function(searchTerm) {
    var url = twitch_api;
    url += '?' + 'limit=' + this.getItemsPerPage();
    url += '&' + 'q=' + searchTerm;
    url = this.decorateURL(url);
    this.makeRequest(url);
}

// Request the next page of results.
results.requestNextPage = function() {
  // If we're on the last page, just do nothing.
  if (this.getPageIndex() >= this.getNumPages()) {
    return;
  }
  // Otherwise request the next page of results.
  var url = this.json._links.next;
  if (!url) {
    return;
  }
  url = this.decorateURL(url);
  this.makeRequest(url);
}

// Request the previous page of results.
results.requestPrevPage = function() {
  var url = this.json._links.prev;
  if (!url) {
    return;
  }
  url = this.decorateURL(url);
  this.makeRequest(url);
}

// Decorate the url with our client id and callback. 
results.decorateURL = function(url) {
    url += '&' + 'client_id=' + client_id;
    url += '&' + 'callback=results.handleResponse';
    return url;
}

// Make a JSONP request.
results.makeRequest = function(url) {
  // Create a script node holding our url.
  var script = document.createElement('script');
  script.src = url;
  
  // Make sure the script is removed from the DOM,
  // after it loads and executes.
  script.onload = function () {
    this.remove();
  };
  
  // Insert the script node as the last child of the head node.
  var head = document.getElementsByTagName('head')[0];
  head.insertBefore(script, null);
}

// Handle the response from a JSONP request.
results.handleResponse = function(json) {
  this.json = json;
  this.updateDOM();
}

// Get the number of response items.
results.getSize = function() {
  return this.json._total;   
}

// Get the number of items to display per page.
results.getItemsPerPage = function() {
  return itemsPerPage;
}

// Get the total number of pages.
results.getNumPages= function() {
  return Math.ceil(this.getSize() / this.getItemsPerPage())
}

// Get the current page index.
results.getPageIndex = function() {
  var regex = /&offset=([0-9]+)/;
  var matches = this.json._links.self.match(regex)
  if (!matches) {
      return 1;
  }
  return Number(matches[1])/this.getItemsPerPage() + 1;
}

// Update dom elements.
// This is the only method which interacts with the DOM element classes and IDs.
results.updateDOM = function() {
  document.querySelector('#num_results').innerHTML = "Total results: " + this.getSize();
  document.querySelector('.cursor_info').innerHTML = this.getPageIndex() + "/" + this.getNumPages();
  //console.log(JSON.stringify(this.json))

  // Remove any existing stream results.
  var node = document.querySelector('#streams')
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }

  // Get our result item template.
  var t = document.querySelector('#stream_template');
  var anchor = t.content.querySelector("#thumbnail_anchor");
  var img = t.content.querySelector(".stream_thumbnail");
  var display_name = t.content.querySelector(".stream_display_name");
  var name_and_viewers = t.content.querySelector(".stream_name_and_viewers");
  var description = t.content.querySelector(".stream_description");

      
  // Add the new stream results.
  var streams = document.querySelector("#streams");
  this.json.streams.forEach(
    function(stream) {
      // Update the template with info about the stream.
      anchor.href = stream.channel.url
      anchor.target = '_blank'
      img.src = stream.preview.template.replace("{width}", thumbnail_width).replace("{height}", thumbnail_height)
      display_name.innerHTML = stream.channel.display_name;
      name_and_viewers.innerHTML= stream.game + ' - ' + stream.viewers + ' viewers';
      description.innerHTML = stream.channel.status;

      // Clone the template and insert it into the DOM.
      var clone = document.importNode(t.content, true);
      streams.appendChild(clone);
    }
  )
}







