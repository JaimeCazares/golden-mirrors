const pesos = document.querySelectorAll('#listaPesos li');
const pesoActual = document.getElementById('pesoActual');

pesos.forEach(peso => {
  peso.addEventListener('click', () => {
    pesos.forEach(p => p.classList.remove('seleccionado'));
    peso.classList.add('seleccionado');
    pesoActual.textContent = peso.dataset.peso + ' kg';
  });
});
