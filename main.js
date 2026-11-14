
import { db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// Tahun footer
document.getElementById("year")?.textContent =
    new Date().getFullYear();

// Mobile menu
document.getElementById("menuToggle")
    ?.addEventListener("click", () => {
        document.getElementById("navigation")
            .classList.toggle("show");
    });

// Fungsi keamanan tampilan teks
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

// Layanan
onValue(ref(db, "services"), snapshot => {
    const data = snapshot.val();
    const container = document.getElementById("serviceGrid");

    if (!container) return;

    if (!data) return;

    const services = Object.values(data)
        .filter(item => item.active !== false);

    container.innerHTML = services.map((item, index) => `
        <div class="service-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${safeText(item.name)}</h3>
            <p>${safeText(item.description)}</p>
        </div>
    `).join("");
});

// Project
onValue(ref(db, "projects"), snapshot => {
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
                    <img src="${safeText(image)}"
                         alt="${safeText(item.title)}">
                ` : ""}
                <div class="project-info">
                    <h3>${safeText(item.title)}</h3>
                    <p>${safeText(item.category || "")}</p>
                </div>
            </div>
        `;
    }).join("");
});
