//caching body tag to change the background style property.
const body = document.getElementById("body");


//Function to generate a random color block times two!
const generateImage = () => {
    var gradients = [
        ['#ff9a9e', '#fad0c4'],
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

function search() {
    var key = document.getElementById('recipesearch').value.toLowerCase();
    key = key.replace(/(<([^>]+)>)/gi, "")
    var resultBox = document.getElementById('results');
    if (recipes.find(element => element == key)) {
        resultBox.innerHTML = "<a target='_blank' href='https://www.google.com/search?q=" + key + "'>Click here </a> for the best " + key + "</a> recipe on the internet.";
    } else {
        resultBox.textContent = "Sorry, we could not find a recipe for " + key;
    }
}