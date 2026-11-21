(function(global) {
    const DEFAULT_DATES = {
        HALLOWEEN: { start: '10-25', end: '10-31' },
        FIREWORKS: { start: '12-31', end: '01-01' },
        EASTER:    { start: '03-25', end: '04-15' },
        WINTER:    { start: '11-01', end: '03-01' },
        SPRING:    { start: '03-02', end: '05-31' },
        SUMMER:    { start: '06-01', end: '08-31' },
        AUTUMN:    { start: '09-01', end: '10-24' }
    };

    // Standard meteorological seasons & fixed holidays used in 'timezone' (and 'auto') mode
    const TIMEZONE_HOLIDAYS = {
        HALLOWEEN: { start: '10-25', end: '10-31' },
        FIREWORKS: { start: '12-31', end: '01-01' }
    };

    const TIMEZONE_SEASONS = {
        WINTER: { start: '12-01', end: '02-29' },
        SPRING: { start: '03-01', end: '05-31' },
        SUMMER: { start: '06-01', end: '08-31' },
        AUTUMN: { start: '09-01', end: '11-30' }
    };

    const SOUTHERN_PREFIXES = [
        'Australia/',
        'Antarctica/',
        'Brazil/',
        'Chile/',
        'America/Argentina/'
    ];

    const SOUTHERN_ZONES = new Set([
        'NZ', 'NZ-CHAT',
        'Africa/Blantyre', 'Africa/Brazzaville', 'Africa/Bujumbura', 'Africa/Dar_es_Salaam',
        'Africa/Gaborone', 'Africa/Harare', 'Africa/Johannesburg', 'Africa/Kigali',
        'Africa/Kinshasa', 'Africa/Luanda', 'Africa/Lubumbashi', 'Africa/Lusaka',
        'Africa/Maputo', 'Africa/Maseru', 'Africa/Mbabane', 'Africa/Nairobi', 'Africa/Windhoek',
        'America/Araguaina', 'America/Asuncion', 'America/Bahia', 'America/Belem',
        'America/Buenos_Aires', 'America/Campo_Grande', 'America/Catamarca', 'America/Cordoba',
        'America/Coyhaique', 'America/Cuiaba', 'America/Eirunepe', 'America/Fortaleza',
        'America/Guayaquil', 'America/Jujuy', 'America/La_Paz', 'America/Lima',
        'America/Maceio', 'America/Manaus', 'America/Mendoza', 'America/Montevideo',
        'America/Noronha', 'America/Porto_Velho', 'America/Punta_Arenas', 'America/Recife',
        'America/Rio_Branco', 'America/Rosario', 'America/Santarem', 'America/Santiago',
        'America/Sao_Paulo',
        'Asia/Dili', 'Asia/Jakarta', 'Asia/Jayapura', 'Asia/Makassar', 'Asia/Pontianak',
        'Asia/Ujung_Pandang',
        'Atlantic/South_Georgia', 'Atlantic/St_Helena', 'Atlantic/Stanley',
        'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham',
        'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo',
        'Pacific/Fiji', 'Pacific/Funafuti', 'Pacific/Galapagos', 'Pacific/Gambier',
        'Pacific/Guadalcanal', 'Pacific/Kanton', 'Pacific/Marquesas', 'Pacific/Nauru',
        'Pacific/Niue', 'Pacific/Norfolk', 'Pacific/Noumea', 'Pacific/Pago_Pago',
        'Pacific/Pitcairn', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Samoa',
        'Pacific/Tahiti', 'Pacific/Tongatapu', 'Pacific/Wallis'
    ]);

    const SOUTHERN_SEASON_MAP = {
        winter: 'summer',
        summer: 'winter',
        spring: 'autumn',
        autumn: 'spring'
    };

    /**
     * Resolves configured timezone ('auto' -> browser IANA timezone) and validates it.
     */
    function resolveParticleTimeZone(configuredTimeZone) {
        if (configuredTimeZone && configuredTimeZone !== 'auto') {
            try {
                return new Intl.DateTimeFormat('en-US', { timeZone: configuredTimeZone }).resolvedOptions().timeZone || configuredTimeZone;
            } catch (err) {
                console.warn(`Invalid particle TIMEZONE "${configuredTimeZone}", falling back to browser timezone.`);
            }
        }
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
        } catch (err) {
            return null;
        }
    }

    /**
     * Extracts Gregorian year, month (1-12), and day (1-31) in the target timezone.
     */
    function getDateInTimeZone(timeZone, now = new Date()) {
        try {
            const options = {
                calendar: 'gregory',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            };
            if (timeZone) options.timeZone = timeZone;
            const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
            const map = {};
            parts.forEach(p => { map[p.type] = p.value; });
            const year = Number(map.year);
            const month = Number(map.month);
            const day = Number(map.day);
            if (year && month && day) {
                return { year, month, day };
            }
        } catch (err) {
            // Fall through to local Date
        }
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        };
    }

    /**
     * Checks whether an IANA timezone lies in the Southern Hemisphere.
     */
    function isSouthernHemisphere(timeZone) {
        if (!timeZone) return false;
        let canonical = timeZone;
        try {
            canonical = new Intl.DateTimeFormat('en-US', { timeZone }).resolvedOptions().timeZone || timeZone;
        } catch (err) {
            // Use provided string directly
        }
        if (SOUTHERN_PREFIXES.some(prefix => canonical.startsWith(prefix))) return true;
        if (canonical.startsWith('Indian/') && canonical !== 'Indian/Maldives') return true;
        return SOUTHERN_ZONES.has(canonical) || SOUTHERN_ZONES.has(timeZone);
    }

    /**
     * Calculates Easter Sunday for a given Gregorian year (Meeus/Jones/Butcher algorithm)
     * and returns an 'MM-DD' range spanning Palm Sunday through Easter Monday.
     */
    function getEasterDateRange(year, daysBefore = 7, daysAfter = 1) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;

        const formatUTC = (dateObj) => {
            const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getUTCDate()).padStart(2, '0');
            return `${mm}-${dd}`;
        };

        const startDate = new Date(Date.UTC(year, month - 1, day - daysBefore));
        const endDate = new Date(Date.UTC(year, month - 1, day + daysAfter));
        return { start: formatUTC(startDate), end: formatUTC(endDate) };
    }

    function isDateInRange(currentVal, range) {
        if (!range || typeof range.start !== 'string' || typeof range.end !== 'string') return false;
        const [sM, sD] = range.start.split('-').map(Number);
        const [eM, eD] = range.end.split('-').map(Number);
        if (!sM || !sD || !eM || !eD) return false;
        const start = sM * 100 + sD;
        const end = eM * 100 + eD;
        if (start <= end) return currentVal >= start && currentVal <= end;
        return currentVal >= start || currentVal <= end;
    }

    function matchSeasonOrHoliday(ranges, year, currentVal, invertSeasons) {
        const easterRange = ranges.EASTER === 'auto'
            ? getEasterDateRange(year)
            : ranges.EASTER;

        if (isDateInRange(currentVal, ranges.HALLOWEEN)) return 'halloween';
        if (isDateInRange(currentVal, ranges.FIREWORKS)) return 'fireworks';
        if (isDateInRange(currentVal, easterRange)) return 'easter';

        let season = 'winter';
        if (isDateInRange(currentVal, ranges.WINTER)) season = 'winter';
        else if (isDateInRange(currentVal, ranges.SPRING)) season = 'spring';
        else if (isDateInRange(currentVal, ranges.SUMMER)) season = 'summer';
        else if (isDateInRange(currentVal, ranges.AUTUMN)) season = 'autumn';

        return invertSeasons ? (SOUTHERN_SEASON_MAP[season] || season) : season;
    }

    /**
     * Resolves the active particle type from selection mode ('timezone', 'auto', 'dates', or fixed).
     */
    function resolveParticleType(mode, dates, configuredTimeZone, now = new Date()) {
        if (mode === 'timezone' || mode === 'auto') {
            const timeZone = resolveParticleTimeZone(configuredTimeZone);
            const { year, month, day } = getDateInTimeZone(timeZone, now);
            const timezoneRanges = Object.assign({}, TIMEZONE_HOLIDAYS, { EASTER: 'auto' }, TIMEZONE_SEASONS);
            return matchSeasonOrHoliday(timezoneRanges, year, month * 100 + day, isSouthernHemisphere(timeZone));
        }

        if (mode === 'dates') {
            const mergedDates = Object.assign({}, DEFAULT_DATES, dates || {});
            const year = now.getFullYear();
            const currentVal = (now.getMonth() + 1) * 100 + now.getDate();
            return matchSeasonOrHoliday(mergedDates, year, currentVal, false);
        }

        return mode;
    }

