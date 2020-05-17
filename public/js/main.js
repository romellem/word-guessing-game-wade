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
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values
function randomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let category = $('#category');
let submit = $('#category-submit');
let cards = $('.cards');
let start_wrapper = $('.start');
let start_button = $('.start > button');
let secret_word_toggle = $('#show-secret-word');
let secret_word_toggle_wrapper = $('.toggle-secret');

submit.addEventListener('click', (e) => {
	submit.disabled = true;
	submit.dataset.previousText = submit.textContent;
	submit.textContent = 'Loading...';
	secret_word_toggle_wrapper.style.display = '';

	let value = category.value;

	fetch(`/api/${value}`)
		.then((r) => r.json())
		.then((items) => {
			submit.disabled = false;
			submit.textContent = submit.dataset.previousText;
			start_wrapper.style.display = 'block';

			let top_ten = shuffle(items.slice(0, 10));
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
					<button class="card__remove button-reset">×</button>
					${word}
					</div>`;
				})
				.join('');
			cards.innerHTML = cards_html;
		})
		.catch((err) => {
			console.error(err);
			submit.disabled = false;
			submit.textContent = 'Submit';
		});
});

delegate(document, '.card__remove', 'click', function (e) {
	let close_button = e.delegateTarget;
	let card = close_button.closest('.card');
	let remaining = cards.remaining;

	// @todo think about what happens when we cycle through all the cards
	if (!remaining.length) {
		return;
	}

	let next_word = remaining.shift();
	card.parentNode.removeChild(card);
	let new_card = document.createElement('div');
	new_card.className = 'card';
	new_card.contentEditable = true;
	new_card.innerHTML = `<button class="card__remove button-reset">×</button>${next_word}`;
	cards.appendChild(new_card);
});

// This can be optimized, but works :shrug:
const makeUneditable = () => {
	let card_elements = $$('.card');
	card_elements.forEach(card => {
		let remove_button = card.querySelector('.card__remove');
		remove_button.parentNode.removeChild(remove_button);
		card.contentEditable = false;
	});
}

start_button.addEventListener('click', function (e) {
	let card_elements = $$('.card');
	let random_card = card_elements[randomInt(0, card_elements.length)];
	random_card.classList.add('card--selected');
	cards.classList.add('cards--show-secret');
	makeUneditable();

	secret_word_toggle.checked = true;
	start_wrapper.style.display = '';
	secret_word_toggle_wrapper.style.display = 'block';
});

secret_word_toggle.addEventListener('input', function (e) {
	let show_secret = secret_word_toggle.checked;
	if (show_secret) {
		cards.classList.add('cards--show-secret');
	} else {
		cards.classList.remove('cards--show-secret');
	}
});
