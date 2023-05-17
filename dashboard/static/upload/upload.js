var stepper;
var selectedPlatform;
var file;
var additionalDate;
var match;
var form = document.getElementById("upload-form");
var addconfig = document.getElementById("config");
var input = document.getElementById("fileinput");
var campaignName = JSON.parse(campaignNameJSON.replace(/&quot;/g, '"'));

var W1 = document.getElementById("W1");
var E1 = document.getElementById("E1");
var E2 = document.getElementById("E2");
var E3 = document.getElementById("E3");
var E4 = document.getElementById("E4");
var E5 = document.getElementById("E5");

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
	return new bootstrap.Tooltip(tooltipTriggerEl);
});

// File type
function typeCheck() {
	selectedPlatform = document.querySelector('input[name="type"]:checked').value;
	throwError(E3, false);
	if (selectedPlatform == "GC") {
		addconfig.classList.remove("hidden");
		console.log("Warning: additional config");
	} else {
		addconfig.classList.add("hidden");
		document.getElementById("date").value = null;
	}
	if (file) {
		matchCheck();
	}
}

// Drag and drop file upload
let dropArea = document.getElementById("drop-box");
let uploadicon = document.getElementById("upload-icon");

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
	dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
	e.preventDefault();
	e.stopPropagation();
}

["dragenter", "dragover"].forEach((eventName) => {
	dropArea.addEventListener(eventName, highlight, false);
});
["dragleave", "drop"].forEach((eventName) => {
	dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
	dropArea.classList.add("highlight");
	uploadicon.classList.add("highlight");
}

function unhighlight(e) {
	dropArea.classList.remove("highlight");
	uploadicon.classList.remove("highlight");
}

dropArea.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
	let dt = e.dataTransfer;
	if (dt.files.length > 1) {
		throwError(E1, true);
		console.log("Error: Too many files");
	} else {
		throwError(E1, false);
		input.files = dt.files;
		file = dt.files[0];
		matchCheck();
	}
}

function uploadHandle() {
	file = input.files[0];
	console.log(file);
	throwError(E1, false);
	throwError(E5, false);
	matchCheck();
}

function matchCheck() {
	let fr = new FileReader();
	fr.onload = csvHandle;
	fr.readAsText(file);

	function csvHandle() {
		let data = fr.result;
		let lines = data.split(/\r?\n/);

		if (checkDup(lines)) {
			throwError(W1, true);
		}

		let colLength = lines[0].split(",").length;
		if (selectedPlatform) {
			if (colCheck(colLength, selectedPlatform)) {
				throwError(E2, false);
				match = true;
			} else {
				throwError(E2, true);
				console.log("Error: Not matching file type");
				match = false;
			}
		} else {
			throwError(E3, true);
			console.log("Error: No platform selected");
		}
	}

	function colCheck(col, type) {
		//already plus 2
		if (col == 12 && type == "GS") {
			return true;
		} else if (col == 22 && type == "FB") {
			return true;
		} else if (col == 46 && type == "LM") {
			return true;
		} else if (col == 17 && type == "LP") {
			return true;
		} else if (col == 19 && type == "GC") {
			return true;
		} else {
			return false;
		}
	}
}

function throwError(Error, mode) {
	if (mode) {
		Error.classList.remove("hidden");
	} else {
		Error.classList.add("hidden");
	}
}

function formCheck() {
	additionalDate = document.getElementById("date").value;
	if (!selectedPlatform) {
		throwError(E3, true);
		return false;
	} else {
		throwError(E3, false);
	}
	if (additionalDate == "" && selectedPlatform == "GC") {
		throwError(E4, true);
		return false;
	} else {
		throwError(E4, false);
	}
	if (!file) {
		throwError(E5, true);
		return false;
	} else {
		throwError(E5, false);
		if (!match) {
			throwError(E2, true);
			return false;
		} else {
			throwError(E2, false);
		}
	}
	return true;
}

function submitHandle() {
	if (formCheck()) {
		form.submit();
	}
	// if (checkGCDate) {
	// 	form.submit();
	// }
}

function clearHandle() {
	var isClearCampaignChecked = document.getElementById("clear-campaign-checkbox").checked;
	var isClearSitetrafficChecked = document.getElementById("clear-sitetraffic-checkbox").checked;
	var ref = `/clear-success?campaign=${isClearCampaignChecked}&sitetraffic=${isClearSitetrafficChecked}`;
	window.location.href = ref;
}

function checkDup(lines) {
	function checkPlatform(pid) {
		if ((pid == 1 || pid == 2) && selectedPlatform == "FB") {
			return true;
		} else if (pid == 3 && selectedPlatform == "LP") {
			return true;
		} else if (pid == 3 && selectedPlatform == "LM") {
			return true;
		} else if (pid == 4 && selectedPlatform == "GC") {
			return true;
		}
		return false;
	}

	var campaignNameArray = formArray(campaignName.name);
	var campaignPid = formArray(campaignName.pid);
	for (let i = 0; i < campaignNameArray.length; i++) {
		if (stringMatch(lines, campaignNameArray[i]) && checkPlatform(campaignPid[i])) {
			return true;
		}
	}
	return false;
}

function stringMatch(str, pattern) {
	// Create a regular expression object from the pattern
	let regex = new RegExp(pattern);

	// Use the `test` method of the input string to check for a match
	let isMatch = regex.test(str);

	// Return true if there is a match, false otherwise
	return isMatch;
}

function formArray(data) {
	let arr = [];
	try {
		for (const [key, value] of Object.entries(data)) {
			arr.push(value);
		}
	} catch (error) {
		console.error(error);
	}

	return arr;
}
