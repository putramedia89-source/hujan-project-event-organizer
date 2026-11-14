
import { db, auth } from "../firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    ref,
    get,
    onValue,
    push,
    set,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const $ = id => document.getElementById(id);

let bookingData = {};
let serviceData = {};
let projectData = {};

// LOGIN ADMIN

$("loginForm").addEventListener("submit", async e => {

    e.preventDefault();

    $("loginError").textContent = "";

    try {

        await signInWithEmailAndPassword(
            auth,
            $("email").value,
            $("password").value
        );

    } catch(error) {

        console.error(error);

        $("loginError").textContent =
            "Login gagal. Periksa email dan password.";

    }

});

// VERIFIKASI ADMIN

onAuthStateChanged(auth, async user => {

    if (!user) {

        $("loginScreen").classList.remove("hidden");
        $("adminApp").classList.add("hidden");

        return;
    }

    try {

        const adminSnapshot = await get(
            ref(db, "admins/" + user.uid)
        );

        if (adminSnapshot.val() !== true) {

            await signOut(auth);

            $("loginError").textContent =
                "Akun ini belum memiliki akses admin.";

            return;
        }

        $("loginScreen").classList.add("hidden");
        $("adminApp").classList.remove("hidden");

        loadDashboard();

    } catch(error) {

        console.error(error);

        await signOut(auth);

        $("loginError").textContent =
            "Gagal memverifikasi admin. Periksa Firebase Rules.";

    }

});

// LOGOUT

$("logoutBtn").addEventListener("click", () => {
    signOut(auth);
});

// NAVIGASI DASHBOARD

document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".nav-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        document.querySelectorAll(".tab-panel")
            .forEach(panel => panel.classList.add("hidden"));

        const tab = button.dataset.tab;

        $(tab + "Tab").classList.remove("hidden");

        $("pageTitle").textContent =
            button.textContent.trim();

    });

});

// LOAD DATA

function loadDashboard() {

    onValue(ref(db, "bookings"), snapshot => {

        bookingData = snapshot.val() || {};

        renderBookings();

    });

    onValue(ref(db, "services"), snapshot => {

        serviceData = snapshot.val() || {};

        renderServices();

    });

    onValue(ref(db, "projects"), snapshot => {

        projectData = snapshot.val() || {};

        renderProjects();

        $("totalProjects").textContent =
            Object.keys(projectData).length;

    });

}

// BOOKING

