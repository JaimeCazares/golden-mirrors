// ===== ANIMACIONES =====
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('on');
      io.unobserve(e.target);
    }
  });
}, {threshold:0.1});

document.querySelectorAll('.fade').forEach(el => io.observe(el));


// ===== FLIP CARD =====
function flipCard(id, axis){
  const card = document.getElementById(id);

  if(axis === "x" && card.classList.contains("flip-x")){
    card.classList.remove("flip-x");
    return;
  }

  if(axis === "y" && card.classList.contains("flip-y")){
    card.classList.remove("flip-y");
    return;
  }

  card.classList.remove("flip-x","flip-y");
  void card.offsetWidth;

  if(axis === "x"){
    card.classList.add("flip-x");
  } else {
    card.classList.add("flip-y");
  }
}

document.addEventListener("click", (e) => {
  const card = document.getElementById("card1");

  if(!card.contains(e.target)){
    card.classList.remove("flip-x","flip-y");
  }
});