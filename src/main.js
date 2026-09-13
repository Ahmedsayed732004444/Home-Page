import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Wheel of Life interactive sector data
  const wheelSectors = {
    'personal': {
      title: 'الجانب الشخصي',
      color: '#5C3E9B',
      desc: 'الذات والنمو والتطوير الذاتي واكتشاف القدرات الكامنة.',
      percent: '85%'
    },
    'family': {
      title: 'الجانب العائلي',
      color: '#BC7B4A',
      desc: 'الدفء العائلي والقرب والتواصل الإيجابي مع أفراد الأسرة.',
      percent: '90%'
    },
    'social': {
      title: 'الجانب الاجتماعي',
      color: '#963056',
      desc: 'العلاقات وبناء شبكة علاقات متوازنة والتواصل المجتمعي المثمر.',
      percent: '75%'
    },
    'career': {
      title: 'الجانب المهني',
      color: '#21487B',
      desc: 'العمل، الثقة، الإنجاز الوظيفي، وتحديد الأهداف المستقبلية.',
      percent: '80%'
    },
    'financial': {
      title: 'الجانب المالي',
      color: '#27797E',
      desc: 'النمو المالي، الاستقرار، التخطيط الاستثماري والإدارة المالية الواعية.',
      percent: '70%'
    },
    'health': {
      title: 'الجانب الصحي',
      color: '#489674',
      desc: 'الحيوية، العافية الجسدية والنفسية، والتوازن الصحي اليومي.',
      percent: '85%'
    },
    'spiritual': {
      title: 'الجانب الروحي',
      color: '#5B6ECC',
      desc: 'السكينة، العمق، والصلة الروحية التي تمنح الحياة معناها وقيمتها.',
      percent: '95%'
    },
    'leisure': {
      title: 'الجانب الترفيهي',
      color: '#B8AA44',
      desc: 'المتعة، الطاقة الإيجابية، والمرح وتجديد النشاط.',
      percent: '65%'
    }
  };

  // Interactive feedback for wheel segments
  const activeSectorDisplay = document.getElementById('active-sector-info');
  const sectorTitle = document.getElementById('sector-title');
  const sectorDesc = document.getElementById('sector-desc');
  const sectorPercent = document.getElementById('sector-percent');
  const sectorItems = document.querySelectorAll('.wheel-sector-btn');

  sectorItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sector;
      const data = wheelSectors[key];
      if (data && activeSectorDisplay) {
        sectorTitle.textContent = data.title;
        sectorTitle.style.color = data.color;
        sectorDesc.textContent = data.desc;
        sectorPercent.textContent = data.percent;
        sectorPercent.style.backgroundColor = data.color;
        
        sectorItems.forEach(b => b.classList.remove('ring-4', 'ring-offset-2'));
        btn.classList.add('ring-4', 'ring-offset-2');
      }
    });
  });

  // 2. Interactive Quick Challenge (اختبار القدرات)
  const options = document.querySelectorAll('.challenge-option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => {
        o.classList.remove('border-brand-primary', 'bg-blue-50/50', 'text-brand-primary');
        o.classList.add('border-gray-200', 'bg-white');
        const check = o.querySelector('.option-check');
        if (check) check.classList.add('hidden');
      });
      opt.classList.remove('border-gray-200', 'bg-white');
      opt.classList.add('border-brand-primary', 'bg-blue-50/50', 'text-brand-primary');
      const activeCheck = opt.querySelector('.option-check');
      if (activeCheck) activeCheck.classList.remove('hidden');
    });
  });

  // 3. Testimonial carousel simple controls
  const partnersScroll = document.getElementById('partners-track');
  if (partnersScroll) {
    let scrollAmount = 0;
    setInterval(() => {
      if (partnersScroll.scrollLeft >= partnersScroll.scrollWidth - partnersScroll.clientWidth) {
        partnersScroll.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        partnersScroll.scrollBy({ left: 150, behavior: 'smooth' });
      }
    }, 3000);
  }

  console.log('دار الرؤى للتدريب - تم تحميل واجهة الموقع بنجاح');
});
