document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu_bar");

    const dropdown = document.querySelector(".dropdown");
    const dropButton = document.querySelector(".dropbtn");

    // Abrir y cerrar el menú hamburguesa
    menuToggle.addEventListener("click", () => {
        const menuAbierto = menu.classList.toggle("active");

        menuToggle.classList.toggle("active", menuAbierto);
        menuToggle.setAttribute("aria-expanded", menuAbierto);
        menuToggle.setAttribute(
            "aria-label",
            menuAbierto ? "Cerrar menú" : "Abrir menú"
        );
    });

    // Abrir y cerrar el submenú de Inicio
    dropButton.addEventListener("click", () => {
            const dropdownAbierto = dropdown.classList.toggle("open");

            dropButton.setAttribute(
                "aria-expanded",
                dropdownAbierto
            );
    });

    // Cerrar el menú al pulsar Elenco, Ost o cualquier otro enlace
    const enlaces = menu.querySelectorAll(".dropdown-content a, ul > li:not(.dropdown) a");

    enlaces.forEach((enlace) => {
        enlace.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                menu.classList.remove("active");
                dropdown.classList.remove("open");

                menuToggle.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Abrir menú");

                dropButton.setAttribute("aria-expanded", "false");
            }
        });
    });

    // Restablecer el menú al cambiar a escritorio
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            menu.classList.remove("active");
            dropdown.classList.remove("open");
            menuToggle.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menú");
            dropButton.setAttribute("aria-expanded", "false");
        }
    });
});
