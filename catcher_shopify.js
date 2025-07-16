/**
 * ==================================================================
 * File: catcher.js (v2 - Shopify Compatible)
 * Ini adalah versi yang lebih cerdas untuk menangani formulir modern
 * yang tidak selalu menggunakan 'submit' event standar.
 * ==================================================================
 */

(function() {
    // Fungsi ini akan berjalan otomatis saat script dimuat
    console.log("STS Smart Leads Catcher v2 (Shopify Ready) Aktif.");

    // Mengambil data-id dan data-webhook dari tag script
    const scriptTag = document.currentScript;
    const clientId = scriptTag.getAttribute('data-id');
    const n8nWebhookUrl = scriptTag.getAttribute('data-webhook');

    if (!clientId || !n8nWebhookUrl) {
        console.error("STS Catcher: Atribut 'data-id' atau 'data-webhook' tidak ditemukan. Instalasi tidak benar.");
        return;
    }

    // Fungsi untuk mengubah data formulir menjadi objek JSON
    function getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            // Mengabaikan input yang tidak relevan atau kosong
            if (value && key.toLowerCase() !== 'submit' && key.toLowerCase() !== 'button') {
                data[key] = value;
            }
        });
        // Memastikan objek tidak kosong
        return Object.keys(data).length > 0 ? data : null;
    }

    // Fungsi untuk mengirim data ke n8n
    async function sendToN8n(formData, formIdentifier) {
        if (!formData) return; // Jangan kirim jika data kosong

        const payload = {
            clientId: clientId,
            sourceUrl: window.location.href,
            formIdentifier: formIdentifier, // ID atau class dari form
            formData: formData,
            timestamp: new Date().toISOString()
        };

        console.log("STS Catcher: Mengirim data ke n8n...", payload);

        try {
            // Menggunakan fetch API untuk mengirim data
            await fetch(n8nWebhookUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors'
            });
            console.log("STS Catcher: Data berhasil dikirim!");
        } catch (error) {
            console.error("STS Catcher: Gagal mengirim data ke n8n:", error);
        }
    }

    // Fungsi untuk memproses formulir
    function processForm(form) {
        const formData = getFormData(form);
        const formIdentifier = form.id || form.className || 'unidentified_form';
        sendToN8n(formData, formIdentifier);
    }

    // --- STRATEGI PENANGKAPAN GANDA ---

    // 1. Mengawasi 'submit' event (untuk formulir standar)
    document.body.addEventListener('submit', function(event) {
        // event.target adalah formulir yang sedang di-submit
        if (event.target.tagName === 'FORM') {
            console.log("STS Catcher: Mendeteksi 'submit' event.");
            // Menunggu sesaat untuk memastikan semua field terisi sebelum mengirim
            setTimeout(() => processForm(event.target), 100);
        }
    }, true); // Menggunakan capture phase untuk menangkap event lebih awal

    // 2. Mengawasi 'click' event pada tombol di dalam form (untuk form Shopify/AJAX)
    document.body.addEventListener('click', function(event) {
        // Cek apakah yang diklik adalah tombol submit atau tombol di dalam form
        let targetElement = event.target;
        if (targetElement.tagName === 'BUTTON' && targetElement.type === 'submit' || (targetElement.tagName === 'INPUT' && targetElement.type === 'submit')) {
            const form = targetElement.closest('form');
            if (form) {
                console.log("STS Catcher: Mendeteksi 'click' pada tombol submit.");
                // Menunggu sesaat untuk memberikan waktu pada script lain berjalan
                setTimeout(() => processForm(form), 100);
            }
        }
    }, true);

})();
