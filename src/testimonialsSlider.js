export function initTestimonialsSlider() {
  function run() {
          const slider = document.getElementById('testimonials-slider');
          if (!slider) return;

          const cards = Array.from(slider.querySelectorAll('.testimonial-card'));
          const dotsContainer = document.getElementById('testi-dots');
          const btnNext = document.getElementById('testi-next');
          const btnPrev = document.getElementById('testi-prev');

          if (cards.length === 0) return;

          let activeIndex = 0;
          let isDragging = false;
          let startX, scrollLeft;
          let isTouching = false;

          function renderDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            // For desktop we force 4 dots as requested by the Figma mockup
            const count = window.innerWidth < 1024 ? cards.length : 4;
            
            for (let i = 0; i < count; i++) {
              const dot = document.createElement('span');
              dot.className = i === 0 
                ? 'w-7 h-2 rounded-full bg-brand-primary transition-all duration-300 block cursor-pointer' 
                : 'w-2 h-2 rounded-full bg-[#DCE4EE] hover:bg-gray-300 transition-all duration-300 block cursor-pointer';
              
              dot.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                  scrollToCard(i);
                } else {
                  scrollToPage(i);
                }
              });
              dotsContainer.appendChild(dot);
            }
          }

          function updateActiveState(index) {
            if (!dotsContainer) return;
            const isMobile = window.innerWidth < 1024;
            const dots = Array.from(dotsContainer.children);
            
            // On desktop, index 0,1,2 = page 0 (dot 0). 3,4,5 = page 1 (dot 1). etc.
            let targetPage = isMobile ? index : Math.floor(index / 3);
            if (!isMobile && targetPage > 3) targetPage = 3; // Clamp to 4 dots max

            dots.forEach((dot, i) => {
              dot.className = i === targetPage
                ? 'w-7 h-2 rounded-full bg-brand-primary transition-all duration-300 block cursor-pointer'
                : 'w-2 h-2 rounded-full bg-[#DCE4EE] hover:bg-gray-300 transition-all duration-300 block cursor-pointer';
            });

            // STRICT Figma Button States
            // In RTL:
            // Prev is Visual Left (<). Disabled at start (targetPage == 0).
            // Next is Visual Right (>). Disabled at end (targetPage >= 3).
            if (btnPrev && btnNext) {
                const activeClass = 'hidden md:flex w-[50px] h-[50px] rounded-full border-[1.5px] border-[#204A7A] text-[#204A7A] items-center justify-center hover:bg-[#204A7A] hover:text-white transition-all duration-200 bg-white cursor-pointer shrink-0 z-10';
                const disabledClass = 'hidden md:flex w-[50px] h-[50px] rounded-full border-[1.5px] border-[#DEDEDE] text-[#DEDEDE] items-center justify-center transition-all duration-200 bg-white cursor-default shrink-0 z-10';
                
                // On mobile we might hide these entirely, but if shown:
                if (isMobile) {
                    btnPrev.className = (index <= 0) ? disabledClass : activeClass;
                    btnNext.className = (index >= cards.length - 1) ? disabledClass : activeClass;
                } else {
                    btnPrev.className = (targetPage <= 0) ? disabledClass : activeClass;
                    btnNext.className = (targetPage >= 3) ? disabledClass : activeClass;
                }
            }
          }

          function adjustSliderPadding() {
            if (window.innerWidth < 1024) {
              const cardWidth = cards[0].offsetWidth;
              const pad = Math.max(0, (slider.offsetWidth - cardWidth) / 2);
              slider.style.paddingLeft = `${pad}px`;
              slider.style.paddingRight = `${pad}px`;
            } else {
              slider.style.paddingLeft = '';
              slider.style.paddingRight = '';
            }
          }

          function scrollToCard(index, smooth = true) {
            if (index < 0) index = 0;
            if (index >= cards.length) index = cards.length - 1;
            
            activeIndex = index;
            const targetCard = cards[index];
            if (targetCard) {
              targetCard.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'nearest', inline: 'center' });
              updateActiveState(index);
              updateCardTransforms();
            }
          }

          function scrollToPage(pageIndex) {
            // No Infinite loop! Clamp the pageIndex
            const maxPage = 3; // 4 dots total
            
            if (pageIndex < 0) pageIndex = 0;
            if (pageIndex > maxPage) pageIndex = maxPage;

            // Target card index
            let targetIndex = pageIndex * 3;
            if (targetIndex >= cards.length) targetIndex = cards.length - 1;
            
            if(cards[targetIndex]) {
                cards[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: window.innerWidth < 1024 ? 'center' : 'start' });
            }
            activeIndex = targetIndex;
            updateActiveState(targetIndex);
          }

          function updateCardTransforms() {
            const sliderRect = slider.getBoundingClientRect();
            const sliderCenter = sliderRect.left + sliderRect.width / 2;
            let closestIdx = 0;
            let minDist = Infinity;

            const maxDist = sliderRect.width * 0.65;
            
            cards.forEach((card, i) => {
              const cardRect = card.getBoundingClientRect();
              const cardCenter = cardRect.left + cardRect.width / 2;
              const dist = Math.abs(sliderCenter - cardCenter);
              if (dist < minDist) {
                minDist = dist;
                closestIdx = i;
              }
            });

            if (window.innerWidth >= 1024) {
              cards.forEach(card => {
                card.style.transform = '';
                card.style.opacity = '';
                card.style.zIndex = '';
                card.classList.remove('shadow-[0_8px_30px_rgba(0,0,0,0.06)]');
              });
              activeIndex = closestIdx;
              updateActiveState(closestIdx);
              return;
            }

            cards.forEach((card, i) => {
              const cardRect = card.getBoundingClientRect();
              const cardCenter = cardRect.left + cardRect.width / 2;
              const dist = Math.abs(sliderCenter - cardCenter);
              const progress = Math.min(dist / maxDist, 1);
              const eased = Math.sin((progress * Math.PI) / 2);

              const scale = 1 - eased * 0.12;
              const opacity = 1 - eased * 0.55;

              card.style.transform = `scale(${scale})`;
              card.style.opacity = opacity;
              card.style.transformOrigin = 'center center';
              card.style.transition = (isTouching || isDragging)
                ? 'none'
                : 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1)';

              if (dist < cardRect.width / 2) {
                card.style.zIndex = '10';
                card.classList.add('shadow-[0_8px_30px_rgba(0,0,0,0.06)]');
              } else {
                card.style.zIndex = '1';
                card.classList.remove('shadow-[0_8px_30px_rgba(0,0,0,0.06)]');
              }
            });

            activeIndex = closestIdx;
            updateActiveState(closestIdx);
          }

          let ticking = false;
          slider.addEventListener('scroll', () => {
            if (!ticking) {
              window.requestAnimationFrame(() => {
                updateCardTransforms();
                ticking = false;
              });
              ticking = true;
            }
          }, { passive: true });

          slider.addEventListener('touchstart', () => {
            isTouching = true;
          }, { passive: true });

          slider.addEventListener('touchend', () => {
            isTouching = false;
            setTimeout(updateCardTransforms, 120);
          }, { passive: true });

          slider.addEventListener('mousedown', (e) => {
            if (window.innerWidth >= 1024) return;
            isDragging = true;
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            slider.classList.remove('scroll-smooth', 'snap-x');
          });

          window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            slider.classList.add('scroll-smooth', 'snap-x');
            scrollToCard(activeIndex);
          });

          slider.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.2;
            slider.scrollLeft = scrollLeft - walk;
          });

          cards.forEach((card, i) => {
            card.addEventListener('click', () => {
              if (window.innerWidth < 1024 && i !== activeIndex) {
                scrollToCard(i);
              }
            });
          });

          if (btnNext) {
            btnNext.addEventListener('click', () => {
              if (window.innerWidth < 1024) {
                let target = activeIndex + 1;
                if (target >= cards.length) return; // Stop at end
                scrollToCard(target);
              } else {
                const curPage = Math.floor(activeIndex / 3);
                scrollToPage(curPage + 1);
              }
            });
          }

          if (btnPrev) {
            btnPrev.addEventListener('click', () => {
              if (window.innerWidth < 1024) {
                let target = activeIndex - 1;
                if (target < 0) return; // Stop at start
                scrollToCard(target);
              } else {
                const curPage = Math.floor(activeIndex / 3);
                scrollToPage(curPage - 1);
              }
            });
          }

          const init = () => {
            adjustSliderPadding();
            renderDots();
            updateCardTransforms();
          };

          init();
          window.addEventListener('resize', init);
          if (window.innerWidth < 1024) {
            scrollToCard(1, false);
            setTimeout(() => scrollToCard(1, false), 80);
          }
          }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}