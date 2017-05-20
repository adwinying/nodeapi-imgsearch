const path    = require('path')
const https		= require('https')
const express = require('express')
const favicon = require('serve-favicon')
const mongodb = require('mongodb').MongoClient

const app = express()
const port = process.env.PORT || 8000
const dbURI = process.env.IMG_SEARCH_DB_URI
const imgSearchURI = process.env.IMG_SEARCH_URI

app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public/img/favicon.ico')))

function compileSearchData (arr, callback) {
	let results = arr.map((entry) => {
		return {
			url: entry.link,
			snippet: entry.snippet,
			thumbnail: entry.image.thumbnailLink,
			context: entry.image.contextLink
		}
	})

	callback(results)
}

app.get('/search/:query', (req, res) => {
	const queryString = encodeURIComponent(req.params.query)
	const startIndex = req.query.offset ? req.query.offset * 10 - 9 : 1
	const timeStamp = new Date();
	const httpsOptions = {
		host: 'www.googleapis.com',
		path: `${imgSearchURI}&q=${queryString}&start=${startIndex}`
	}

	console.log('startIndex:', startIndex)

	//AJAX call to Google API 
	https.get(httpsOptions, (apiRes) => {
		let JSONchunks = []

		apiRes.on('data', (chunk) => {
			JSONchunks.push(chunk)
		}).on('end', () => {
			let JSONdata = JSON.parse(Buffer.concat(JSONchunks))

			compileSearchData(JSONdata.items, (data) => {
				res.json(data)
			})
		})
	})

	//Log search query in mongoDB instance
	mongodb.connect(dbURI, (err, db) => {
		if (err) throw err

		let collection = db.collection('logs')
		collection.insertOne({query: req.params.query, timestamp: timeStamp},
			(err, insResults) => {
				if (err) throw err
				
				console.log('DB insert success!')
				db.close()
			})
	})
}) 

//Get search logs
app.get('/logs', (req, res) => {
	mongodb.connect(dbURI, (err, db) => {
		if (err) throw err

		let collection = db.collection('logs')
		collection
			.find({})
			.sort({timestamp: -1})
			.limit(10)
			.toArray((err, docs) => {
				if (err) throw err

				let logs = docs.map((entry) => {
					return {
						query: entry.query,
						timestamp: entry.timestamp
					}
				})

				res.json(logs)
			})
	})
})

app.listen(port)
console.log('Listening at port', port)