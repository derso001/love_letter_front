const PASSWORD = "26.08";
const NEXT_PAGE = "galeri.html";

document.getElementById("password-form").addEventListener("submit", function(event){
    event.preventDefault();

    const passwordInput = document.getElementById("password-input")
    const errorMessage = document.getElementById("error-message")

    const enteredPassword = passwordInput.value.trim().toUpperCase();

    if (enteredPassword == PASSWORD){
        window.location.href = NEXT_PAGE;
    } else {
        errorMessage.textContent = "Неправильно(";
        passwordInput.value = "";
        passwordInput.focus()
    }
    
})