function renderBookings() {

    const entries = Object.entries(bookingData);

    const pending = entries.filter(
        ([id, item]) => item.status === "pending"
    ).length;

    const processing = entries.filter(
        ([id, item]) => item.status === "processing"
    ).length;

    $("totalBookings").textContent = entries.length;
    $("pendingBookings").textContent = pending;
    $("processingBookings").textContent = processing;

    const sorted = entries.sort(
        (a, b) => (b[1].createdAt || 0) -
                  (a[1].createdAt || 0)
    );

    if (sorted.length === 0) {

        $("bookingTable").innerHTML =
            '<div class="empty">Belum ada booking masuk.</div>';

        $("recentBookings").innerHTML =
            '<div class="empty">Belum ada booking.</div>';

        return;
    }

    $("bookingTable").innerHTML = `
        <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Nama Klien</th>
                    <th>Event</th>
                    <th>Tanggal</th>
                    <th>WhatsApp</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(([id, b]) => `
                    <tr>
                        <td>
                            <b>${escapeHTML(b.name)}</b><br>
                            ${escapeHTML(b.company || "-")}
                        </td>

                        <td>
                            ${escapeHTML(b.eventType)}<br>
                            ${escapeHTML(b.service)}
                        </td>

                        <td>
                            ${escapeHTML(b.eventDate)}<br>
                            ${escapeHTML(b.location || "-")}
                        </td>

                        <td>
                            ${escapeHTML(b.phone)}<br>
                            ${escapeHTML(b.email || "-")}
                        </td>

                        <td>
                            <select class="status-select"
                                data-id="${escapeHTML(id)}">

                                <option value="pending"
                                    ${b.status === "pending" ? "selected" : ""}>
                                    Pending
                                </option>

                                <option value="processing"
                                    ${b.status === "processing" ? "selected" : ""}>
                                    Diproses
                                </option>

                                <option value="accepted"
                                    ${b.status === "accepted" ? "selected" : ""}>
                                    Diterima
                                </option>

                                <option value="rejected"
                                    ${b.status === "rejected" ? "selected" : ""}>
                                    Ditolak
                                </option>

                                <option value="completed"
                                    ${b.status === "completed" ? "selected" : ""}>
                                    Selesai
                                </option>

                            </select>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        </div>
    `;

    $("recentBookings").innerHTML = `
        <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Klien</th>
                    <th>Jenis Event</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>
                ${sorted.slice(0, 5).map(([id, b]) => `
                    <tr>
                        <td>${escapeHTML(b.name)}</td>
                        <td>${escapeHTML(b.eventType)}</td>
                        <td>${escapeHTML(b.eventDate)}</td>
                        <td>${escapeHTML(b.status)}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        </div>
    `;

    document.querySelectorAll(".status-select")
        .forEach(select => {

            select.addEventListener("change", async () => {

                try {

                    await update(
                        ref(db, "bookings/" + select.dataset.id),
                        { status: select.value }
                    );

                } catch(error) {

                    alert("Gagal memperbarui status booking.");
                    console.error(error);

                }

            });

        });

}

// TAMBAH LAYANAN

$("serviceForm").addEventListener("submit", async e => {

    e.preventDefault();

    const name = $("serviceName").value.trim();
    const description = $("serviceDescription").value.trim();

    if (!name || !description) return;

    try {

        await set(push(ref(db, "services")), {
            name,
            description,
            active: true,
            createdAt: Date.now()
        });

        e.target.reset();

    } catch(error) {

        alert("Gagal menambahkan layanan.");
        console.error(error);

    }

});

// TAMPILKAN LAYANAN

function renderServices() {

    $("serviceList").innerHTML =
        Object.entries(serviceData).map(([id, item]) => `

            <div class="item-row">

                <div>
                    <b>${escapeHTML(item.name)}</b>
                    <small>${escapeHTML(item.description)}</small>
                </div>

                <button class="delete-btn"
                    data-service="${escapeHTML(id)}">
                    Hapus
                </button>

            </div>

        `).join("") || '<div class="empty">Belum ada layanan.</div>';

    document.querySelectorAll("[data-service]")
        .forEach(button => {

            button.addEventListener("click", async () => {

                if (!confirm("Hapus layanan ini?")) return;

                try {

                    await remove(
                        ref(db, "services/" + button.dataset.service)
                    );

                } catch(error) {

                    alert("Gagal menghapus layanan.");

                }

            });

        });

}

// TAMBAH PROJECT

$("projectForm").addEventListener("submit", async e => {

    e.preventDefault();

    const title = $("projectTitle").value.trim();
    const category = $("projectCategory").value.trim();
    const imageUrl = $("projectImage").value.trim();

    if (!title) return;

    try {

        await set(push(ref(db, "projects")), {
            title,
            category,
            imageUrl,
            active: true,
            createdAt: Date.now()
        });

        e.target.reset();

    } catch(error) {

        alert("Gagal menambahkan project.");

    }

});

// TAMPILKAN PROJECT

function renderProjects() {

    $("projectList").innerHTML =
        Object.entries(projectData).map(([id, item]) => `

            <div class="item-row">

                <div>
                    <b>${escapeHTML(item.title)}</b>
                    <small>${escapeHTML(item.category || "-")}</small>
                </div>

                <button class="delete-btn"
                    data-project="${escapeHTML(id)}">
                    Hapus
                </button>

            </div>

        `).join("") || '<div class="empty">Belum ada project.</div>';

    document.querySelectorAll("[data-project]")
        .forEach(button => {

            button.addEventListener("click", async () => {

                if (!confirm("Hapus project ini?")) return;

                try {

                    await remove(
                        ref(db, "projects/" + button.dataset.project)
                    );

                } catch(error) {

                    alert("Gagal menghapus project.");

                }

            });

        });

}

// ESCAPE HTML

function escapeHTML(value) {

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
