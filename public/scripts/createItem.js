const input = document.querySelector("#genre").cloneNode(true)

function addInput(e) {
    const parent = e.parentNode;
    const inputClone = input.cloneNode(true)
    parent.insertBefore(inputClone, e)
}