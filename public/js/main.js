/**
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */
var shuffle = function (array) {
	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let category = $('#category');
let submit = $('#category-submit');
let cards = $('.cards');

submit.addEventListener('click', (e) => {
	submit.disabled = true;
	submit.textContent = 'Loading...';

	let value = category.value;

	fetch(`/api/${value}`)
		.then((r) => r.json())
		.then((items) => {
			submit.disabled = false;
			submit.textContent = 'Submit';

			let top_ten = items.slice(0, 10);
			let twenty = shuffle(items.slice(10, 20));
			let thirty = shuffle(items.slice(20, 30));
			let forty = shuffle(items.slice(30, 40));
			let remaining = twenty
				.slice(5)
				.concat(thirty.slice(5))
				.concat(forty.slice(5))
				.concat(items.slice(40));

			// 10 + 5 + 5 + 5 = 25
			let chosen = top_ten
				.concat(twenty.slice(0, 5))
				.concat(thirty.slice(0, 5))
				.concat(forty.slice(0, 5));

			// Map items to DOM
			cards.remaining = remaining;
			let cards_html = chosen
				.map((word) => {
					return `<div class="card" contenteditable="true">
					<button class="card__remove">×</button>
					${word}
					</div>`;
				})
				.join('');
			cards.innerHTML = cards_html;
		}).catch(err => {
			console.error(err);
			submit.disabled = false;
			submit.textContent = 'Submit';
		})
});

delegate(document, '.card__remove', 'click', function(e) {
	let close_button = e.delegateTarget;
	let card = close_button.closest('.card');
	let remaining = cards.remaining;
	if (!remaining.length) {
		return;
	}
	let next_word = remaining.shift();
	card.parentNode.removeChild(card);
	let new_card = document.createElement('div');
	new_card.className = 'card';
	new_card.contentEditable = true;
	new_card.innerHTML = `<button class="card__remove">×</button>${next_word}`;
	cards.appendChild(new_card);
});
