var modal = document.createElement('div');
modal.setAttribute('id', 'myModal');
modal.setAttribute('class', 'modal');
modal.setAttribute('style', 'display: none; position: absolute; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgb(0,0,0); background-color: rgba(0,0,0,0.4);');

var modalContent = document.createElement('div');
modalContent.setAttribute('class', 'modal-content');
modalContent.setAttribute('style', 'border-radius: 10px; text-align: center; background-color: #fefefe; margin: auto; margin-top: 10%; margin-left: 75%; padding: 50px;border: 1px solid #888;width: 80%;')

var closeContent = document.createElement('span');
closeContent.setAttribute('class', 'close');
closeContent.setAttribute('style', 'color: #000000; font-weight: bold; font-size: 25px;')
closeContent.innerText = 'Would you like to earn Soulsmiles for your purchases?';

var divButtons = document.createElement('div');
divButtons.setAttribute('style', 'padding-top: 25px; padding-bottom: 5px')
var yesButton = document.createElement('button');
yesButton.setAttribute('style', 'color: #000000; font-size: 20px; margin-right: 20px')
yesButton.innerText = 'Yes'

var noButton = document.createElement('button');
noButton.setAttribute('style', 'color: #000000; font-size: 20px; margin-left: 20px')
noButton.innerText = 'No'

modal.appendChild(modalContent);
modalContent.appendChild(closeContent);
modalContent.appendChild(divButtons);
divButtons.appendChild(yesButton);
divButtons.appendChild(noButton);

document.body.appendChild(modal);

noButton.addEventListener("click", function() {
	modal.style.display = 'none';
})
yesButton.addEventListener("click", function() {
	modal.style.display = 'none';
	chrome.storage.sync.set({isEarning: true}, function() {
		console.log('This user is earning.');
	});
	checkTagForSoulsmile();
});

chrome.storage.sync.get('isEarning', function (data) {
	console.log(data)
	if (!data.isEarning) {
		modal.style.display = 'flex';
	} else {
		checkTagForSoulsmile();
	}
})

function checkTagForSoulsmile() {
	if (!window.location.href.includes('tag=soulsmileclub-20')) {
		var url = new URL(window.location.href)
		url.searchParams.append('tag', 'soulsmileclub-20')
		window.location.href = url
	}
};