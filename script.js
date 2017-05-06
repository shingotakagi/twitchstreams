function requestJSONP(url) {
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

function handleResponse(json) {
    document.querySelector('#streams').innerHTML = json;
}

var url = 'https://api.twitch.tv/kraken/search/stream?q=starcraft&callback=handleResponse';

requestJSONP(url);
