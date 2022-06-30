const dropdown_buttons = document.querySelectorAll("*[data-dropdown-toggle]");

function toggleDropdown(event) {
  let dropdownId = event.currentTarget.getAttribute("data-dropdown-toggle");
  let dropdown = document.getElementById(dropdownId);
  if (dropdown)
    dropdown.classList.toggle("hidden");
}

dropdown_buttons.forEach(button => {
  button.onclick = toggleDropdown;
});