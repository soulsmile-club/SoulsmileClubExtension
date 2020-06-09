var dialog = document.createElement("dialog")
dialog.textContent = "Would you like to earn Soulsmiles for your purchases?"
var yesButton = document.createElement("button")
yesButton.textContent = "Yes"
var noButton = document.createElement("button")
noButton.textContent = "No"
dialog.appendChild(noButton)
dialog.appendChild(yesButton)
noButton.addEventListener("click", function() {
  dialog.close()
})
yesButton.addEventListener("click", function() {
	chrome.storage.sync.set({isEarning: true}, function() {
        console.log('This user is earning.');
    });
	var url = new URL(window.location.href)
	url.searchParams.append('tag', 'soulsmileclub-20')
	window.location.href = url
})
document.body.appendChild(dialog)

chrome.storage.sync.get('isEarning', function (data) {
	console.log(data)
	if (!data.isEarning) {
		dialog.showModal()
	} else {
		if (!window.location.href.includes('tag=soulsmileclub-20')) {
			var url = new URL(window.location.href)
			url.searchParams.append('tag', 'soulsmileclub-20')
			window.location.href = url
		}
	}
})