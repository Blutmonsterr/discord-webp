window.initAnimations = function(t, mainCard) {
    if (typeof CONFIG === 'undefined') return;

    if (CONFIG.ANIMATION) {
        if (CONFIG.ANIMATION.PULSE_SERVER_ICON) {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes iconPulse {
                    0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255,255,255,0)); }
                    50% { transform: scale(1.05); filter: drop-shadow(0 0 8px rgba(255,255,255,0.3)); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255,255,255,0)); }
                }
                #guild-icon {
                    animation: iconPulse 3s infinite ease-in-out;
                }
            `;
            document.head.appendChild(style);
        }

        if (CONFIG.ANIMATION.PULSE_JOIN_BUTTON) {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes btnPulse {
                    0% { transform: scale(1); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
                    50% { transform: scale(1.05); box-shadow: 0 8px 25px rgba(88, 101, 242, 0.5); }
                    100% { transform: scale(1); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
                }
                #join-btn {
                    animation: btnPulse 2s infinite ease-in-out;
                }
            `;
            document.head.appendChild(style);
        }
    }

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (mainCard && !isTouchDevice && (!CONFIG.ANIMATION || CONFIG.ANIMATION.CARD_TILT)) {
        mainCard.addEventListener('mousemove', (e) => {
            const rect = mainCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            mainCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        mainCard.addEventListener('mouseleave', () => {
            mainCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    }

    if (!CONFIG.ANIMATION || (CONFIG.ANIMATION.PARTICLES && CONFIG.ANIMATION.PARTICLES.ENABLED)) {
        if (typeof initParticles === 'function') {
            const currentType = initParticles();
            
            const showTag = (!CONFIG.ANIMATION || CONFIG.ANIMATION.SHOW_SEASON_TAG !== false);

            if (currentType && currentType !== 'default' && showTag) {
                const style = document.createElement('style');
                style.textContent = `
                    .season-tag {
                        position: fixed;
                        top: 20px;
                        left: 20px;
                        padding: 8px 16px;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        -webkit-backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 20px;
                        color: #fff;
                        font-family: sans-serif;
                        font-size: 14px;
                        z-index: 9999;
                        pointer-events: none;
                        animation: tagFadeIn 0.8s ease-out forwards;
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    @keyframes tagFadeIn {
                        to { opacity: 1; transform: translateY(0); }
                    }
                `;
                document.head.appendChild(style);

                const tag = document.createElement('div');
                tag.className = 'season-tag';
                
                const seasonKey = 'season_' + currentType;
                tag.textContent = t[seasonKey] || currentType;
                document.body.appendChild(tag);
            }
        }
    }
};