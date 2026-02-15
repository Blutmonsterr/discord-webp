window.initPartners = function(t) {
    if (typeof CONFIG === 'undefined' || !CONFIG.PARTNERS || !CONFIG.PARTNERS.ENABLED || !CONFIG.PARTNERS.LIST || CONFIG.PARTNERS.LIST.length === 0) {
        return;
    }

    const partnerList = CONFIG.PARTNERS.LIST;

    if (partnerList.length > 0) {
        const partnerContainer = document.getElementById('partners-container');
        const partnerCard = document.getElementById('partners-card');
        const toggleBtn = document.getElementById('toggle-partners-btn');
        const toggleLabel = document.getElementById('label-partners-toggle');
        
        if (partnerContainer) {
            if (toggleBtn && partnerCard) {
                toggleBtn.style.display = 'inline-flex';
                toggleLabel.textContent = t.showPartners || "Partner anzeigen";
                
                toggleBtn.addEventListener('click', () => {
                    toggleBtn.style.animation = 'none';
                    const isHidden = partnerCard.style.display === 'none' || partnerCard.style.display === '';
                    
                    if (isHidden) {
                        partnerCard.style.display = 'flex';
                        toggleLabel.textContent = t.hidePartners || "Partner verbergen";
                        setTimeout(() => partnerCard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                    } else {
                        partnerCard.style.display = 'none';
                        toggleLabel.textContent = t.showPartners || "Partner anzeigen";
                    }
                });
            } else if (partnerCard) {
                partnerCard.style.display = 'flex';
            }

            const style = document.createElement('style');
            style.textContent = `
                .partners-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    width: 100%;
                    z-index: 10;
                }
                .partners-title {
                    color: rgba(255, 255, 255, 0.9);
                    text-align: center;
                    margin-top: 0;
                    margin-bottom: 5px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    width: 100%;
                    z-index: 10;
                }
                .partner-card {
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    padding: 10px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    color: white;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    min-height: 54px; /* Verhindert Springen beim Laden */
                }
                .partner-card:hover {
                    transform: translateY(-3px);
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.3);
                }
                .partner-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    margin-right: 10px;
                    object-fit: cover;
                }
                .partner-name {
                    font-size: 0.9rem;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .partners-card {
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                    /* Sanfte Slide-Up Animation */
                    animation: slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 480px) {
                    .partners-grid { grid-template-columns: 1fr; }
                }
                @media (min-width: 481px) and (max-width: 768px) {
                    .partners-grid { grid-template-columns: repeat(2, 1fr); }
                }
                
                .toggle-partners-button {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    margin-top: 20px;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    font-family: inherit;
                    font-weight: 600;
                    animation: pulseGlow 3s infinite;
                }
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); transform: scale(1); }
                    50% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); transform: scale(1.02); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); transform: scale(1); }
                }
                .toggle-partners-button:hover {
                    background: rgba(255, 255, 255, 0.25);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
            `;
            document.head.appendChild(style);

            const title = document.createElement('div');
            title.className = 'partners-title';
            title.textContent = t.partners || 'Partner';
            partnerContainer.parentNode.insertBefore(title, partnerContainer);

            partnerList.slice(0, 12).forEach(partner => {
                const link = document.createElement('a');
                link.className = 'partner-card';
                link.target = '_blank';
                
                if (partner.id) {
                    link.href = '#';
                    link.innerHTML = `
                        <div class="partner-icon" style="background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;"><i class="fas fa-spinner fa-spin"></i></div>
                        <span class="partner-name">Lade...</span>
                    `;
                    partnerContainer.appendChild(link);

                    fetch(`https://discord.com/api/guilds/${partner.id}/widget.json`)
                        .then(res => {
                            if (!res.ok) throw new Error('Widget disabled');
                            return res.json();
                        })
                        .then(data => {
                            link.href = data.instant_invite || '#';
                            const iconUrl = (data.id && data.icon) 
                                ? `https://cdn.discordapp.com/icons/${data.id}/${data.icon}.png` 
                                : 'https://cdn.discordapp.com/embed/avatars/0.png';
                            
                            link.innerHTML = `
                                <img src="${iconUrl}" alt="${data.name}" class="partner-icon">
                                <span class="partner-name">${data.name}</span>
                            `;
                        })
                        .catch(() => {
                            link.innerHTML = `
                                <div class="partner-icon" style="background: rgba(255,50,50,0.2); display: flex; align-items: center; justify-content: center;"><i class="fas fa-exclamation"></i></div>
                                <span class="partner-name">Fehler</span>
                            `;
                            link.style.opacity = '0.5';
                            link.style.pointerEvents = 'none';
                        });

                } 
                else if (partner.name && partner.url) {
                    link.href = partner.url;
                    let iconHtml = partner.icon 
                        ? `<img src="${partner.icon}" alt="${partner.name}" class="partner-icon">`
                        : `<div class="partner-icon" style="background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;"><i class="fas fa-server"></i></div>`;

                    link.innerHTML = `${iconHtml}<span class="partner-name">${partner.name}</span>`;
                    partnerContainer.appendChild(link);
                }
            });
        }
    }
};