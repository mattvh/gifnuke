#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var request = require('request');
var FFmpeg = require('fluent-ffmpeg');
var exec = require('child_process').exec;



// Get input file
var args = process.argv.slice(2);
if (!args[0] || !args[1]) {
	console.log('Usage: gifnuke input.gif output');
	console.log('Output format is WebM.');
	console.log('If the video looks wrong, you may need to use the --coalesce argument.');
	console.log('--coalesce requires that Imagemagick be installed.');
	process.exit(1);
}
if (/^(f|ht)tps?:\/\//i.test(args[0])) {
	downloadFile(args[0]);
} else {
	var inputFile = path.resolve(__dirname, args[0]);
	convertFile(inputFile, args[1], args[2], function() {
		console.log("Conversion complete");
	});
}



// Download remote files
function downloadFile(url) {
	var tmpFile = '/tmp/gifnuke-' + new Date().getTime() + '.gif';
	console.log("Downloading GIF");
	request.get({url: url, encoding: 'binary'}, function (err, response, body) {
		fs.writeFile(tmpFile, body, 'binary', function(err) {
			if (err) {
				console.log(err);
			} else {
				convertFile(tmpFile, args[1], args[2], function() {
					fs.unlinkSync(tmpFile);
					console.log("Conversion complete");
				});
			}
		});
	});
}



// Handle conversion
function convertFile(input, output, coalesce, cb) {

	console.log("Converting");

	coalesceGIF(input, coalesce, function(input) {
		var ch = new FFmpeg({ source: input })
			.withNoAudio()
			.toFormat('webm')
			.on('progress', function(progress) {
				process.stdout.write(".");
			})
			.on('error', function(err) {
				console.log('Cannot process GIF: ' + err.message);
			})
			.on('end', function() {
				process.stdout.write("\n");
				if (coalesce === "--coalesce") {
					console.log(input);
					fs.unlinkSync(input); //delete the file created in /tmp
				}
				cb();
			})
			.saveToFile('./'+output+'.webm');
	});

}



// Coalesce the GIF to fix partial frame voodoo
function coalesceGIF(input, coalesce, cb) {
	if (coalesce === "--coalesce") {
		console.log('Coalescing frames. This may take awhile.');
		var tmpFile = '/tmp/gifnuke-' + new Date().getTime() + '.gif';
		exec('convert "'+input+'" -coalesce '+tmpFile, function (err, stdout, stderr) {
			if (err) {
				console.log(err);
			} else {
				console.log("Coalescing complete. Resuming video encoding.");
				cb(tmpFile);
			}
		});
	} else {
		cb(input);
	}
}