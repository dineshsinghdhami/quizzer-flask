 const facultySelect = document.getElementById('faculty');
    const courseSelect = document.getElementById('course');

    const courses = {
      science_tech: ['BE Computer', 'BE Civil', 'BCA'],
      management: ['BBA']
    };

    facultySelect.addEventListener('change', function () {
      const selectedFaculty = this.value;
      const courseOptions = courses[selectedFaculty] || [];

      courseSelect.innerHTML = '<option disabled selected>-- Select Course --</option>';
      courseOptions.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
      });
    });