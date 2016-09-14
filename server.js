var express = require('express')
var request = require('request')
var path = require('path')
var mongodb = require('mongodb').MongoClient
var APIKey = 'AIzaSyAHFb4ozKgoWHio22rppfZeC9yUhGLHnuc'
var CX = '014771138082796526328:bxbjznwjq-m'
var app = express()
var db

app.use(express.static(path.join(__dirname, 'static')))

app.get('/latest', function(req, res) {
    // return ten most recent using find query.
    db.collection('queries').find({}, {_id: 0}).sort({when: -1}).limit(10).toArray(function(err, docs) {
        if (err) throw err
        res.json(docs)
    })
})

app.get('/:query', function(req, res) {
    // use google api to search with given query.
    // need api key etc, read google documentation.
    var query = req.params.query
    if (query == 'favicon.ico') {
        res.end()
        return
    }
    
    // use request for get request to google server.
    var url = 'https://www.googleapis.com/customsearch/v1?searchType=image&key=' + APIKey + '&cx=' + CX + '&q=' + query
    
    var offset = req.query.offset ? '&start=' + (parseInt(req.query.offset) + 1) : ''
    
    url += offset
    
    request(url, function(err, response, body) {
        if (err) throw err
        
        if (response.statusCode == 403) res.send('free query limit reached')
        
        if (response.statusCode == 200) {
            // add query to database here.
            // req.params.query and current time.
            var latest = {
                term: query, 
                when: (new Date()).toString()
            }
            db.collection('queries').insertOne(latest, function(err, doc) {
                if (err) throw err
                console.log(doc.ops)
            })
            var items = JSON.parse(body).items
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



var dbUrl = 'mongodb://' + process.env.IP + ':27017/querydb'

mongodb.connect(dbUrl, function(err, dbConn) {
    if (err) throw err
    db = dbConn
    var server = app.listen(process.env.PORT || 8080, function() {
        console.log('App is listening on port ' + server.address().port)
    })
})
