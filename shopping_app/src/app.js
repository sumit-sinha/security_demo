"use strict"

const express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	path = require("path"),
	mysql = require("mysql");

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(path.join(__dirname + "/../static")));

app.set('view engine', 'pug');
app.listen(8080, () => {
	console.log("running server on port " + 8080);
	console.log("access content using URL: http://127.0.0.1:8080/");
});

let products = {
	"1": {
		"id": "1",
		"name": "First Product",
		"description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." 
	},
	"2": {
		"id": "2",
		"name": "Second Product",
		"description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." 
	},
	"3": {
		"id": "3",
		"name": "Third Product",
		"description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." 
	},
	"4": {
		"id": "4",
		"name": "Fourth Product",
		"description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." 
	},
	"5": {
		"id": "5",
		"name": "Fifth Product",
		"description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." 
	}
}

/**
 * function to send response when a request is made to get home page
 * @param request
 * @param response
 */
let processHomePageRequest = function(request, response) {
	let menuItems = [{
		href: "#",
		text: "Category 1"
	}, {
		href: "#",
		text: "Category 2"
	}, {
		href: "#",
		text: "Category 3"
	}],
	fromProductPage = request.query.FROM_PRODUCT_PAGE,
	lastProductLink = request.query.LAST_PRODUCT_LINK,
	lastProductName = request.query.LAST_PRODUCT_NAME;

	if (fromProductPage === "TRUE") {
		menuItems.push({
			href: lastProductLink,
			text: lastProductName
		})
	}

	response.set('X-XSS-Protection', '0');
	response.render("index", {
		menuItems: menuItems
	});
}

app.route("/")
	.get((request, response) => {
		processHomePageRequest(request, response);
	})
	.post((request, response) => {
		processHomePageRequest(request, response);
	});

app.route("/catalog")
	.get((request, response) => {
		let domain = "http://localhost:8080/";

		var connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
		 	password : 'root',
			database : 'shoppingparadise'
		});

		connection.connect();

		connection.query("select * from product where id = " + request.query.product, function (err, rows, fields) {
			if (err) {
				response.render("catalog", {
					product: {},
					paymentLink: null,
					homePageLink: null
				});
			};

			let homePageLink = domain + "?FROM_PRODUCT_PAGE=TRUE&LAST_PRODUCT_LINK=/catalog?product=" 
						+ request.query.product + "&LAST_PRODUCT_NAME=" + rows[0].name;

			response.render("catalog", {
				product: {
					id: rows[0].id,
					name: rows[0].name,
					description: rows[0].description
				},
				paymentLink: domain + "payment?product=" + rows[0].id,
				homePageLink: homePageLink
			});
		});

		connection.end();
	});

app.route("/payment")
	.get((request, response) => {
		response.render("payment", {});
	});

app.route("/confirmation")
	.post((request, response) => {
		response.render("confirmation", {});
	})
	.get((request, response) => {
		response.render("confirmation", {});
	});
