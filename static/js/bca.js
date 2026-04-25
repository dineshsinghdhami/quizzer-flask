
    const semesterListDiv = document.getElementById("semesterList");
    const levelsContainer = document.getElementById("levelsContainer");
    const selectedSemesterTitle = document.getElementById("selectedSemesterTitle");
    const goBackBtn = document.getElementById("goBackBtn");
    let selectedSemester = null;

    for(let i=1; i<=8; i++){
      const semDiv = document.createElement("div");
      semDiv.textContent = "Semester " + i;
      semDiv.className = "semester";
      semDiv.addEventListener("click", () => selectSemester(semDiv.textContent, semDiv));
      semesterListDiv.appendChild(semDiv);
    }

    function selectSemester(name, clickedElement){
      selectedSemester = name;
      selectedSemesterTitle.textContent = name;
      levelsContainer.classList.remove("hidden");

      selectedSemesterTitle.style.animation = "none";
      levelsContainer.style.animation = "none";
      void selectedSemesterTitle.offsetWidth;
      void levelsContainer.offsetWidth;
      selectedSemesterTitle.style.animation = "fadeInMoveDown 0.5s forwards";
      levelsContainer.style.animation = "fadeInMoveUp 0.5s forwards";

      document.querySelectorAll(".semester").forEach(el => el.classList.remove("active"));
      clickedElement.classList.add("active");
    }

    levelsContainer.addEventListener("click", (e)=>{
      if(e.target.classList.contains("level-btn") && selectedSemester){
        const level = e.target.getAttribute("data-level");
        const semesterNumber = selectedSemester.split(" ")[1];
        const url = `/quiz?faculty=science_tech&course=BCA&semester=${encodeURIComponent(semesterNumber)}&level=${encodeURIComponent(level.toLowerCase())}`;
        window.location.href = url;
      }
    });

    goBackBtn.addEventListener("click", ()=>{
      window.location.href = "/student_dashboard";
    });

    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    function setTheme(mode) {
      html.setAttribute('data-theme', mode);
      localStorage.setItem('theme', mode);
      themeToggle.innerHTML = mode === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    }

    const currentTheme = localStorage.getItem('theme') || 'light';
    setTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
      const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });