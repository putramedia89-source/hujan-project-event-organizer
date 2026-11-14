
import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/* =====================================
   FOOTER YEAR
===================================== */

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

/* =====================================
   MOBILE NAVIGATION
===================================== */

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

if (menuToggle && navigation) {

    menuToggle.setAttribute("aria-label", "Buka menu");
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {

        const isOpen = navigation.classList.toggle("show");

        menuToggle.innerHTML = isOpen ? "&times;" : "&#9776;";
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Tutup menu" : "Buka menu"
        );

    });

    // Tutup menu setelah link dipilih
    navigation.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navigation.classList.remove("show");

            menuToggle.innerHTML = "&#9776;";
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Buka menu");

        });

    });

    // Tutup menu jika pengguna klik di luar navbar
    document.addEventListener("click", event => {

        if (
            !navigation.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            navigation.classList.remove("show");

            menuToggle.innerHTML = "&#9776;";
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Buka menu");

        }

    });

}

/* =====================================
   SAFE TEXT
===================================== */

function safeText(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]
    );

}

/* =====================================
   SERVICES FROM FIREBASE
===================================== */

onValue(
    ref(db, "services"),
    snapshot => {

        const data = snapshot.val();
        const container = document.getElementById("serviceGrid");

        if (!container || !data) return;

        const services = Object.values(data)
            .filter(item => item.active !== false);

        if (!services.length) return;

        container.innerHTML = services.map((item, index) => `

            <div class="service-card">

                <span>${String(index + 1).padStart(2, "0")}</span>

                <h3>${safeText(item.name)}</h3>

                <p>${safeText(item.description)}</p>

            </div>

        `).join("");

    }
);

/* =====================================
   PROJECTS FROM FIREBASE
===================================== */

onValue(
    ref(db, "projects"),
    snapshot => {

        const data = snapshot.val();
        const container = document.getElementById("projectGrid");

        if (!container || !data) return;

        const projects = Object.values(data)
            .filter(item => item.active !== false);

        if (!projects.length) return;

        container.innerHTML = projects.map(item => {

            let image = "";

            try {

                const url = new URL(item.imageUrl);

                if (url.protocol === "https:") {
                    image = url.href;
                }

            } catch {}

            return `

                <div class="project-card">

                    ${image ? `

                        <img
                            src="${safeText(image)}"
                            alt="${safeText(item.title)}"
                            loading="lazy"
                        >

                    ` : ""}

                    <div class="project-info">

                        <h3>${safeText(item.title)}</h3>

                        <p>${safeText(item.category || "")}</p>

                    </div>

                </div>

            `;

        }).join("");

    }
);
