advancedSearch = false;

//caching body tag to change the background style property.
const body = document.getElementById("body");


//Function to generate a random color block times two!
const generateImage = () => {
    var gradients = [
        ['#ff9a9e', '#fecfef'],
        ['#a1c4fd', '#c2e9fb'],
        ['#cfd9df', '#e2ebf0'],
        ['#a3bded', '#6991c7']
    ]
    gradientIdx = Math.floor(Math.random() * gradients.length)

    //Giving values to the linear gradiant.
    const background = body.style.background = `linear-gradient(to right, ${gradients[gradientIdx][0]}, ${gradients[gradientIdx][1]})`;
}


var recipesDisplay = ['Chicken noodle soup 🍜', 'Chocolate cake 🍰', 'Spaghetti Bolognese 🍝', 'Veggie burger 🍔', 'Pizza 🍕', 'Burrito 🌯', 'Banana pancakes 🥞'];
var recipes = ['chicken noodle soup', 'chocolate cake', 'spaghetti bolognese', 'veggie burger', 'pizza', 'burrito', 'banana pancakes'];

textSequence(0, 0);

function textSequence(i, timeout) {

    if (recipesDisplay.length > i) {
        setTimeout(function() {
            document.getElementById("recipe-banner").innerHTML = recipesDisplay[i];
            textSequence(++i, 2000);
        }, timeout);

    } else if (recipesDisplay.length == i) { // Loop
        textSequence(0, 2000);
    }
}

function toggleControlsBoxVisibility() {
    advancedSearch = !advancedSearch;
    if (advancedSearch) {
        document.getElementById("controls").className = "visible";
    } else {
        document.getElementById("controls").className = "hidden";
    }
}