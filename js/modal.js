function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function openModal(title, body) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-body').innerText = body;
  document.getElementById('modal').classList.remove('hidden');
}