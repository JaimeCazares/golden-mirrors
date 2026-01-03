document.querySelectorAll('#listaPesos li').forEach(peso => {
  peso.addEventListener('click', () => {
    document.querySelectorAll('#listaPesos li')
      .forEach(p => p.classList.remove('seleccionado'));

    peso.classList.add('seleccionado');
    console.log('Peso:', peso.dataset.peso, 'kg');
  });
});
