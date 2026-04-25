
  document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');

  function shuffleArray(array) { for(let i=array.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [array[i],array[j]]=[array[j],array[i]]; } return array; }

  let questions=Array.from(document.querySelectorAll('.question'));
  questions=shuffleArray(questions);
  const quizForm=document.getElementById('quizForm');
  questions.forEach(q=>quizForm.appendChild(q));

  questions.forEach((q,idx)=>{
    const h2=q.querySelector('h2');
    const text=h2.textContent.split('. ');
    if(text.length>1) h2.textContent=(idx+1)+'. '+text.slice(1).join('. ');
    const choicesDiv=q.querySelector('.choices');
    const labels=Array.from(choicesDiv.querySelectorAll('label'));
    const correctIndex=parseInt(q.getAttribute('data-correct-index'));
    let choiceArray=labels.map((label,index)=>({label,index}));
    shuffleArray(choiceArray);
    choicesDiv.innerHTML='';
    choiceArray.forEach((c,newIndex)=>{
      choicesDiv.appendChild(c.label);
      c.label.querySelector('input').value=newIndex;
      if(c.index===correctIndex) q.setAttribute('data-correct-index',newIndex);
    });
  });

  const timerSpan=document.getElementById('timer');
  const submitBtn=document.getElementById('submitBtn');
  const scoreInput=document.getElementById('score');
  const scoreDisplay=document.getElementById('scoreDisplay');
  const progressBar=document.getElementById('progressBar');
  const submittedAtInput=document.getElementById('submittedAt');

  let currentQuestion=0,timeLeft=20,score=0,timer;

  function showQuestion(index){
    const noQuizMsg=document.getElementById('noQuizMsg');
    if(questions.length===0){ noQuizMsg.style.display='block'; quizForm.style.display='none'; progressBar.style.width='0%'; submitBtn.style.display='none'; timerSpan.textContent='0'; scoreDisplay.textContent='0'; return; }
    noQuizMsg.style.display='none'; quizForm.style.display='block';
    questions.forEach((q,i)=>q.classList.toggle('active',i===index));
    progressBar.style.width=(currentQuestion/questions.length*100)+'%';
    resetTimer();
  }

  function resetTimer(){ clearInterval(timer); timeLeft=20; timerSpan.textContent=timeLeft; timer=setInterval(()=>{ timeLeft--; timerSpan.textContent=timeLeft; if(timeLeft<=0) checkAnswerAndNext(); },1000); }

  function checkAnswerAndNext(){
    clearInterval(timer);
    const current=questions[currentQuestion];
    const selected=current.querySelector('input[type="radio"]:checked');
    const correctAnswerIndex=parseInt(current.getAttribute('data-correct-index'));
    const choices=current.querySelectorAll("label");
    if(selected){
      const selectedIndex=parseInt(selected.value);
      current.querySelectorAll('input[type="radio"]').forEach(r=>r.disabled=true);
      choices.forEach((label,idx)=>{
        label.classList.remove("correct","incorrect");
        if(idx===correctAnswerIndex) label.classList.add("correct");
        if(idx===selectedIndex && selectedIndex!==correctAnswerIndex) label.classList.add("incorrect");
      });
      if(selectedIndex===correctAnswerIndex){ score++; scoreDisplay.textContent=score; }
    }
    setTimeout(()=>{
      currentQuestion++;
      if(currentQuestion<questions.length) showQuestion(currentQuestion);
      else {
        scoreInput.value=score;
        progressBar.style.width='100%';
        // record submitted_at in Nepali datetime
        const now=new Date();
        const nepaliDate = now.toLocaleString('ne-NP', { hour12:false });
        submittedAtInput.value = nepaliDate;
        submitBtn.style.display='inline-block';
      }
    },1000);
  }

  questions.forEach(q=>q.addEventListener('change',()=>checkAnswerAndNext()));
  showQuestion(0);

  submitBtn.addEventListener('click',()=>quizForm.submit());