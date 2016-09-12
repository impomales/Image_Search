var express = require('express')
var app = express()

app.use(express.static('static'))

app.listen(8080, function() {
    console.log('App is listening on port 8080')
})