function showList(e) {
	const img = [...e.children].find((e) => e.classList.contains("down"));
	const ul = e.nextElementSibling;
	ul.classList.toggle("show");
	img.classList.toggle("up");
}
