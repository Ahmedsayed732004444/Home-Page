export function initNavigation() {
  function run() {
      // Mobile Drawer Controller
      const drawerBtn = document.getElementById('mobile-menu-btn');
      const drawerCloseBtn = document.getElementById('mobile-drawer-close');
      const drawer = document.getElementById('mobile-drawer');
      const backdrop = document.getElementById('mobile-drawer-backdrop');

      const openDrawer = () => {
        if (!drawer || !backdrop) return;
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
        backdrop.classList.add('opacity-100', 'pointer-events-auto');
        drawer.classList.remove('translate-x-full');
        drawer.classList.add('translate-x-0');
        document.body.classList.add('overflow-hidden');
        drawerBtn?.setAttribute('aria-expanded', 'true');
      };

      const closeDrawer = () => {
        if (!drawer || !backdrop) return;
        backdrop.classList.remove('opacity-100', 'pointer-events-auto');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
        drawer.classList.remove('translate-x-0');
        drawer.classList.add('translate-x-full');
        document.body.classList.remove('overflow-hidden');
        drawerBtn?.setAttribute('aria-expanded', 'false');
      };

      if (drawerBtn) drawerBtn.addEventListener('click', openDrawer);
      if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
      if (backdrop) backdrop.addEventListener('click', closeDrawer);

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
      });

      // Dynamic Active Tab Switcher (matches user reference design)
      const desktopItems = document.querySelectorAll('#main-nav .nav-item');
      const mobileItems = document.querySelectorAll('#mobile-drawer .mobile-nav-item');
      let isClickScrolling = false;
      let clickTimeout = null;

      function setActiveNav(targetNav) {
        desktopItems.forEach(item => {
          const nav = item.getAttribute('data-nav');
          const indicator = item.querySelector('.nav-indicator');
          if (nav === targetNav) {
            item.classList.remove('text-[#1D1D1D]', 'font-medium');
            item.classList.add('text-[#204A7A]', 'font-bold');
            if (!indicator) {
              const ind = document.createElement('span');
              ind.className = 'nav-indicator absolute bottom-[-4px] left-0 right-0 h-[2.5px] bg-[#204A7A] rounded-full';
              item.appendChild(ind);
            }
          } else {
            item.classList.remove('text-[#204A7A]', 'font-bold');
            item.classList.add('text-[#1D1D1D]', 'font-medium');
            if (indicator) {
              indicator.remove();
            }
          }
        });

        mobileItems.forEach(item => {
          const nav = item.getAttribute('data-nav');
          if (nav === targetNav) {
            item.classList.remove('text-white/85', 'font-normal');
            item.classList.add('text-white', 'font-bold');
          } else {
            item.classList.remove('font-bold');
            item.classList.add('text-white/85', 'font-normal');
          }
        });
      }

      const allNavLinks = [...desktopItems, ...mobileItems];
      allNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const targetNav = link.getAttribute('data-nav');
          if (!targetNav) return;

          setActiveNav(targetNav);
          closeDrawer();

          const targetEl = document.getElementById(targetNav);
          if (targetEl) {
            e.preventDefault();
            isClickScrolling = true;
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => {
              isClickScrolling = false;
            }, 800);

            const headerOffset = 90;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      });

      // ScrollSpy: auto-highlight section as user scrolls
      const sectionIds = ['home', 'courses', 'certifications', 'assessments', 'about', 'contact'];
      const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

      window.addEventListener('scroll', () => {
        if (isClickScrolling) return;
        const scrollY = window.pageYOffset;
        const offset = 120;

        for (let i = sections.length - 1; i >= 0; i--) {
          const sec = sections[i];
          const top = sec.offsetTop - offset;
          const height = sec.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveNav(sec.id);
            break;
          }
        }
      }, { passive: true });
      }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}