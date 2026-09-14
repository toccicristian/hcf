let botonVolverArriba = document.getElementById("botonVolverArriba");
botonVolverArriba.style.display = "none";

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    botonVolverArriba.style.display = "block";
  } else {
    botonVolverArriba.style.display = "none";
  }
}


function topFunction() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