function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let pConfig = {
        enabled: true,
        type: 'default',
        timeZone: 'auto',
        color: 'rgba(255, 255, 255, 0.15)',
        speed: 0.5,
        density: 12000,
        dates: Object.assign({}, DEFAULT_DATES)
    };

    if (typeof CONFIG !== 'undefined' && CONFIG.ANIMATION && CONFIG.ANIMATION.PARTICLES) {
        const c = CONFIG.ANIMATION.PARTICLES;
        pConfig.enabled = c.ENABLED !== undefined ? c.ENABLED : pConfig.enabled;
        pConfig.type = c.TYPE || 'default';
        pConfig.timeZone = c.TIMEZONE || 'auto';
        pConfig.color = c.COLOR || pConfig.color;
        pConfig.speed = c.SPEED || pConfig.speed;
        pConfig.density = c.DENSITY || pConfig.density;
        pConfig.dates = Object.assign({}, DEFAULT_DATES, c.DATES || {});
    }

    if (!pConfig.enabled) return;

    pConfig.type = resolveParticleType(pConfig.type, pConfig.dates, pConfig.timeZone);

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

initParticles.resolveType = resolveParticleType;
initParticles.getEasterDateRange = getEasterDateRange;
initParticles.isSouthernHemisphere = isSouthernHemisphere;
global.initParticles = initParticles;
})(typeof window !== 'undefined' ? window : globalThis);