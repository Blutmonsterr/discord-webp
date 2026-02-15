function typeWriter(element, text, speed = 40) {
    element.textContent = "";
    let i = 0;
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function showToast(toastElement) {
    if (toastElement) {
        toastElement.classList.add("show");
        setTimeout(() => { toastElement.classList.remove("show"); }, 3000);
    }
}