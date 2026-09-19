// ============================================================================
// QUIZ MODULE — دار الرؤى (التحدي السريع)
// ============================================================================
// يدعم الأسئلة النصية والأسئلة البصرية (الأنماط)، وجاهز للربط بقاعدة البيانات مستقبلاً.

import confetti from 'canvas-confetti';

export const defaultQuestions = [
  {
    id: 1,
    question: 'ما الشكل التالي في النمط؟',
    type: 'pattern',
    patternRow: ['2-vert', '4-grid', '2-vert', 'question'],
    options: ['3-tr', '3-tl', '2-diag', '2-horiz'],
    correctIndex: 1,
    initialBtnText: 'ابدأ التحدي'
  },
  {
    id: 2,
    question: 'ما الرقم التالي في المتتالية: ٢، ٤، ٨، ١٦؟',
    type: 'text',
    options: ['٢٤', '٣٢', '٢٠', '٢٨'],
    correctIndex: 1 // ٣٢
  },
  {
    id: 3,
    question: 'قلم : كتابة = مقص : ؟',
    type: 'text',
    options: ['خياطة', 'قطع', 'حديد', 'ألوان'],
    correctIndex: 1 // قطع
  }
];

// Helper: Generates HTML for dot patterns inside sequence cards and options
function renderDotContent(dotType) {
  switch (dotType) {
    case '2-vert':
      return `
        <div class="flex flex-col items-center justify-center gap-1.5 sm:gap-2">
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
        </div>`;
    case '4-grid':
      return `
        <div class="grid grid-cols-2 gap-1.5 sm:gap-2">
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
        </div>`;
    case 'question':
      return `<span class="text-[22px] sm:text-[26px] font-bold text-[#204A7A] leading-none">؟</span>`;
    case '3-tr':
      return `
        <div class="flex items-center gap-2 sm:gap-2.5">
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F] self-start mt-0.5"></span>
          <div class="flex flex-col gap-1.5 sm:gap-2">
            <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
            <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
          </div>
        </div>`;
    case '3-tl':
      return `
        <div class="flex items-center gap-2 sm:gap-2.5">
          <div class="flex flex-col gap-1.5 sm:gap-2">
            <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
            <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
          </div>
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F] self-end mb-0.5"></span>
        </div>`;
    case '2-diag':
      return `
        <div class="flex items-center gap-2.5 sm:gap-3.5">
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F] self-end mb-0.5"></span>
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F] self-start mt-0.5"></span>
        </div>`;
    case '2-horiz':
      return `
        <div class="flex items-center gap-2.5 sm:gap-3">
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
          <span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#1E3A5F]"></span>
        </div>`;
    default:
      return '';
  }
}

