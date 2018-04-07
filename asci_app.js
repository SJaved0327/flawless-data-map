var 
var canvas = require('canvas');

var image = new art.Image({
	filepath: './images/beyonce_blackboots.jpg',
	alphabet:'variant4'
});
image.write(function(err, rendered){
	console.log(rendered);
})