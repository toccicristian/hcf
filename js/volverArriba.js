let botonVolverArriba = document.getElementById("botonVolverArriba");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    botonVolverArriba.style.display = "block";
  } else {
    botonVolverArriba.style.display = "none";
  }
}

function topFunction() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
} 


