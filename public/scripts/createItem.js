const originalInput = document.querySelector(".input");
const input = originalInput.cloneNode(true);
[...originalInput.childNodes]
	.filter((el) => el.nodeName === "BUTTON")[0]
	.remove();

function addInput(e) {
	const parent = e.parentNode;
	const inputClone = input.cloneNode(true);
	parent.insertBefore(inputClone, e);
}

function removeInput(e) {
	e.parentNode.remove();
}
