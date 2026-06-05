const SUPABASE_URL = 'https:// fryayaa.github.io/tiyacantik/ .supabase.co'; // Pastikan HTTPS, bukan HTTP
// Konfigurasi Supabase (Ganti dengan URL dan Anon Key milikmu sendiri)
const SUPABASE_URL = 'https://XYZ_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ambil elemen DOM
const form = document.getElementById('wishbox-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const entriesContainer = document.getElementById('wishbox-entries');

// Fungsi untuk mengambil data ucapan dari Supabase
async function fetchWishes() {
    const { data, error } = await supabase
        .from('wishes') // Sesuaikan nama tabel di database kamu
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Gagal mengambil data:', error);
        entriesContainer.innerHTML = '<p style="color: red;">Gagal memuat ucapan.</p>';
        return;
    }

    // Jika data kosong
    if (data.length === 0) {
        entriesContainer.innerHTML = '<p style="color: #888; text-align: center;">Belum ada ucapan. Jadilah yang pertama!</p>';
        return;
    }

    // Render data ke dalam HTML
    entriesContainer.innerHTML = data.map(wish => `
        <div class="entry-card">
            <div class="entry-name">${escapeHTML(wish.name)}</div>
            <div class="entry-message">${escapeHTML(wish.message)}</div>
        </div>
    `).join('');
}

// Fungsi untuk mengirim ucapan baru ke Supabase
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) return;

    // Nonaktifkan tombol saat mengirim data
    const submitBtn = form.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Mengirim...';

    const { error } = await supabase
        .from('wishes')
        .insert([{ name, message }]);

    // Kembalikan status tombol
    submitBtn.disabled = false;
    submitBtn.innerText = 'Kirim Ucapan';

    if (error) {
        alert('Gagal mengirim ucapan, coba lagi nanti.');
        console.error(error);
    } else {
        // Reset form dan refresh daftar ucapan
        form.reset();
        fetchWishes();
    }
});

// Fungsi keamanan sederhana untuk mencegah Cross-Site Scripting (XSS)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Jalankan fungsi fetch pertama kali saat halaman dimuat
fetchWishes();
