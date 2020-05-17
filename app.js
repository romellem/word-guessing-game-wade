const express = require('express');
const morgan = require('morgan');
const got = require('got');

const app = express();
app.use(morgan('combined'));
app.use(express.static('public'));

app.get('/api/:phrase', (req, res) => {
	let { phrase } = req.params;
	phrase = String(phrase).trim();
	if (!phrase) {
		return res.json([]);
	}

	got(`https://relatedwords.org/api/related?term=${phrase}`)
		.json()
		.then((body) => {
			if (body.error) {
				return res.status(500);
			}

			// Trim entered word from responses. e.g. 'cloud' -> 'cumulus cloud' -> 'cumulus'
			let words = [];
			for (let { word } of body) {
				let trimmed_word = word
					.replace(new RegExp(`(\\s${phrase}|${phrase}\\s)`), '')
					.trim();
				if (trimmed_word) {
					words.push(trimmed_word);
				}
			}
			return res.json(words);
		})
		.catch((err) => {
			console.log(err);
			return res.status(500);
		});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Listening', PORT));
