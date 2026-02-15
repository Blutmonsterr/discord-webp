const CONFIG = {
    // Server ID (Right click on Server -> Copy ID)
    SERVER_ID: '324167053516734465', // '324167053516734465' for Daddeln.at
    
    // Language ('de' or 'en')
    LANGUAGE: 'en',

    // Background image (URL or leave empty for server icon)
    BACKGROUND_IMAGE: 'https://daddeln.at/images/Gaming.jpg',

    // Server Icon (URL or leave empty for Discord API icon)
    SERVER_ICON: 'https://daddeln.at/images/1D.png',

    // Max number of members to show in the list
    MAX_MEMBERS: 10,

    // Social Media Links
    SOCIAL_LINKS: [
        { icon: 'fas fa-globe', url: '#', name: 'Web' },
        { icon: 'fas fa-globe', url: '#', name: 'Web' },
        { icon: 'fab fa-github', url: 'https://github.com/blutmonsterr/', name: 'GitHub' }
    ],

    // Partner Servers
    PARTNERS: {
        ENABLED: false,          // Set to false to disable the entire partner section
        LIST: [                 // Max 12 partners
            { id: '324167053516734465'}, // Example: Daddeln.at ID: 324167053516734465
        ]
    },

    // Animations
    ANIMATION: {
        // Particle effects (snow, leaves, etc.)
        PARTICLES: {
            ENABLED: true,
            TYPE: 'auto',   // 'auto', 'winter', 'summer', 'spring', 'autumn', 'halloween', 'fireworks', 'easter'
            
            // Date ranges for 'auto' mode (Format: 'MM-DD')
            DATES: {
                HALLOWEEN: { start: '10-25', end: '10-31' },
                FIREWORKS: { start: '12-31', end: '01-01' },
                EASTER:    { start: '03-25', end: '04-15' },
                WINTER:    { start: '11-01', end: '03-01' },
                SPRING:    { start: '03-02', end: '05-31' },
                SUMMER:    { start: '06-01', end: '08-31' },
                AUTUMN:    { start: '09-01', end: '10-24' }
            }
        },
        // Other effects
        BACKGROUND_BREATHE: true,
        CARD_TILT: true,
        TYPING_EFFECT: true,
        SHOW_SEASON_TAG: true,
        PULSE_SERVER_ICON: true,
        PULSE_JOIN_BUTTON: true
    }
};