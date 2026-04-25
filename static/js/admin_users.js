const currentAdminId = window.ADMIN_DATA.adminId;
function toggleSidebar(){ document.getElementById('sidebar').classList.toggle('show'); }
function showToast(message,type="success"){
  const toast=document.getElementById("toast");
  toast.textContent=message;
  toast.className="toast show";
  if(type==="error")toast.classList.add("error");
  setTimeout(()=>toast.className="toast",2000);
}
function showSection(id,btn){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-button').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  if(window.innerWidth<768)toggleSidebar();
}

function redirectToQuizzes(){ showSection('quizzesSection'); }
function openEditModal(id){ const row=document.querySelector(`tr[data-id='${id}']`); if(!row)return; document.getElementById("editUserId").value=id; document.getElementById("editFirstName").value=row.querySelector(".first_name").innerText; document.getElementById("editLastName").value=row.querySelector(".last_name").innerText; document.getElementById("editUsername").value=row.querySelector(".username").innerText; document.getElementById("editEmail").value=row.querySelector(".email").innerText; document.getElementById("editRole").value=row.querySelector(".role").innerText.trim(); document.getElementById("editUserModal").style.display="flex"; }
function closeEditModal(){ document.getElementById("editUserModal").style.display="none"; }


let deleteTargetId=null; let deleteReportId=null; let deleteQuestionId = null;
function confirmDeleteUser(id){ const row=document.querySelector(`tr[data-id='${id}']`); const role=row.querySelector(".role").innerText.trim(); if(role==="admin"){showToast("❌ Cannot delete admin!","error");return;} if(parseInt(id)===currentAdminId){showToast("❌ Cannot delete yourself!","error");return;} deleteTargetId=id; deleteReportId=null; document.getElementById("deleteConfirmModal").style.display="flex"; }
function confirmDeleteReport(id){
  deleteReportId = id;
  deleteTargetId = null;
  deleteQuestionId = null; // make sure other delete flags are cleared
  document.getElementById("deleteConfirmModal").style.display = "flex";
}

function closeDeleteConfirm(){ document.getElementById("deleteConfirmModal").style.display="none"; deleteTargetId=null; deleteReportId=null; }


function confirmLogout() {
  document.getElementById("logoutModal").style.display = "flex";
}

function closeLogoutModal() {
  document.getElementById("logoutModal").style.display = "none";
}

document.getElementById("confirmLogoutBtn").addEventListener("click", function() {
  window.location.href = "/logout";
});

window.onclick=e=>{if(e.target.classList.contains('modal'))e.target.style.display='none';};

document.getElementById("editUserForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const data={id:editUserId.value, first_name:editFirstName.value, last_name:editLastName.value, username:editUsername.value, email:editEmail.value, role:editRole.value};
  try{
    const res=await fetch("/admin/update_user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    const result=await res.json();
    if(result.ok){
      const row=document.querySelector(`tr[data-id='${data.id}']`);
      row.querySelector(".first_name").innerText=data.first_name;
      row.querySelector(".last_name").innerText=data.last_name;
      row.querySelector(".username").innerText=data.username;
      row.querySelector(".email").innerText=data.email;
      row.querySelector(".role").innerText=data.role;
      closeEditModal(); showToast("✅ User updated!");
    }else showToast("❌ "+result.error,"error");
  }catch(e){showToast("❌ "+e.message,"error");}
});


document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
  try {

    if (deleteReportId) {
      const res = await fetch(`/admin/delete_report/${deleteReportId}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.ok) {
        
       const row = document.querySelector(`#reportsTable tr[data-id='${deleteReportId}']`);

        if (row) row.remove();
        showToast("🗑️ Report deleted!");
      } else {
        showToast("❌ " + result.error, 'error');
      }
      deleteReportId = null;
    }


    else if (deleteTargetId) {
      const res = await fetch(`/admin/delete_user/${deleteTargetId}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.ok) {
        document.querySelector(`tr[data-id='${deleteTargetId}']`).remove();
        showToast("🗑️ User deleted!");
      } else {
        showToast("❌ " + result.error, 'error');
      }
      deleteTargetId = null;
    }

    else if (deleteQuestionId) {
      const res = await fetch(`/admin/delete_question/${deleteQuestionId}`, { method:'DELETE' });
      const result = await res.json();
      if(result.ok){
        document.querySelector(`#questionsTable tr[data-id='${deleteQuestionId}']`).remove();
        showToast("🗑️ Question deleted!");
      } else showToast("❌ "+result.error,'error');
      deleteQuestionId = null;
    }

  } catch (err) {
    showToast("❌ " + err.message, 'error');
  }

  closeDeleteConfirm();
});

const facultySelect=document.getElementById('faculty');
const courseSelect=document.getElementById('course');

const coursesByFaculty = {
  science_tech: ["BE Computer", "BCA", "BE Civil"],
  management: ["BBA", "BBS"]
};

facultySelect.addEventListener('change',()=>{
  courseSelect.innerHTML='<option value="" disabled selected>-- Select Course --</option>';
  const selected=facultySelect.value;
  if(coursesByFaculty[selected]){
    coursesByFaculty[selected].forEach(c=>{
      const opt=document.createElement('option');
      opt.value=c; opt.text=c; courseSelect.appendChild(opt);
    });
  }
});

