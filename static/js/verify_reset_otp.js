document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = "{{ url_for('forgot_password') }}";
});

setTimeout(() => {
  document.querySelectorAll('.flash').forEach(msg => {
    msg.style.opacity = 0;
    setTimeout(() => msg.remove(), 500);
  });
}, 2000);