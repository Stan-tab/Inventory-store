function showList(e) {
	const img = [...e.children].find((e) => e.classList.contains("down"));
	const ul = e.nextElementSibling;
	ul.classList.toggle("show");
	img.classList.toggle("up");
}

function sender(timeout = 700) {
	this.sendForm = (e) => {
		this.form = e.parentElement;
		clearTimeout(this.id);
		this.id = setTimeout(() => {
			this.form.submit();
		}, timeout);
	};
}

const sendHeader = new sender();
const sendMain = new sender();
