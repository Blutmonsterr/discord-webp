document.addEventListener("DOMContentLoaded", function() {
    const configLang = (typeof CONFIG !== 'undefined' && CONFIG.LANGUAGE) ? CONFIG.LANGUAGE : 'de';
    
    const translations = window.TRANSLATIONS || {};
    const t = translations[configLang] || translations['de'] || {};

    const serverId = typeof CONFIG !== 'undefined' ? CONFIG.SERVER_ID : 'DEINE_SERVER_ID_HIER';

    const apiUrl = `https://discord.com/api/guilds/${serverId}/widget.json`;

    const guildNameElement = document.getElementById('guild-name');
    const onlineCountElement = document.getElementById('online-count');
    const memberCountElement = document.getElementById('member-count');
    const guildIconElement = document.getElementById('guild-icon');
    const joinBtnElement = document.getElementById('join-btn');
    const copyBtnElement = document.getElementById('copy-btn');
    const membersListElement = document.getElementById('members-list');    
    const spinnerWrapper = document.getElementById('spinner-wrapper');
    const mainCard = document.querySelector('.card');
    const inviteLabelElement = document.querySelector('.invite-label');
    const socialContainer = document.getElementById('social-media-container');
    const toastElement = document.getElementById('toast');
    const labelOnline = document.getElementById('label-online');
    const labelMembers = document.getElementById('label-members');

    if (inviteLabelElement) inviteLabelElement.textContent = t.inviteLabel;
    if (guildNameElement) guildNameElement.textContent = t.loading;
    if (labelOnline) labelOnline.textContent = t.online;
    if (labelMembers) labelMembers.textContent = t.members;
    if (joinBtnElement) joinBtnElement.innerHTML = `<i class="fab fa-discord"></i> ${t.join}`;
    if (copyBtnElement) copyBtnElement.innerHTML = `<i class="fas fa-copy"></i> ${t.copy}`;
    if (toastElement) toastElement.textContent = t.toast;

    if (!serverId || serverId === 'DEINE_SERVER_ID_HIER') {
        if (spinnerWrapper) spinnerWrapper.style.display = 'none';
        if (mainCard) mainCard.style.display = 'flex';
        
        guildNameElement.textContent = t.setupRequired;
        if (inviteLabelElement) inviteLabelElement.textContent = t.setupMessage;
        joinBtnElement.style.display = 'none';
        if (copyBtnElement) copyBtnElement.style.display = 'none';
        
        return;
    }

    if (typeof CONFIG !== 'undefined') {
        if (CONFIG.INVITE_HEADER && inviteLabelElement) {
            inviteLabelElement.textContent = CONFIG.INVITE_HEADER;
        }
        
        if (CONFIG.SERVER_ICON) {
            if (guildIconElement) guildIconElement.src = CONFIG.SERVER_ICON;
            const faviconElement = document.getElementById('favicon');
            if (faviconElement) faviconElement.href = CONFIG.SERVER_ICON;
        }

        if (CONFIG.BACKGROUND_IMAGE) {
            const bgElement = document.querySelector('.background');
            if (bgElement) bgElement.style.backgroundImage = `url('${CONFIG.BACKGROUND_IMAGE}')`;
        }

        if (CONFIG.SOCIAL_LINKS && socialContainer) {
            socialContainer.innerHTML = '';
            CONFIG.SOCIAL_LINKS.forEach(link => {
                if (link.url && link.url !== '#') {
                    const a = document.createElement('a');
                    a.href = link.url;
                    a.target = '_blank';
                    a.className = 'social-icon';
                    if (link.name) {
                        a.title = link.name;
                    }
                    a.innerHTML = `<i class="${link.icon}"></i>`;
                    socialContainer.appendChild(a);
                }
            });
        }

        if (CONFIG.ANIMATION && CONFIG.ANIMATION.BACKGROUND_BREATHE === false) {
            const bgElement = document.querySelector('.background');
            if (bgElement) bgElement.style.animation = 'none';
        }
    }

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok. Ist das Widget für deinen Server aktiviert?');
            }
            return response.json();
        })
        .then(data => {
            if (guildNameElement) guildNameElement.textContent = data.name;
            
            if (t.title) document.title = t.title.replace('{name}', data.name);

            if (t.metaDesc) {
                const descriptionText = t.metaDesc.replace('{name}', data.name).replace('{count}', data.presence_count);
                document.getElementById('meta-description').setAttribute('content', descriptionText);
                document.getElementById('og-description').setAttribute('content', descriptionText);
            }
            if (t.ogTitle) document.getElementById('og-title').setAttribute('content', t.ogTitle.replace('{name}', data.name));
            if (guildIconElement) guildIconElement.alt = `Server Icon für ${data.name}`;

            
            if (onlineCountElement) onlineCountElement.textContent = data.presence_count;
            
            if (memberCountElement && memberCountElement.parentNode) {
                 memberCountElement.parentNode.style.display = 'none'; 
            }

            if (data.members && membersListElement) {
                membersListElement.innerHTML = '';
                const maxMembers = (typeof CONFIG !== 'undefined' && CONFIG.MAX_MEMBERS) ? CONFIG.MAX_MEMBERS : 5;
                data.members.slice(0, maxMembers).forEach(member => {
                    const avatar = document.createElement('img');
                    avatar.src = member.avatar_url;
                    avatar.alt = member.username;
                    avatar.title = member.username;
                    avatar.className = 'member-avatar';
                    membersListElement.appendChild(avatar);
                });
            }

            if (data.instant_invite) {
                joinBtnElement.href = data.instant_invite;
                if (copyBtnElement) copyBtnElement.style.display = 'flex';
            } else {
                joinBtnElement.textContent = t.noInvite;
                joinBtnElement.style.backgroundColor = "#747f8d";
                joinBtnElement.style.cursor = "not-allowed";
                if (copyBtnElement) copyBtnElement.style.display = 'none';
            }

            if (data.id && data.icon) {
                const iconUrl = `https://cdn.discordapp.com/icons/${data.id}/${data.icon}.png`;
                if (guildIconElement && (typeof CONFIG === 'undefined' || !CONFIG.SERVER_ICON)) guildIconElement.src = iconUrl;
                
                const bgElement = document.querySelector('.background');
                if (bgElement && (typeof CONFIG === 'undefined' || !CONFIG.BACKGROUND_IMAGE)) {
                    bgElement.style.backgroundImage = `url('${iconUrl}')`;
                }

                const faviconElement = document.getElementById('favicon');
                if (faviconElement && (typeof CONFIG === 'undefined' || !CONFIG.SERVER_ICON)) {
                    faviconElement.href = iconUrl;
                }
            }

            if (spinnerWrapper) spinnerWrapper.style.display = 'none';
            if (mainCard) {
                mainCard.style.display = 'flex';
                if (inviteLabelElement) {
                    if (typeof CONFIG !== 'undefined' && CONFIG.ANIMATION && CONFIG.ANIMATION.TYPING_EFFECT) {
                        inviteLabelElement.classList.add('typing');
                        if (typeof typeWriter === 'function') {
                            typeWriter(inviteLabelElement, inviteLabelElement.textContent);
                        }
                    }
                }
            }
        })
        .catch(error => {
            guildNameElement.textContent = t.serverNotFound;
            onlineCountElement.textContent = "N/A";
            memberCountElement.textContent = "N/A";
            joinBtnElement.textContent = t.error;
            joinBtnElement.style.backgroundColor = "#aa3333";
            joinBtnElement.style.cursor = "not-allowed";

            if (spinnerWrapper) spinnerWrapper.style.display = 'none';
            if (mainCard) mainCard.style.display = 'flex';
        });

    if (copyBtnElement) {
        let isCopying = false;
        copyBtnElement.addEventListener('click', () => {
            if (isCopying) return;
            const inviteLink = joinBtnElement.href;
            if (inviteLink && inviteLink !== '#' && !inviteLink.includes('javascript')) {
                isCopying = true;
                navigator.clipboard.writeText(inviteLink).then(() => {
                    if (typeof showToast === 'function') showToast(toastElement);
                    const originalHTML = copyBtnElement.innerHTML;
                    copyBtnElement.innerHTML = `<i class="fas fa-check"></i> ${t.copied}`;
                    copyBtnElement.style.color = '#3ba55c';
                    setTimeout(() => {
                        copyBtnElement.innerHTML = originalHTML;
                        copyBtnElement.style.color = '';
                        isCopying = false;
                    }, 2000);
                }).catch(() => {
                    isCopying = false;
                });
            }
        });
    }

    const footerStyle = document.createElement('style');
    footerStyle.textContent = `
        .footer {
            position: relative;
            z-index: 20;
            margin-top: 20px;
        }
        .footer a {
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            transition: color 0.3s ease;
            cursor: pointer;
        }
        .footer a:hover {
            color: #ffffff;
        }
    `;
    document.head.appendChild(footerStyle);

    if (typeof window.initAnimations === 'function') {
        window.initAnimations(t, mainCard);
    }

    if (typeof window.initPartners === 'function') {
        window.initPartners(t);
    }
});
