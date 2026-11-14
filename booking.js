
import { db } from "./firebase.js";

import {
    ref,
    push,
    set,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const form = document.getElementById("bookingForm");
const message = document.getElementById("bookingMessage");
const button = document.getElementById("submitBooking");

form.addEventListener("submit", async function(e) {

    e.preventDefault();

    button.disabled = true;
    button.textContent = "Mengirim Booking...";

    message.textContent = "";

    const formData = new FormData(form);

    const booking = Object.fromEntries(formData.entries());

    // Normalisasi nomor WhatsApp
    booking.phone = booking.phone.trim();

    try {

        const bookingRef = push(ref(db, "bookings"));

        await set(bookingRef, {
            ...booking,
            status: "pending",
            createdAt: serverTimestamp()
        });

        form.reset();

        message.style.color = "green";

        message.textContent =
            "Booking berhasil dikirim! Tim Hujan Project akan menghubungi Anda.";

    } catch(error) {

        console.error("Booking error:", error);

        message.style.color = "red";

        message.textContent =
            "Booking gagal dikirim. Silakan coba kembali.";

    } finally {

        button.disabled = false;
        button.textContent = "Kirim Booking →";

    }

});
