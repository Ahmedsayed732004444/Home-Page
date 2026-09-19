import './style.css';
import { renderLifeWheel, setActiveSector } from './lifeWheel.js';
import { initQuiz } from './quiz.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Wheel of Life data — angular slot (design weight) + live score per sector.
  // Angles follow the original Figma layout (0deg = east, clockwise, y-down).
  const wheelSectors = [
    {
      id: 'health', title: 'الجانب الصحي', color: '#489674',
      desc: 'الحيوية، العافية الجسدية والنفسية، والتوازن الصحي اليومي.',
      score: 92, icon: '/icons/wheel_of_life/health.png', // محور طويل
      startAngle: 3.15, endAngle: 47.55,
    },
    {
      id: 'social', title: 'الجانب الاجتماعي', color: '#963056',
      desc: 'العلاقات وبناء شبكة علاقات متوازنة والتواصل المجتمعي المثمر.',
      score: 55, icon: '/icons/wheel_of_life/social.png', // محور قصير
      startAngle: 47.55, endAngle: 90.2,
    },
    {
      id: 'family', title: 'الجانب العائلي', color: '#BC7B4A',
      desc: 'الدفء العائلي والقرب والتواصل الإيجابي مع أفراد الأسرة.',
      score: 95, icon: '/icons/wheel_of_life/family.png', // محور طويل
      startAngle: 90.2, endAngle: 132.5,
    },
    {
      id: 'leisure', title: 'الجانب الترفيهي', color: '#B8AA44',
      desc: 'المتعة، الطاقة الإيجابية، والمرح وتجديد النشاط.',
      score: 50, icon: '/icons/wheel_of_life/leisure.png', // محور قصير
      startAngle: 132.5, endAngle: 178.05,
    },
    {
      id: 'financial', title: 'الجانب المالي', color: '#27797E',
      desc: 'النمو المالي، الاستقرار، التخطيط الاستثماري والإدارة المالية الواعية.',
      score: 90, icon: '/icons/wheel_of_life/financial.png', // محور طويل
      startAngle: 178.05, endAngle: 224.55,
    },
    {
      id: 'career', title: 'الجانب المهني', color: '#21487B',
      desc: 'العمل، الثقة، الإنجاز الوظيفي، وتحديد الأهداف المستقبلية.',
      score: 54, icon: '/icons/wheel_of_life/career.png', // محور قصير
      startAngle: 224.55, endAngle: 270.15,
    },
    {
      id: 'personal', title: 'الجانب الشخصي', color: '#5C3E9B',
      desc: 'الذات والنمو والتطوير الذاتي واكتشاف القدرات الكامنة.',
      score: 95, icon: '/icons/wheel_of_life/personal.png', // محور طويل
      startAngle: 270.15, endAngle: 316.95,
    },
    {
      id: 'spiritual', title: 'الجانب الروحي', color: '#5B6ECC',
      desc: 'السكينة، العمق، والصلة الروحية التي تمنح الحياة معناها وقيمتها.',
      score: 52, icon: '/icons/wheel_of_life/spiritual.png', // محور قصير
      startAngle: 316.95, endAngle: 363.15,
    },
  ];
  const sectorById = Object.fromEntries(wheelSectors.map(s => [s.id, s]));

  // Interactive feedback for wheel segments
  const wheelSvg = document.getElementById('life-wheel-svg');
  const spinBtn = document.getElementById('spin-wheel-btn');
  const spinBtnText = document.getElementById('spin-btn-text');
  const spinBtnIcon = document.getElementById('spin-btn-icon');
  const toggleAmbientBtn = document.getElementById('toggle-ambient-btn');
  const ambientIcon = document.getElementById('ambient-icon');
  const activeSectorDisplay = document.getElementById('active-sector-info');
  const sectorTitle = document.getElementById('sector-title');
  const sectorDesc = document.getElementById('sector-desc');
  const sectorPercent = document.getElementById('sector-percent');

  let wheelController = null;

  function activateSector(key) {
    const data = sectorById[key];
    if (data && activeSectorDisplay) {
      sectorTitle.textContent = data.title;
      sectorTitle.style.color = data.color;
      sectorDesc.textContent = data.desc;
      sectorPercent.textContent = `${data.score}%`;
      sectorPercent.style.backgroundColor = data.color;
      setActiveSector(wheelSvg, key);

      // Smooth pop animation on pill update
      activeSectorDisplay.classList.remove('pill-highlight');
      void activeSectorDisplay.offsetWidth;
      activeSectorDisplay.classList.add('pill-highlight');
    }
  }

  if (wheelSvg) {
    wheelController = renderLifeWheel(wheelSvg, wheelSectors, {
      onActivate: activateSector,
      label: (s) => s.title.replace('الجانب ', ''),
    });
    activateSector('personal');
  }

  if (spinBtn && wheelController) {
    spinBtn.addEventListener('click', () => {
      spinBtn.disabled = true;
      spinBtn.classList.add('opacity-80', 'cursor-not-allowed');
      if (spinBtnIcon) spinBtnIcon.classList.add('animate-spin');
      if (spinBtnText) spinBtnText.textContent = 'جاري التدوير...';

      wheelController.spin((target) => {
        spinBtn.disabled = false;
        spinBtn.classList.remove('opacity-80', 'cursor-not-allowed');
        if (spinBtnIcon) spinBtnIcon.classList.remove('animate-spin');
        if (spinBtnText) spinBtnText.textContent = `🎯 تم اختيار ${target.title}!`;

        setTimeout(() => {
          if (spinBtnText) spinBtnText.textContent = 'دوّر عجلة الحياة';
        }, 3200);
      });
    });
  }

  if (toggleAmbientBtn && wheelController) {
    toggleAmbientBtn.addEventListener('click', () => {
      const isRunning = wheelController.toggleAmbient();
      if (ambientIcon) {
        ambientIcon.className = isRunning ? 'fa-solid fa-pause text-sm' : 'fa-solid fa-play text-sm';
      }
      toggleAmbientBtn.title = isRunning ? 'إيقاف الدوران التلقائي' : 'تشغيل الدوران التلقائي';
    });
  }

  // 1. Interactive Quick Challenge (اختبار القدرات)
  initQuiz();

  console.log('دار الرؤى للتدريب - تم تحميل واجهة الموقع بنجاح');
});
