/*
DANGER - DO NOT RUN IN PRODUCTION, DO NOT HOST ON THE INTERNET

This static website example is for demo purposes only. Do not use this code in production as it publicly exposes
Elasticsearch cluster credentials and connection details.

Calls to Elasticsearch must be proxied through an API gateway with request limits, quotas and 
appropriate authentication & authorization implemented. Alternatively, your application architecture can be setup
to make calls to Elasticsearch on a backend component instead.

Add the following settings to your elasticsearch.yml file for this example to work:

http.cors.enabled: true
http.cors.allow-origin: "*"
http.cors.allow-methods : OPTIONS, HEAD, GET, POST
http.cors.allow-headers: "*"

*/
// CONFIGURATION FOR ELASTICSEARCH -----
const ES_URL = "https://elastic-host"
const ES_CREDS = "<username>:<password>"
//--------------------------------------

let resultMode = false;
let autoCompleteLazy = false;
let page = 1
let resultsPerPage = 10;
let minRating = 3;
let specifiedAuthors = [];
let sortBy = "relevance";
let autocompleteActive = false;



// Run get request to Elasticsearch
async function runESRequest(requestPath, requestBody) {
    let response = await fetch(ES_URL + "/" + requestPath, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(ES_CREDS),
            'Content-type': "application/json"
        },
        body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    return data;

}


async function retrieveTerms(field, query, size = 1500) {
    let requestPath = "recipes/_search";

    //remove terms from query to show all authors regardless of current filters
    if (query.bool.must.findIndex(x => x.prop === 'terms')) {
        //remove item with index
        query.bool.must.splice(query.bool.must.findIndex(x => x.prop === 'terms'), 1);
    }

    let requestBody = {
        "size": 0,
        "query": query,
        "aggs": {
            "terms": {
                "terms": {
                    "field": field,
                    "size": size,
                    "order": {
                        "_key": "asc"
                    }
                }
            }
        }
    };

    const data = await runESRequest(requestPath, requestBody)

    const element = document.getElementById(`select-${field}`);
    let htmlstr = '<option value="">Select specific ' + field + '(s)</option>';
    for (let i = 0; i < data.aggregations.terms.buckets.length; i++) {
        if (specifiedAuthors.includes(data.aggregations.terms.buckets[i].key)) {
            htmlstr += `<option value="${data.aggregations.terms.buckets[i].key}" selected>${data.aggregations.terms.buckets[i].key}</option>`
        } else {
            htmlstr += `<option value="${data.aggregations.terms.buckets[i].key}">${data.aggregations.terms.buckets[i].key}</option>`
        }
    }
    element.innerHTML = htmlstr;
}

function search() {
    //get inputs from page
    searchTerm = document.getElementById("recipesearch").value;

    //indicate search is running
    document.getElementById("result-heading").textContent = "Loading...";

    let requestPath = "recipes/_search";
    let from = (page - 1) * resultsPerPage;

    //generate request body
    let requestBody = {
        "size": resultsPerPage,
        "from": from,
        "query": {
            "bool": {
                "must": [{
                        "multi_match": {
                            "query": searchTerm,
                            "fields": [
                                "title"
                            ]
                        }
                    },
                    {
                        "range": {
                            "rating.ratingValue": {
                                "gte": minRating
                            }
                        }
                    }
                ]
            }
        }
    };

    //add specified authors to query
    if (specifiedAuthors.length > 0) {
        requestBody.query.bool.must.push({
            "terms": {
                "author": specifiedAuthors
            }
        });
    }

    let sortByField = "";
    let order = "desc";
    if (sortBy === "relevance") {
        sortByField = "_score";
    } else if (sortBy === "rating") {
        sortByField = "rating.ratingValue";
    } else if (sortBy === "ascending") {
        sortByField = "title.keyword";
        order = "asc";
    } else if (sortBy === "descending") {
        sortByField = "title.keyword";
    }

    //add sort by
    requestBody.sort = {};
    requestBody.sort[sortByField] = {
        "order": order
    }


    runESRequest(requestPath, requestBody).then(data => {
        //clear list
        document.getElementById("results-list").innerHTML = "";

        if (data.hits.hits.length > 0) {
            resultMode = true;
            evalResultMode()

            //update results text
            document.getElementById("result-heading").innerHTML = "Found " + data.hits.total.value + " recipes in " + data.took / 100 + " seconds for \"" + searchTerm + "\".<br>";
            document.getElementById("result-heading").innerHTML += "Showing page " + page + " of " + Math.ceil(data.hits.total.value / resultsPerPage) + ".";

            if (minRating != 3) {
                document.getElementById("result-heading").innerHTML += "<br>Filtering for recipes with a rating of at least " + minRating + ".";
            }

            for (let i = 0; i < data.hits.hits.length; i++) {
                hit = data.hits.hits[i]._source;
                // console.log(data)
                li = generateListItem(hit.url, hit.title, hit.description, hit.author, hit.picture_link, hit.rating.ratingValue);
                document.getElementById("results-list").innerHTML += li;
            }

            // load advanced UI controls
            retrieveTerms('author', requestBody.query);
            autoCompleteLazy = true;
            autocompleteActive = false;
            toggleAutoCompletion();
        } else {
            resultMode = false;
            evalResultMode();

            if (data.hits.total.value != 0) {
                document.getElementById("result-heading").textContent = "No more pages!";
            } else {
                //construct suggester query
                let requestBody = {
                    "suggest": {
                        "suggestion": {
                            "text": searchTerm,
                            "term": {
                                "field": "title"
                            }
                        }
                    }
                }
                runESRequest("recipes/_search", requestBody).then(data => {
                    let suggestions = data.suggest.suggestion;
                    //build list of suggestions
                    let suggestionPhrase = "";
                    for (let i = 0; i < suggestions.length; ++i) {
                        if (suggestions[i].options.length > 0) {
                            suggestionPhrase += suggestions[i].options[0].text + " ";
                        } else {
                            suggestionPhrase += (suggestions[i].text) + " "
                        }
                    }
                    if (suggestionPhrase != "") {
                        document.getElementById("result-heading").innerHTML = "No results found. Did you mean <a id='didyoumean' onclick='handleDidYouMean()'><strong>" + suggestionPhrase.trim() + "</strong></a>?";
                    } else {
                        document.getElementById("result-heading").textContent = "No results found. Try searching for something else.";
                    }
                });
            }
        }

    });
}


