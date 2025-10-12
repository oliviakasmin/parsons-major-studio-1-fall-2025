// load a default library that lets us read/write to the file system
const fs = require('fs');
// if you are running this locally, you will need to npm install request
// load a default library that lets us make HTTP requests (like calls to an API)
const request = require('request');

// the folder we will write into, make sure the folder is in your directory
let folder = "downloads";

// download the image by url, name the file by filename
function downloadImage(uri, filename, callback){
  try {
    request.head(uri, function(err, res, body){
      if (err) {
        console.error(`HEAD request failed for ${filename}:`, err.message);
        callback(err);
        return;
      }
      // console.log('content-type:', res.headers['content-type']);
      // console.log('content-length:', res.headers['content-length']);
      request(uri)
        .on('error', function(err) {
          console.error(`Download failed for ${filename}:`, err.message);
          callback(err);
        })
        .pipe(fs.createWriteStream(folder + "/" + filename))
        .on('close', callback)
        .on('error', function(err) {
          console.error(`Write failed for ${filename}:`, err.message);
          callback(err);
        });
    });
  } catch (err) {
    console.error(`Exception for ${filename}:`, err.message);
    callback(err);
  }
};

// go through the json we created before
function downloadData() {
  fs.readFile("./data.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    try {
      JSON.parse(data).forEach(e => {
        console.log('Downloading ' + e.filename);
        downloadImage(e.primaryImage, e.filename, function(err){
          if (err) {
            console.log('Error downloading ' + e.filename);
          } else {
            console.log('Finished Downloading ' + e.filename);
          }
        });
      });
    } catch (err) {
      console.error('Error parsing data.json:', err.message);
    }
  });
}

downloadData();
