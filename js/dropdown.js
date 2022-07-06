const dropdown_buttons = document.querySelectorAll("*[data-dropdown-toggle]");

function toggleDropdown(event) {
  let dropdownId = event.currentTarget.getAttribute("data-dropdown-toggle");
  let dropdown = document.getElementById(dropdownId);
  if (dropdown) dropdown.classList.toggle("hidden");
}
function offDropdown(event) {
  let dropdownId = event.currentTarget.getAttribute("data-dropdown-toggle");
  setTimeout(() => {
    let dropdown = document.getElementById(dropdownId);
    if (dropdown) dropdown.classList.add("hidden");
  }, 200);
}

dropdown_buttons.forEach((button) => {
  button.onclick = toggleDropdown;
  button.onblur = offDropdown;
});
