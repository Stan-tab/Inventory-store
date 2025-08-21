function showList(e) {
	const img = [...e.children].find((e) => e.classList.contains("down"));
	const ul = e.nextElementSibling;
	ul.classList.toggle("show");
	img.classList.toggle("up");
}

function sender(query, timeout = 700) {
	this.form = document.querySelector(query);

	this.sendForm = () => {
		clearTimeout(this.id);
		this.id = setTimeout(() => {
			this.form.submit();
		}, timeout);
	};
}

const sendHeader = new sender("header form");
const sendMain = new sender("main form");