function saveSelections() {
  localStorage.setItem('faculty', facultySelect.value);
  localStorage.setItem('course', courseSelect.value);
  localStorage.setItem('semester', document.getElementById('semester').value);
  localStorage.setItem('quizLevel', document.getElementById('quizLevel').value);
}

function loadSelections() {
  const faculty = localStorage.getItem('faculty');
  const course = localStorage.getItem('course');
  const semester = localStorage.getItem('semester');
  const quizLevel = localStorage.getItem('quizLevel');

  if (faculty) {
    facultySelect.value = faculty;
    facultySelect.dispatchEvent(new Event('change'));

    setTimeout(() => {
      if (course) courseSelect.value = course;
    }, 100);
  }
  if (semester) document.getElementById('semester').value = semester;
  if (quizLevel) document.getElementById('quizLevel').value = quizLevel;
}

[facultySelect, courseSelect, document.getElementById('semester'), document.getElementById('quizLevel')]
  .forEach(sel => sel.addEventListener('change', saveSelections));

document.addEventListener('DOMContentLoaded', loadSelections);

document.getElementById("questionForm").addEventListener("submit", async function(e){
  e.preventDefault();
  const data = {
    faculty: facultySelect.value,
    course: courseSelect.value,
    semester: document.getElementById('semester').value,
    quizLevel: document.getElementById('quizLevel').value,
    questionText: document.getElementById('questionText').value,
    choice1: this.choice1.value,
    choice2: this.choice2.value,
    choice3: this.choice3.value,
    choice4: this.choice4.value,
    correctAnswer: this.correctAnswer.value
  };

  try {
    const res = await fetch('/add_question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.ok) {
      showToast("✅ Question added successfully!");
      document.getElementById('questionText').value = '';
      this.choice1.value = '';
      this.choice2.value = '';
      this.choice3.value = '';
      this.choice4.value = '';
      this.correctAnswer.forEach(r => r.checked = false);
    } else showToast("❌ " + result.error, 'error');
  } catch (err) {
    showToast("❌ " + err.message, 'error');
  }
});



if(window.innerWidth <= 768){
  let startY = 0;
  let isPulling = false;
  const threshold = 70; 

  window.addEventListener('touchstart', e => {
    if(window.scrollY === 0){
      startY = e.touches[0].clientY;
      isPulling = true;
    }
  });

  window.addEventListener('touchmove', e => {
    if(!isPulling) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if(diff > 0){
      document.body.style.transform = `translateY(${diff/2}px)`;
    }
  });

  window.addEventListener('touchend', e => {
    if(!isPulling) return;
    const endY = e.changedTouches[0].clientY;
    const diff = endY - startY;
    document.body.style.transition = 'transform 0.3s';
    document.body.style.transform = 'translateY(0)';
    if(diff > threshold){
      location.reload();
    }
    setTimeout(()=>{ document.body.style.transition=''; }, 300);
    isPulling = false;
  });
}

async function loadQuestions() {
  try {
    const res = await fetch('/admin/get_questions');
    const questions = await res.json();

    const tbody = document.querySelector('#questionsTable tbody');
    tbody.innerHTML = '';

    questions.forEach(q => {
      const tr = document.createElement('tr');
      tr.dataset.id = q.id;

      tr.innerHTML = `
        <td>${q.id}</td>
        <td>${q.faculty}</td>
        <td>${q.course}</td>
        <td>${q.semester}</td>
        <td>${q.quiz_level}</td>
        <td>${q.question_text}</td>
        <td>
          <button onclick="editQuestion(${q.id})">✏️</button>
          <button onclick="deleteQuestion(${q.id})">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showToast("❌ " + err.message, 'error');
  }
}

function editQuestion(id){
  fetch(`/admin/get_question/${id}`)
    .then(res=>res.json())
    .then(q=>{
      document.getElementById('editQuestionId').value = q.id;
      document.getElementById('editQuestionText').value = q.question;
      document.getElementById('editChoice1').value = q.choice1;
      document.getElementById('editChoice2').value = q.choice2;
      document.getElementById('editChoice3').value = q.choice3;
      document.getElementById('editChoice4').value = q.choice4;
      document.getElementById('editCorrect').value = q.correct_index + 1;
      document.getElementById('editQuestionModal').style.display = 'flex';
    });
}

function closeEditQuestionModal(){
  document.getElementById('editQuestionModal').style.display = 'none';
}

document.getElementById('editQuestionForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const id = document.getElementById('editQuestionId').value;
  const data = {
    question: document.getElementById('editQuestionText').value,
    choice1: document.getElementById('editChoice1').value,
    choice2: document.getElementById('editChoice2').value,
    choice3: document.getElementById('editChoice3').value,
    choice4: document.getElementById('editChoice4').value,
    correct_index: parseInt(document.getElementById('editCorrect').value) - 1
  };
  const res = await fetch(`/admin/update_question/${id}`, {
    method:'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if(result.ok){
    closeEditQuestionModal();
    loadQuestions();
    showToast("✅ Question updated!");
  } else showToast("❌ "+result.error, 'error');
});

function deleteQuestion(id){
  deleteQuestionId = id;
  deleteTargetId = null;
  deleteReportId = null;
  document.getElementById("deleteConfirmModal").style.display = "flex";
}

const originalShowSection = showSection;
showSection = function(id, btn){
  originalShowSection(id, btn);
  if(id === 'questionsSection') loadQuestions();
};
