// ==========================================
// GANTI DENGAN DATA PROYEK SUPABASE KAMU
// ==========================================
const SUPABASE_URL = 'https://XYZ_PROJECT_ID.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; 

// Inisialisasi Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ambil elemen dari HTML
const form = document.getElementById('wishbox-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const entriesContainer = document.getElementById('wishbox-entries');

// Fungsi Ambil Data (Fetch)
async function fetchWishes() {
    try {
        // Mengambil data dari tabel bernama 'wishes'
        const { data, error } = await supabase
            .from('wishes')
            .select('*')
            .order('created_at', { ascending: false });

        // Jika Supabase menolak/error
        if (error) {
            console.error(error);
            entriesContainer.innerHTML = `<p style="color: red; text-align: center; font-weight: bold;">
                Gagal memuat dari database!<br>
                Pesanan Error: ${error.message} (${error.code})
            </p>`;
            return;
        }

        // Jika koneksi sukses tapi database masih kosong
        if (!data || data.length === 0) {
            entriesContainer.innerHTML = '<p style="color: #888; text-align: center;">Belum ada ucapan. Yuk tulis ucapan pertama!</p>';
            return;
        }

        // Jika data ada, render ke layar
        entriesContainer.innerHTML = data.map(wish => `
            <div class="entry-card">
                <div class="entry-name">${escapeHTML(wish.name)}</div>
                <div class="entry-message">${escapeHTML(wish.message)}</div>
            </div>
        `).join('');

    } catch (err) {
        // Jika ada masalah koneksi internet atau CDN gagal dimuat
        console.error(err);
        entriesContainer.innerHTML = `<p style="color: red; text-align: center;">Error Sistem: ${err.message}</p>`;
    }
}

// Fungsi Kirim Data (Submit Form)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const submitBtn = document.getElementById('submit-btn');

    if (!name || !message) return;

    // Kunci tombol agar tidak di-klik dua kali
    submitBtn.disabled = true;
    submitBtn.innerText = 'Mengirim...';

    try {
        const { error } = await supabase
            .from('wishes')
            .insert([{ name, message }]);

        if (error) {
            alert(`Gagal mengirim: ${error.message}`);
            console.error(error);
        } else {
            form.reset(); // Kosongkan form jika berhasil
            await fetchWishes(); // Segera perbarui list ucapan
        }
    } catch (err) {
        alert(`Error Sistem: ${err.message}`);
    } finally {
        // Kembalikan tombol ke kondisi semula
        submitBtn.disabled = false;
        submitBtn.innerText = 'Kirim Ucapan';
    }
});

// Sistem Pengaman dari XSS (Script Injection)
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Jalankan pencarian data pertama kali saat web dibuka
fetchWishes();
