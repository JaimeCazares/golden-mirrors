const pesos = document.querySelectorAll('#listaPesos li');

pesos.forEach(peso => {
  peso.addEventListener('click', () => {
    pesos.forEach(p => p.classList.remove('seleccionado'));
    peso.classList.add('seleccionado');
    console.log('Peso seleccionado:', peso.dataset.peso, 'kg');
  });
});
