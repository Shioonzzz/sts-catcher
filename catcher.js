/**
 * ==================================================================
 * File: catcher.js
 * Ini adalah "otak" dari layanan Smart Leads Catcher Anda.
 * File ini akan Anda simpan di server Anda sendiri, BUKAN diberikan ke klien.
 * ==================================================================
 */

(function() {
    // Fungsi ini akan berjalan otomatis saat script dimuat
    console.log("STS Smart Leads Catcher Engine v1.0 Loaded.");

    // Mengambil script tag kita sendiri untuk mendapatkan data-id
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
            // Mengabaikan input yang tidak relevan
            if (key.toLowerCase() !== 'submit' && key.toLowerCase() !== 'button') {
                data[key] = value;
            }
        });
        return data;
    }

    // Fungsi untuk mengirim data ke n8n
    async function sendToN8n(formData) {
        const payload = {
            clientId: clientId,
            sourceUrl: window.location.href,
            formData: formData,
            timestamp: new Date().toISOString()
        };

        console.log("STS Catcher: Mengirim data ke n8n...", payload);

        try {
            // Menggunakan fetch API untuk mengirim data
            await fetch(n8nWebhookUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors' // Menggunakan CORS
            });
            console.log("STS Catcher: Data berhasil dikirim!");
        } catch (error) {
            console.error("STS Catcher: Gagal mengirim data ke n8n:", error);
        }
    }

    // Mendeteksi semua formulir di halaman
    const allForms = document.querySelectorAll('form');
    
    allForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            // Script ini hanya "mengintip" data saat form dikirim,
            // dan tidak menghentikan fungsi asli dari form tersebut.
            const formData = getFormData(form);
            
            // Mengirim data di belakang layar
            sendToN8n(formData);
        });
    });

})();
