var express = require('express')
var request = require('request')
var APIKey = 'AIzaSyAHFb4ozKgoWHio22rppfZeC9yUhGLHnuc'
var CX = '014771138082796526328:bxbjznwjq-m'
var app = express()

app.use(express.static('static'))

app.get('/:query', function(req, res) {
    // use google api to search with given query.
    // need api key etc, read google documentation.
    var query = req.params.query
    
    // use request for get request to google server.
    var url = 'https://www.googleapis.com/customsearch/v1?searchType=image&key=' + APIKey + '&cx=' + CX + '&q=' + query
    
    var offset = req.query.offset ? '&start=' + (parseInt(req.query.offset) + 1) : ''
    
    url += offset
    
    request(url, function(err, response, body) {
        if (err) throw err
        console.log(url)
        var bodyParsed = JSON.parse(body)
        
        if (response.statusCode == 403) res.send('limit reached')
        
        if (response.statusCode == 200) {
            var items = JSON.parse(body).items
            console.log(items)
            var results = []
            
            items.forEach(function(item) {
                var result = {
                    url: item.link,
                    snippet: item.snippet,
                    thumbnail: item.image.thumbnailLink,
                    context: item.image.contextLink
                }
                results.push(result)
            })
            
            res.json(results)
        }
    })
})

app.get('/latest', function(req, res) {
    // store search in a database, return ten most recent.
})

app.listen(8080, function() {
    console.log('App is listening on port 8080')
})