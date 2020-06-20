$(document).ready(function() {
    chrome.storage.sync.get('isEarning', function (data) {
        if (!data.isEarning) {
            createBox();
        } else {
            checkTagForSoulsmile();
        }
    });
});

function createBox() {
    var yourBoxOneID = Boundary.createBox("yourBoxOneID");
    Boundary.loadBoxCSS("#yourBoxOneID", chrome.extension.getURL('bootstrap.min.css'));
	Boundary.loadBoxCSS("#yourBoxOneID", chrome.extension.getURL('your-stylesheet-for-elements-within-boxes.css'));
	/* modify box one content */
    Boundary.rewriteBox("#yourBoxOneID", `
    <div class="modal-header">
        <button type="button" id="noButton" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
    </div>
    `);
    Boundary.appendToBox("#yourBoxOneID", `<div>
        <h2 id='soulsmile-title'>soul<span id="smile">smile</span> club</h2>
    </div>
    `);
    Boundary.appendToBox("#yourBoxOneID", `
    <div>
        <h4 id='earn-soulsmiles'>Would you like to earn soulsmiles for your purchases?</h4>
    </div>`);
    Boundary.appendToBox("#yourBoxOneID", `
    <div>
        <button type='button' class='btn btn-secondary' id='yesButton'>Yes, please!</button>
    </div>`);
    // /* add some silly interaction to box one */
    Boundary.findElemInBox("#noButton", '#yourBoxOneID').click(function() {
        $('#yourBoxOneID').remove();
    })
	Boundary.findElemInBox("#yesButton", "#yourBoxOneID").click(function() {
        $('#yourBoxOneID').remove();
        console.log('reached');
        setIsEarning();
        checkTagForSoulsmile();
    });
}

function setIsEarning() {
    chrome.storage.sync.set({isEarning: true}, function() {
        console.log('This user is earning.');
    });
}

function checkTagForSoulsmile() {
    if (!window.location.href.includes('tag=soulsmileclub-20')) {
        var url = new URL(window.location.href)
        url.searchParams.append('tag', 'soulsmileclub-20')
        window.location.href = url
    }
};