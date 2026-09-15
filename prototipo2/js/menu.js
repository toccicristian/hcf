document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu_bar");

    if (!menuToggle || !menu) {
        return;
    }

    const dropdowns = menu.querySelectorAll(".dropdown");

    // Abrir y cerrar el menú hamburguesa.
    menuToggle.addEventListener("click", () => {
        const menuAbierto = menu.classList.toggle("active");

        menuToggle.classList.toggle("active", menuAbierto);
        menuToggle.setAttribute("aria-expanded", menuAbierto);
        menuToggle.setAttribute(
            "aria-label",
            menuAbierto ? "Cerrar menú" : "Abrir menú"
        );
    });

    // En mobile, cada entrada con submenú se expande o contrae al tocarla.
    dropdowns.forEach((dropdown) => {
        const dropButton = dropdown.querySelector(":scope > .dropbtn");

        if (!dropButton) {
            return;
        }

        dropButton.addEventListener("click", (evento) => {
            if (window.innerWidth > 768) {
                return;
            }

            evento.preventDefault();

            const dropdownAbierto = dropdown.classList.toggle("open");
            dropButton.setAttribute("aria-expanded", dropdownAbierto);

            // Cerrar submenús descendientes si se contrae el padre.
            if (!dropdownAbierto) {
                dropdown.querySelectorAll(".dropdown.open").forEach((child) => {
                    child.classList.remove("open");

                    const childButton = child.querySelector(":scope > .dropbtn");
                    childButton?.setAttribute("aria-expanded", "false");
                });
            }
        });
    });

    // Cerrar el menú al elegir un enlace final.
    const enlacesFinales = menu.querySelectorAll(
        "a:not(.dropbtn)"
    );

    enlacesFinales.forEach((enlace) => {
        enlace.addEventListener("click", () => {
            if (window.innerWidth > 768) {
                return;
            }

            menu.classList.remove("active");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menú");

            dropdowns.forEach((dropdown) => {
                dropdown.classList.remove("open");

                const button = dropdown.querySelector(":scope > .dropbtn");
                button?.setAttribute("aria-expanded", "false");
            });
        });
    });

    // Restablecer estados mobile al cambiar a escritorio.
    window.addEventListener("resize", () => {
        if (window.innerWidth <= 768) {
            return;
        }

        menu.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");

        dropdowns.forEach((dropdown) => {
            dropdown.classList.remove("open");

            const button = dropdown.querySelector(":scope > .dropbtn");
            button?.setAttribute("aria-expanded", "false");
        });
    });
});
