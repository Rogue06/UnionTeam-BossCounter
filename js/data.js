/**
 * Gestion du stockage des données
 * Utilise localStorage pour persister les données localement
 */

const DataManager = {
    // Clés de stockage
    STORAGE_KEYS: {
        MEMBERS: 'rsl_clan_members',
        BOSS_CLAN_KEYS: 'rsl_boss_clan_keys',
        CHIMERE_KEYS: 'rsl_chimere_keys',
        HYDRE_KEYS: 'rsl_hydre_keys',
        SETTINGS: 'rsl_settings'
    },

    // Initialiser les données par défaut
    init() {
        // Initialiser les membres si vide
        if (!this.getMembers().length) {
            this.saveMembers([]);
        }

        // Initialiser les clés si vides
        if (!this.getBossClanKeys()) {
            this.saveBossClanKeys({});
        }
        if (!this.getChimereKeys()) {
            this.saveChimereKeys({});
        }
        if (!this.getHydreKeys()) {
            this.saveHydreKeys({});
        }

        // Initialiser les paramètres
        if (!this.getSettings()) {
            this.saveSettings({
                bossClanKeysPerDay: 4, // Nombre de clés par jour pour le boss de clan (1 clé toutes les 6h = 4 max/jour)
                resetHour: 10, // Heure de réinitialisation (10h du matin heure française)
                difficulties: ['Facile', 'Normal', 'Difficile', 'Brutal', 'Cauchemar', 'Ultra-Cauchemar']
            });
        }
    },

    // Gestion des membres
    getMembers() {
        const data = localStorage.getItem(this.STORAGE_KEYS.MEMBERS);
        return data ? JSON.parse(data) : [];
    },

    saveMembers(members) {
        localStorage.setItem(this.STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    },

    addMember(name) {
        const members = this.getMembers();
        const newMember = {
            id: Date.now().toString(),
            name: name.trim(),
            createdAt: new Date().toISOString()
        };
        members.push(newMember);
        this.saveMembers(members);
        return newMember;
    },

    removeMember(id) {
        const members = this.getMembers();
        const filtered = members.filter(m => m.id !== id);
        this.saveMembers(filtered);
        return filtered;
    },

    // Gestion des clés Boss de Clan (quotidien)
    getBossClanKeys() {
        const data = localStorage.getItem(this.STORAGE_KEYS.BOSS_CLAN_KEYS);
        return data ? JSON.parse(data) : {};
    },

    saveBossClanKeys(keys) {
        localStorage.setItem(this.STORAGE_KEYS.BOSS_CLAN_KEYS, JSON.stringify(keys));
    },

    getBossClanKeysForDate(date) {
        const allKeys = this.getBossClanKeys();
        return allKeys[date] || {};
    },

    saveBossClanKeysForDate(date, keys) {
        const allKeys = this.getBossClanKeys();
        allKeys[date] = keys;
        this.saveBossClanKeys(allKeys);
    },

    // Gestion des clés Chimère (hebdomadaire)
    getChimereKeys() {
        const data = localStorage.getItem(this.STORAGE_KEYS.CHIMERE_KEYS);
        return data ? JSON.parse(data) : {};
    },

    saveChimereKeys(keys) {
        localStorage.setItem(this.STORAGE_KEYS.CHIMERE_KEYS, JSON.stringify(keys));
    },

    getChimereKeysForWeek(week) {
        const allKeys = this.getChimereKeys();
        return allKeys[week] || {};
    },

    saveChimereKeysForWeek(week, keys) {
        const allKeys = this.getChimereKeys();
        allKeys[week] = keys;
        this.saveChimereKeys(allKeys);
    },

    // Gestion des clés Hydre (hebdomadaire)
    getHydreKeys() {
        const data = localStorage.getItem(this.STORAGE_KEYS.HYDRE_KEYS);
        return data ? JSON.parse(data) : {};
    },

    saveHydreKeys(keys) {
        localStorage.setItem(this.STORAGE_KEYS.HYDRE_KEYS, JSON.stringify(keys));
    },

    getHydreKeysForWeek(week) {
        const allKeys = this.getHydreKeys();
        return allKeys[week] || {};
    },

    saveHydreKeysForWeek(week, keys) {
        const allKeys = this.getHydreKeys();
        allKeys[week] = keys;
        this.saveHydreKeys(allKeys);
    },

    // Paramètres
    getSettings() {
        const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : null;
    },

    saveSettings(settings) {
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    // Export des données (pour sauvegarde)
    exportData() {
        return {
            members: this.getMembers(),
            bossClanKeys: this.getBossClanKeys(),
            chimereKeys: this.getChimereKeys(),
            hydreKeys: this.getHydreKeys(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    },

    // Import des données (pour restauration)
    importData(data) {
        if (data.members) this.saveMembers(data.members);
        if (data.bossClanKeys) this.saveBossClanKeys(data.bossClanKeys);
        if (data.chimereKeys) this.saveChimereKeys(data.chimereKeys);
        if (data.hydreKeys) this.saveHydreKeys(data.hydreKeys);
        if (data.settings) this.saveSettings(data.settings);
    }
};

