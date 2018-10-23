global._ = (str, params) => {}
global.gettext = (str, params) => {}

// Insert script tag which is needed by ExtJS for feature detection.
var script = document.createElement('script')
document.body.appendChild(script);

// quiet warning about missing viewport meta tag in modern
//var meta = document.createElement('meta');
//meta.setAttribute('name', 'viewport');
//meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes');
//document.body.appendChild(meta);