export function initQuiz(customQuestions = null) {
  const questions = customQuestions || defaultQuestions;
  let currentIndex = 0;
  let selectedOption = null;
  const userAnswers = [];

  const widget = document.getElementById('quiz-widget');
  const questionCard = document.getElementById('quiz-question-card');
  const resultCard = document.getElementById('quiz-result-card');
  const counterEl = document.getElementById('quiz-counter');
  const progressContainer = document.getElementById('quiz-progress-dots');
  const questionTitleEl = document.getElementById('quiz-question-title');
  const patternContainer = document.getElementById('quiz-pattern-container');
  const optionsContainer = document.getElementById('quiz-options-container');
  const actionBtn = document.getElementById('quiz-action-btn');
  const btnText = document.getElementById('quiz-btn-text');
  const scoreText = document.getElementById('quiz-score-text');
  const restartBtn = document.getElementById('quiz-restart-btn');

  if (!widget || !questionCard || !optionsContainer || !actionBtn) return;

  function renderQuestion() {
    const q = questions[currentIndex];
    selectedOption = null;

    // Reset action button state
    actionBtn.disabled = true;
    actionBtn.className = 'w-full h-[56px] sm:h-[62px] rounded-[18px] sm:rounded-[20px] bg-[#BAC7D5] text-white font-bold text-[18px] sm:text-[20px] font-cairo flex items-center justify-center gap-2.5 cursor-not-allowed transition-all duration-200 shadow-sm';

    // Button label
    const isLast = currentIndex === questions.length - 1;
    let label = isLast ? 'شاهد نتيجتك' : 'التالي';
    if (currentIndex === 0 && q.initialBtnText) {
      label = q.initialBtnText;
    }
    if (btnText) {
      btnText.textContent = label;
    }

    // Question counter
    if (counterEl) {
      counterEl.textContent = `سؤال ${currentIndex + 1} من ${questions.length}`;
    }

    // Progress dashes
    if (progressContainer) {
      progressContainer.innerHTML = '';
      for (let i = 0; i < questions.length; i++) {
        const dot = document.createElement('span');
        if (i === currentIndex) {
          dot.className = 'quiz-dash w-7 sm:w-8 h-2 sm:h-2.5 rounded-full bg-[#204A7A] transition-all duration-300';
        } else if (i < currentIndex) {
          dot.className = 'quiz-dash w-3.5 sm:w-4 h-1.5 sm:h-2 rounded-full bg-[#CBD5E1] transition-all duration-300';
        } else {
          dot.className = 'quiz-dash w-3.5 sm:w-4 h-1.5 sm:h-2 rounded-full bg-[#CBD5E1] transition-all duration-300';
        }
        progressContainer.appendChild(dot);
      }
    }

    // Question title
    if (questionTitleEl) {
      questionTitleEl.textContent = q.question;
    }

    // Render Pattern Sequence Row if question is pattern-based
    if (q.type === 'pattern' && q.patternRow && patternContainer) {
      patternContainer.classList.remove('hidden');
      patternContainer.className = 'flex items-center justify-center gap-3 sm:gap-4 my-6 sm:my-8';
      patternContainer.innerHTML = '';

      q.patternRow.forEach(item => {
        const card = document.createElement('div');
        if (item === 'question') {
          card.className = 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-[16px] sm:rounded-[20px] bg-white border-2 border-dashed border-[#204A7A]/40 flex items-center justify-center shadow-sm';
        } else {
          card.className = 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-[16px] sm:rounded-[20px] bg-white border border-[#DCE4EE] flex items-center justify-center shadow-sm';
        }
        card.innerHTML = renderDotContent(item);
        patternContainer.appendChild(card);
      });
    } else if (patternContainer) {
      patternContainer.classList.add('hidden');
      patternContainer.innerHTML = '';
    }

    // Render Options
    optionsContainer.innerHTML = '';

    if (q.type === 'pattern') {
      // 4 pills in a row matching reference screenshot
      optionsContainer.className = 'flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5 my-6 sm:my-8';

      q.options.forEach((optType, optIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option h-[56px] sm:h-[66px] px-5 sm:px-8 rounded-[18px] sm:rounded-[22px] bg-white border border-[#DCE4EE] flex items-center justify-center shadow-sm hover:border-brand-primary hover:shadow-md transition-all duration-200 cursor-pointer';
        btn.innerHTML = renderDotContent(optType);

        btn.addEventListener('click', () => {
          selectedOption = optIdx;

          // Reset all
          optionsContainer.querySelectorAll('.quiz-option').forEach(b => {
            b.className = 'quiz-option h-[56px] sm:h-[66px] px-5 sm:px-8 rounded-[18px] sm:rounded-[22px] bg-white border border-[#DCE4EE] flex items-center justify-center shadow-sm hover:border-brand-primary hover:shadow-md transition-all duration-200 cursor-pointer';
          });

          // Selected
          btn.className = 'quiz-option h-[56px] sm:h-[66px] px-5 sm:px-8 rounded-[18px] sm:rounded-[22px] bg-[#F0F5FA] border-2 border-brand-primary flex items-center justify-center shadow-md scale-[1.02] transition-all duration-200 cursor-pointer';

          // Enable button
          actionBtn.disabled = false;
          actionBtn.className = 'w-full h-[56px] sm:h-[62px] rounded-[18px] sm:rounded-[20px] bg-brand-primary hover:bg-[#102744] text-white font-bold text-[18px] sm:text-[20px] font-cairo flex items-center justify-center gap-2.5 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border-2 border-brand-primary';
          if (btnText) {
            btnText.textContent = isLast ? 'شاهد نتيجتك' : 'التالي';
          }
        });

        optionsContainer.appendChild(btn);
      });

    } else {
      // 2x2 Grid for Text Questions matching reference screenshots
      optionsContainer.className = 'grid grid-cols-2 gap-4 sm:gap-6 my-6 sm:my-8';

      q.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option h-[72px] sm:h-[84px] md:h-[90px] rounded-[22px] sm:rounded-[26px] bg-white border border-[#E2E8F0] text-[#1E293B] text-[22px] sm:text-[25px] md:text-[28px] font-bold font-cairo flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#F8FAFC] hover:border-brand-primary hover:text-brand-primary shadow-[0px_2px_8px_rgba(0,0,0,0.02)]';
        btn.textContent = optText;

        btn.addEventListener('click', () => {
          selectedOption = optIdx;

          // Reset all
          optionsContainer.querySelectorAll('.quiz-option').forEach(b => {
            b.className = 'quiz-option h-[72px] sm:h-[84px] md:h-[90px] rounded-[22px] sm:rounded-[26px] bg-white border border-[#E2E8F0] text-[#1E293B] text-[22px] sm:text-[25px] md:text-[28px] font-bold font-cairo flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#F8FAFC] hover:border-brand-primary hover:text-brand-primary shadow-[0px_2px_8px_rgba(0,0,0,0.02)]';
          });

          // Selected
          btn.className = 'quiz-option h-[72px] sm:h-[84px] md:h-[90px] rounded-[22px] sm:rounded-[26px] bg-[#F0F5FA] border-2 border-brand-primary text-brand-primary text-[22px] sm:text-[25px] md:text-[28px] font-bold font-cairo flex items-center justify-center cursor-pointer shadow-md transition-all duration-200';

          // Enable button
          actionBtn.disabled = false;
          actionBtn.className = 'w-full h-[56px] sm:h-[62px] rounded-[18px] sm:rounded-[20px] bg-brand-primary hover:bg-[#102744] text-white font-bold text-[18px] sm:text-[20px] font-cairo flex items-center justify-center gap-2.5 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border-2 border-brand-primary';
          if (btnText) {
            btnText.textContent = isLast ? 'شاهد نتيجتك' : 'التالي';
          }
        });

        optionsContainer.appendChild(btn);
      });
    }

    questionCard.classList.remove('hidden');
    if (resultCard) resultCard.classList.add('hidden');
  }

  // Next / Submit handler
  actionBtn.addEventListener('click', () => {
    if (selectedOption === null) return;

    userAnswers[currentIndex] = selectedOption;

    if (currentIndex < questions.length - 1) {
      questionCard.classList.add('opacity-0', 'transition-opacity', 'duration-150');
      setTimeout(() => {
        currentIndex++;
        renderQuestion();
        questionCard.classList.remove('opacity-0');
      }, 150);
    } else {
      showResult();
    }
  });

  function fireCelebrationConfetti() {
    const launch = typeof confetti === 'function' ? confetti : (window.confetti || null);
    if (typeof launch === 'function') {
      // 1. Initial central pop around the trophy
      launch({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#FFD700', '#204A7A', '#F59E0B', '#3B82F6', '#EC4899', '#10B981'],
        zIndex: 9999
      });

      // 2. Dual celebratory side cannons shooting upward
      setTimeout(() => {
        launch({
          particleCount: 45,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.65 },
          colors: ['#FFD700', '#204A7A', '#F59E0B', '#3B82F6', '#EC4899']
        });
        launch({
          particleCount: 45,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.65 },
          colors: ['#FFD700', '#204A7A', '#F59E0B', '#3B82F6', '#EC4899']
        });
      }, 220);

      // 3. Falling stars and shimmering discs
      setTimeout(() => {
        launch({
          particleCount: 35,
          spread: 100,
          origin: { y: 0.4 },
          shapes: ['star', 'circle'],
          colors: ['#FFD700', '#FFA500', '#204A7A', '#FFFFFF']
        });
      }, 450);
    }
  }

  function showResult() {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    if (questionCard) questionCard.classList.add('hidden');
    if (resultCard) {
      resultCard.classList.remove('hidden');

      const scoreNumEl = document.getElementById('quiz-score-num');
      const totalNumEl = document.getElementById('quiz-total-num');
      const resultTitleEl = document.getElementById('quiz-result-title');
      const trophyImg = document.getElementById('quiz-trophy-img');

      if (scoreNumEl) scoreNumEl.textContent = score;
      if (totalNumEl) totalNumEl.textContent = questions.length;

      if (resultTitleEl) {
        resultTitleEl.textContent = 'محاولة جيدة!';
      }

      // Trophy pop animation
      if (trophyImg) {
        trophyImg.classList.remove('animate-trophy-pop');
        void trophyImg.offsetWidth;
        trophyImg.classList.add('animate-trophy-pop');
      }

      // Fire celebratory confetti!
      fireCelebrationConfetti();
    }
  }

  // Restart handler
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentIndex = 0;
      userAnswers.length = 0;
      renderQuestion();
    });
  }

  // Initial render
  renderQuestion();
}

