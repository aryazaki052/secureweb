document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('edit-form');
  if (form) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    document.getElementById('edit-id').value = id; // Isi ID ke input hidden

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('edit-name').value;
      const price = document.getElementById('edit-price').value;

      console.log('Form submitted');
      console.log('ID:', id, 'Name:', name, 'Price:', price);

      try {
        const response = await fetch(`http://localhost:3000/edit/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, price }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Product updated successfully');
          window.location.href = 'index.html'; // Redirect ke halaman produk
        } else {
          alert('Failed to update product');
        }
      } catch (error) {
        console.error('Error connecting to server 3000:', error);
        alert('Error connecting to server');
      }
    });
  }
});


document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('create-form');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Ambil data dari form
      const name = document.getElementById('name').value;
      const price = document.getElementById('price').value;

      // Tampilkan data di console untuk debugging
      console.log('Form submitted');
      console.log('Name:', name, 'Price:', price);

      try {
        // Mengirim data ke server menggunakan metode POST
        const response = await fetch('http://localhost:3000/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, price }), // Kirim data ke server
        });

        // Mengecek apakah response berhasil
        const data = await response.json();

        if (response.ok) {
          alert('Product created successfully');
          window.location.href = 'index.html'; // Redirect ke halaman daftar produk
        } else {
          alert(data.error || 'Failed to create product');
        }
      } catch (error) {
        console.error('Error connecting to server 3000:', error);
        alert('Error connecting to server');
      }
    });
  }
});
