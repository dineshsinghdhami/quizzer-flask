window.addEventListener('DOMContentLoaded', () => {
  const successMsg = document.querySelector('.flash-success, .text-green-600');
  if (successMsg && successMsg.textContent.includes("Password changed successfully")) {
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  }
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        btn.innerHTML = '<i class="fa fa-eye-slash"></i>';
      } else {
        input.type = "password";
        btn.innerHTML = '<i class="fa fa-eye"></i>';
      }
    });
  });
});