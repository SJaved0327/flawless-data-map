var model = require("./models");
const inquirer = require("inquirer");
const cheerio = require("cheerio");
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: false })
const request = require("request");


//user accesses app in CLI 
function runCLI() {
	console.log("* * * * * * * * * * * * * * * * * * *");
	console.log("Find information related to your book's ISBN to plug into AirTable");
	inquirer
		.prompt([
		{
			name: "ISBN",
			type: "input",
			message: "Enter the item ISBN: ",
			validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
		}
		]).then(function(answer){

			const barcode = answer.ISBN; 

			nightmare
			  .goto("https://www.barcodelookup.com/")
			  .type(".search-input", barcode)
			  .click(".btn-search")
			  //wait until the product-details div is loaded w data
			  .wait(".product-details")
			  .evaluate(function(){
			    return document.body.innerHTML;
			  })
			  .end()
			  .then(function(html){
			  	//load html into cheerio
			  	let $ = cheerio.load(html);
			  	//empty div to hold find result
			  	let result = {};
			  	let productTextLabel = {}


			  	//grab title info from h4
			  	result.title = $("h1")
			  		.children("h4")
			  		.text();

			  	//grab info from each product-text-label div
			  	$(".product-text-label").each(function(i, element){
			  		productTextLabel["input"+i] = $(element)
				  		.find("span.product-text")
				  		.text();
				  });

				  result.author = productTextLabel.input1;

					//grab info from the images div
					$("div#images").each(function(i, element){
				  	//save the image src url of each article
						result.imageURL = $(element)
							.find("img")
							.attr("src");
						//save the alt of each image
						result.title = $(element)
							.find("img")
							.attr("alt")
					});

					let stores = [];
					// //grab info from the online-stores div
					// $("div.online-stores").each(function(i, element){
				  let res = {};

			  	//save the store name for eBay
					res.store = $("ol")
						.find("a")
						.text();
					//save the average eBay price
					res.avg_price = $("div.store-list")
						.find("li:first-child")
						.find("span.store-link")
						.text();
						
					stores.push(res)

					result.stores = stores;

		  		console.log(result);
		  		console.log("* * * * * * * * * * * * * * * * * * *");
		  	})
			  .catch(function(error) {
			    console.error("Search failed:", error);
			  })
			})
};

runCLI();
//kicks off inquirer where ISBN number is asked
//answer (ISBN number) is captured and fired off to cheerio

/* PT 1 */

//cheerio visits 2 webpages and scrapes:
// title
// picture URL
// barcode = ISBN
// author
// ebay
// chegg
// sellback
// textbooks
// rush 
// booksrun

// user receives console.log of final object

/* PT 2 */

// object is sent to airtable API as a post to create new entry where barcode matches
