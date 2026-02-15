function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let pConfig = {
        enabled: true,
        type: 'default',
        color: 'rgba(255, 255, 255, 0.15)',
        speed: 0.5,
        density: 12000
    };

    if (typeof CONFIG !== 'undefined' && CONFIG.ANIMATION && CONFIG.ANIMATION.PARTICLES) {
        const c = CONFIG.ANIMATION.PARTICLES;
        pConfig.enabled = c.ENABLED !== undefined ? c.ENABLED : pConfig.enabled;
        pConfig.type = c.TYPE || 'default';
        pConfig.color = c.COLOR || pConfig.color;
        pConfig.speed = c.SPEED || pConfig.speed;
        pConfig.density = c.DENSITY || pConfig.density;
        pConfig.dates = c.DATES || {
            HALLOWEEN: { start: '10-25', end: '10-31' },
            FIREWORKS: { start: '12-31', end: '01-01' },
            EASTER:    { start: '03-25', end: '04-15' },
            WINTER:    { start: '12-01', end: '02-28' },
            SPRING:    { start: '03-01', end: '05-31' },
            SUMMER:    { start: '06-01', end: '08-31' },
            AUTUMN:    { start: '09-01', end: '11-30' }
        };
    }

    if (pConfig.type === 'auto') {
        const date = new Date();
        const currentVal = (date.getMonth() + 1) * 100 + date.getDate();

        const checkDate = (range) => {
            if (!range) return false;
            const [sM, sD] = range.start.split('-').map(Number);
            const [eM, eD] = range.end.split('-').map(Number);
            const start = sM * 100 + sD;
            const end = eM * 100 + eD;

            if (start <= end) return currentVal >= start && currentVal <= end;
            else return currentVal >= start || currentVal <= end;
        };

        if (checkDate(pConfig.dates.HALLOWEEN)) pConfig.type = 'halloween';
        else if (checkDate(pConfig.dates.FIREWORKS)) pConfig.type = 'fireworks';
        else if (checkDate(pConfig.dates.EASTER)) pConfig.type = 'easter';
        else if (checkDate(pConfig.dates.WINTER)) pConfig.type = 'winter';
        else if (checkDate(pConfig.dates.SPRING)) pConfig.type = 'spring';
        else if (checkDate(pConfig.dates.SUMMER)) pConfig.type = 'summer';
        else if (checkDate(pConfig.dates.AUTUMN)) pConfig.type = 'autumn';
        else pConfig.type = 'winter';
    }

    if (!pConfig.enabled) return;

    let particlesArray = [];
    const autumnColors = ['#d35400', '#e67e22', '#f39c12', '#c0392b', '#8e44ad', '#27ae60', '#795548', '#d84315'];
    const springColors = ['#ffc3a0', '#ffafbd', '#ff9a9e', '#fecfef', '#a18cd1', '#fad0c4'];
    const summerColors = ['#fceabb', '#f8b500', '#fceabb', '#f79d00', '#e1eec3', '#f05053'];
    const fireworksColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#ff9900'];
    const easterColors = ['#FFB7B2', '#B5EAD7', '#E2F0CB', '#FFDAC1', '#E0BBE4', '#957DAD'];

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : -10;
            
            if (pConfig.type === 'winter') {
                this.size = Math.random() * 5 + 2;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * pConfig.speed + 1;
                
                if (Array.isArray(pConfig.color)) {
                    this.color = pConfig.color[Math.floor(Math.random() * pConfig.color.length)];
                } else if (pConfig.color !== 'auto') {
                    this.color = pConfig.color;
                } else {
                    this.color = 'rgba(255, 255, 255, ' + (Math.random() * 0.5 + 0.3) + ')';
                }

                this.angle = Math.random() * 360;
                this.spin = Math.random() * 1 - 0.5;
            } else if (pConfig.type === 'autumn') {
                this.size = Math.random() * 8 + 5;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * pConfig.speed + 1;
                
                let colors = autumnColors;
                if (Array.isArray(pConfig.color)) colors = pConfig.color;
                
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.angle = Math.random() * 360;
                this.spin = Math.random() * 3 - 1.5;
                this.leafType = Math.random() > 0.5 ? 'maple' : 'oak';
            } else if (pConfig.type === 'halloween') {
                const hTypes = ['bat', 'ghost', 'pumpkin', 'spider'];
                this.halloweenType = hTypes[Math.floor(Math.random() * hTypes.length)];
                
                this.size = Math.random() * 10 + 6;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * pConfig.speed + 1;

                if (this.halloweenType === 'bat') {
                    this.color = '#2c3e50';
                    this.speedX *= 1.5;
                } else if (this.halloweenType === 'ghost') {
                    this.color = 'rgba(255, 255, 255, 0.8)';
                } else if (this.halloweenType === 'spider') {
                    this.color = '#000000';
                } else {
                    this.color = '#d35400';
                }
                
                if (Array.isArray(pConfig.color)) {
                     this.color = pConfig.color[Math.floor(Math.random() * pConfig.color.length)];
                }

                this.angle = Math.random() * 360;
                this.spin = Math.random() * 2 - 1;
            } else if (pConfig.type === 'easter') {
                this.easterType = Math.random() > 0.3 ? 'egg' : 'bunny';
                this.size = Math.random() * 6 + 4;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * pConfig.speed + 1;
                this.color = easterColors[Math.floor(Math.random() * easterColors.length)];
                
                if (this.easterType === 'bunny') {
                    this.color = '#ffffff';
                    this.speedX = Math.random() * 2 - 1;
                }
                
                if (Array.isArray(pConfig.color)) {
                     this.color = pConfig.color[Math.floor(Math.random() * pConfig.color.length)];
                }

                this.angle = Math.random() * 360;
                this.spin = Math.random() * 2 - 1;
            } else if (pConfig.type === 'spring') {
                this.size = Math.random() * 4 + 2;
                this.speedX = Math.random() * 1.5 - 0.75;
                this.speedY = Math.random() * pConfig.speed + 0.5;
                this.color = springColors[Math.floor(Math.random() * springColors.length)];
                this.angle = Math.random() * 360;
                this.spin = Math.random() * 2 - 1;
            } else if (pConfig.type === 'summer') {
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = (Math.random() * pConfig.speed * 0.5 + 0.2) * -1;
                this.color = summerColors[Math.floor(Math.random() * summerColors.length)];
                if (initial) this.y = Math.random() * canvas.height;
                else this.y = canvas.height + 10;
            } else if (pConfig.type === 'fireworks') {
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * pConfig.speed * 2 + 1;
                this.color = fireworksColors[Math.floor(Math.random() * fireworksColors.length)];
                this.x = Math.random() * canvas.width;
                this.y = initial ? Math.random() * canvas.height : -10;
            } else {
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() * pConfig.speed - (pConfig.speed / 2));
                this.speedY = (Math.random() * pConfig.speed - (pConfig.speed / 2));
                if (Array.isArray(pConfig.color)) {
                    this.color = pConfig.color[Math.floor(Math.random() * pConfig.color.length)];
                } else {
                    this.color = pConfig.color;
                }
                if (!initial) this.y = Math.random() * canvas.height;
            }
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (pConfig.type === 'autumn' || pConfig.type === 'spring' || pConfig.type === 'winter' || pConfig.type === 'halloween' || pConfig.type === 'easter') {
                this.angle += this.spin;
            }

            if (pConfig.type === 'winter' || pConfig.type === 'autumn' || pConfig.type === 'spring' || pConfig.type === 'halloween' || pConfig.type === 'fireworks' || pConfig.type === 'easter') {
                if (this.y > canvas.height) this.reset();
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
            } else if (pConfig.type === 'summer') {
                if (this.y < -10) this.reset();
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
            } else {
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            
            if (pConfig.type === 'autumn') {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);
                
                ctx.beginPath();
                if (this.leafType === 'maple') {
                    ctx.moveTo(0, -this.size);
                    ctx.lineTo(this.size * 0.4, -this.size * 0.4);
                    ctx.lineTo(this.size, -this.size * 0.2);
                    ctx.lineTo(this.size * 0.4, 0.2 * this.size);
                    ctx.lineTo(this.size * 0.6, this.size);
                    ctx.lineTo(0, this.size * 0.5);
                    ctx.lineTo(-this.size * 0.6, this.size);
                    ctx.lineTo(-this.size * 0.4, 0.2 * this.size);
                    ctx.lineTo(-this.size, -this.size * 0.2);
                    ctx.lineTo(-this.size * 0.4, -this.size * 0.4);
                } else {
                    ctx.moveTo(0, -this.size);
                    ctx.bezierCurveTo(this.size, -this.size/2, this.size/2, this.size, 0, this.size);
                    ctx.bezierCurveTo(-this.size/2, this.size, -this.size, -this.size/2, 0, -this.size);
                }
                ctx.fill();
                
                ctx.strokeStyle = "rgba(0,0,0,0.15)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, -this.size * 0.6);
                ctx.lineTo(0, this.size * 0.6);
                ctx.stroke();

                ctx.restore();
            } else if (pConfig.type === 'halloween') {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);
                
                if (this.halloweenType === 'spider') {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size/2.5, 0, Math.PI*2);
                    ctx.fill();
                    
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    for(let i=0; i<4; i++) {
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(-this.size, -this.size/2 + (i*this.size/2), -this.size*1.2, (i-1.5)*this.size);
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(this.size, -this.size/2 + (i*this.size/2), this.size*1.2, (i-1.5)*this.size);
                    }
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    if (this.halloweenType === 'bat') {
                        ctx.fillStyle = this.color;
                        ctx.moveTo(0, 0);
                        ctx.bezierCurveTo(this.size, -this.size/2, this.size, this.size/2, 0, this.size/4);
                        ctx.bezierCurveTo(-this.size, this.size/2, -this.size, -this.size/2, 0, 0);
                        ctx.fill();
                    } else if (this.halloweenType === 'ghost') {
                        ctx.fillStyle = this.color;
                        ctx.arc(0, -this.size/4, this.size/2, Math.PI, 0);
                        ctx.lineTo(this.size/2, this.size/2);
                        ctx.lineTo(0, this.size/3);
                        ctx.lineTo(-this.size/2, this.size/2);
                        ctx.fill();
                        
                        ctx.fillStyle = "rgba(0,0,0,0.7)";
                        ctx.beginPath();
                        ctx.arc(-this.size/5, -this.size/4, this.size/10, 0, Math.PI*2);
                        ctx.arc(this.size/5, -this.size/4, this.size/10, 0, Math.PI*2);
                        ctx.ellipse(0, 0, this.size/8, this.size/6, 0, 0, Math.PI*2);
                        ctx.fill();
                    } else {
                        ctx.fillStyle = this.color;
                        ctx.ellipse(0, 0, this.size/1.2, this.size/1.5, 0, 0, Math.PI * 2);
                        ctx.fill();
                        
                        ctx.fillStyle = "#ffeb3b";
                        ctx.beginPath();
                        ctx.moveTo(-this.size/2, -this.size/4);
                        ctx.lineTo(-this.size/4, -this.size/1.5);
                        ctx.lineTo(0, -this.size/4);
                        ctx.moveTo(this.size/2, -this.size/4);
                        ctx.lineTo(this.size/4, -this.size/1.5);
                        ctx.lineTo(0, -this.size/4);
                        ctx.moveTo(-this.size/2, this.size/4);
                        ctx.quadraticCurveTo(0, this.size/1.2, this.size/2, this.size/4);
                        ctx.lineTo(0, this.size/2);
                        ctx.fill();
                    }
                }

                ctx.restore();
            } else if (pConfig.type === 'easter') {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);
                
                if (this.easterType === 'bunny') {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size/1.5, 0, Math.PI*2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(-this.size/2.5, -this.size/1.2, this.size/4, this.size/1.5, -0.2, 0, Math.PI*2);
                    ctx.ellipse(this.size/2.5, -this.size/1.2, this.size/4, this.size/1.5, 0.2, 0, Math.PI*2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, this.size/1.4, this.size, 0, 0, Math.PI*2);
                    ctx.fill();
                }
                ctx.restore();
            } else if (pConfig.type === 'spring') {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);
                ctx.beginPath();
                ctx.moveTo(0, this.size);
                ctx.bezierCurveTo(this.size / 2, this.size / 2, this.size, -this.size / 2, 0, -this.size);
                ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size / 2, this.size / 2, 0, this.size);
                ctx.fill();
                ctx.restore();
            } else if (pConfig.type === 'summer' || pConfig.type === 'fireworks') {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (pConfig.type === 'winter') {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);
                
                if (this.size < 3.5) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size / 1.5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 1.2;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        ctx.moveTo(0, 0);
                        ctx.lineTo(0, this.size);
                        ctx.moveTo(0, this.size * 0.5);
                        ctx.lineTo(this.size * 0.3, this.size * 0.7);
                        ctx.moveTo(0, this.size * 0.5);
                        ctx.lineTo(-this.size * 0.3, this.size * 0.7);
                        ctx.rotate(Math.PI / 3);
                    }
                    ctx.stroke();
                }
                ctx.restore();
            } else {
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }

    const numberOfParticles = Math.floor((canvas.height * canvas.width) / pConfig.density);
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    return pConfig.type;
}