async function getAutoCompleteOptions(input) {
    requestBody = {
        "_source": [
            "title.suggestion"
        ],
        "suggest": {
            "recipe_suggest": {
                "prefix": input,
                "completion": {
                    "field": "title.suggestion",
                    "size": 5,
                    "skip_duplicates": true,
                    "fuzzy": {
                        "fuzziness": 0
                    }
                }
            }
        }
    }
    let data = await runESRequest("recipes/_search", requestBody);
    return data.suggest.recipe_suggest[0].options.map(x => x.text.toLowerCase());
}

function paginate(direction) {
    if ((page + direction) > 0) {
        page += direction;
        search();
        window.scrollTo(0, 0);
    } else {
        document.getElementById("result-heading").textContent = "You can't go here.";
    }
}

//handler functions for Advanced Search options
function handleResultsPerPage() {
    resultsPerPage = parseInt(document.getElementById("select-results-per-page").value);
    search();
}

function handleMinRating() {
    minRating = parseInt(document.getElementById("min-rating").value);
    search();
}

function handleSpecifiedAuthors() {
    specifiedAuthors = Array.from(document.getElementById("select-author").selectedOptions).map(({ value }) => value)
    search();
}

function handleSortBy() {
    sortBy = document.getElementById("select-sort").value;
    search();
}

// Handler function for Did You Mean label
function handleDidYouMean() {
    let term = document.getElementById("didyoumean").textContent;
    document.getElementById("recipesearch").value = term;
    search();
}

// Handle changes to the search box and Enter key for search
document.getElementById('recipesearch').onkeypress = function(e) {
    if (!e) e = window.event;
    let keyCode = e.code || e.key;
    if (keyCode == 'Enter') {
        page = 1;
        search();
    }
}


// Handling user interactions for auto-completion logic
var typingTimer; //timer identifier
var doneTypingInterval = 500; //time in ms
var $input = document.getElementById('recipesearch');

//on keyup, start the countdown
$input.onkeyup = function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
}

//on keydown, clear the countdown 
$input.onkeydown = function() {
    clearTimeout(typingTimer);
}

function toggleAutoCompletion() {
    if (!autocompleteActive) {
        document.getElementById("autocomplete").classList.add("hidden");
    } else {
        document.getElementById("autocomplete").classList.remove("hidden");
    }
}

//user is "finished typing," do something
async function doneTyping() {
    if (document.getElementById("recipesearch").value != "" && !autoCompleteLazy) {
        autocompleteActive = true;
        let list = await getAutoCompleteOptions(document.getElementById("recipesearch").value);

        //load list
        document.getElementById("autocomplete-list").innerHTML = "";
        for (let i = 0; i < list.length; i++) {
            document.getElementById("autocomplete-list").innerHTML += `<li id="autocomplete-option-${i}" onclick="handleAutoCompleteClick('autocomplete-option-${i}')" class="autocomplete-item">${list[i]}</li>`;
        }
    } else {
        autoCompleteLazy = false;
        autocompleteActive = false;
    }
    toggleAutoCompletion();
}

function handleAutoCompleteClick(id) {
    document.getElementById("recipesearch").value = document.getElementById(id).textContent;
    search();
}

// UI functions
function evalResultMode() {
    if (resultMode) {
        document.getElementById("recipe-banner").classList.add("result-mode");
        document.getElementById("advanced-search-controls").classList.remove("result-mode");
        document.getElementById("pagination").classList.remove("result-mode");
    } else {
        document.getElementById("recipe-banner").classList.remove("result-mode");
        document.getElementById("advanced-search-controls").classList.add("result-mode");
        document.getElementById("pagination").classList.add("result-mode");
    }
}

function generateListItem(url, title, description, author, image, rating) {
    let ratinghtml = ""

    for (let i = 0; i < rating; i++) {
        ratinghtml += '<span class="fa fa-star checked"></span>';
    }

    return `<li id="results-list-item">
                <div class="result-item row">
                    <div class="result-item-image column"><img src="` + image + `"></div>
                    <div class="result-item-details large-column">
                        <div class="result-item-title"><a href="` + url + `" target="_blank" rel="noopener noreferrer">` + title + `</a></div>
                        <div class="result-item-rating">` + ratinghtml + `</div>
                        <div class="result-item-author">` + author + `</div>
                        <div class="result-item-description">` + description + `</div>
                    </div>
                </div>
            </li>`
}