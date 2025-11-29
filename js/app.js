/**
 * Application principale - Initialisation et gestion des événements
 */

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les données
    DataManager.init();

    // Initialiser les dates par défaut
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('boss-clan-date').value = today;

    // Calculer la semaine actuelle pour les boss hebdomadaires
    const now = new Date();
    const year = now.getFullYear();
    const week = getWeekNumber(now);
    const weekString = `${year}-W${week.toString().padStart(2, '0')}`;
    document.getElementById('chimere-week').value = weekString;
    document.getElementById('hydre-week').value = weekString;

    // Initialiser le mois actuel pour les statistiques mensuelles
    const currentMonth = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('monthly-month').value = currentMonth;

    // Afficher les membres
    MembersManager.renderMembers();

    // Afficher les onglets par défaut
    showTab('members');

    // Gestion des onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            showTab(tab);
        });
    });

    // Gestion du bouton d'ajout de membre
    document.getElementById('add-member-btn').addEventListener('click', () => {
        MembersManager.addMember();
    });

    // Gestion des modals
    setupModals();

    // Gestion des changements de date/semaine
    document.getElementById('boss-clan-date').addEventListener('change', (e) => {
        KeysManager.renderBossClanTracking(e.target.value);
    });

    document.getElementById('chimere-week').addEventListener('change', (e) => {
        KeysManager.renderChimereTracking(e.target.value);
    });

    document.getElementById('hydre-week').addEventListener('change', (e) => {
        KeysManager.renderHydreTracking(e.target.value);
    });

    // Gestion des vues et filtres pour Boss de Clan
    setupBossClanControls();

    // Gestion de la recherche et saisie rapide
    setupQuickActions();

    // Gestion du changement de mois pour les statistiques mensuelles
    document.getElementById('monthly-month').addEventListener('change', (e) => {
        renderMonthlyStats(e.target.value);
    });

    // Initialiser les vues de suivi
    KeysManager.renderBossClanTracking(today);
    KeysManager.renderChimereTracking(weekString);
    KeysManager.renderHydreTracking(weekString);

    // Initialiser les statistiques mensuelles
    renderMonthlyStats(currentMonth);

    // Gestion du résumé
    setupSummary();
});

// Afficher un onglet spécifique
function showTab(tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Afficher l'onglet sélectionné
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Mettre à jour le contenu si nécessaire
    if (tabName === 'boss-clan') {
        const date = document.getElementById('boss-clan-date').value;
        if (date) KeysManager.renderBossClanTracking(date);
    } else if (tabName === 'chimere') {
        const week = document.getElementById('chimere-week').value;
        if (week) KeysManager.renderChimereTracking(week);
    } else if (tabName === 'hydre') {
        const week = document.getElementById('hydre-week').value;
        if (week) KeysManager.renderHydreTracking(week);
    } else if (tabName === 'summary') {
        renderSummary();
    } else if (tabName === 'monthly') {
        const month = document.getElementById('monthly-month').value;
        if (month) renderMonthlyStats(month);
    }
}

// Configuration des modals
function setupModals() {
    // Modal membre
    const memberModal = document.getElementById('member-modal');
    const memberClose = memberModal.querySelector('.close');
    const cancelMemberBtn = document.getElementById('cancel-btn');

    memberClose.addEventListener('click', () => {
        memberModal.classList.remove('active');
    });
    cancelMemberBtn.addEventListener('click', () => {
        memberModal.classList.remove('active');
    });

    // Modal clés
    const keysModal = document.getElementById('keys-modal');
    const keysClose = keysModal.querySelector('.close');
    const cancelKeysBtn = document.getElementById('cancel-keys-btn');

    keysClose.addEventListener('click', () => {
        keysModal.classList.remove('active');
    });
    cancelKeysBtn.addEventListener('click', () => {
        keysModal.classList.remove('active');
    });

    // Fermer les modals en cliquant à l'extérieur
    window.addEventListener('click', (e) => {
        if (e.target === memberModal) {
            memberModal.classList.remove('active');
        }
        if (e.target === keysModal) {
            keysModal.classList.remove('active');
        }
    });

    // Modal saisie rapide
    const quickEditModal = document.getElementById('quick-edit-modal');
    if (quickEditModal) {
        const quickEditClose = quickEditModal.querySelector('.close');
        if (quickEditClose) {
            quickEditClose.addEventListener('click', () => {
                quickEditModal.classList.remove('active');
            });
        }
        window.addEventListener('click', (e) => {
            if (e.target === quickEditModal) {
                quickEditModal.classList.remove('active');
            }
        });
    }

    // Modal screenshots
    const screenshotModal = document.getElementById('screenshot-modal');
    if (screenshotModal) {
        const screenshotClose = screenshotModal.querySelector('.close');
        if (screenshotClose) {
            screenshotClose.addEventListener('click', () => {
                screenshotModal.classList.remove('active');
            });
        }
        window.addEventListener('click', (e) => {
            if (e.target === screenshotModal) {
                screenshotModal.classList.remove('active');
            }
        });
    }
}

// Configuration du résumé
function setupSummary() {
    document.getElementById('summary-boss-type').addEventListener('change', renderSummary);
    document.getElementById('summary-status').addEventListener('change', renderSummary);
}

// Afficher le résumé
function renderSummary() {
    const bossType = document.getElementById('summary-boss-type').value;
    const statusFilter = document.getElementById('summary-status').value;
    const container = document.getElementById('summary-content');

    const members = DataManager.getMembers();
    const results = [];

    // Boss de Clan
    if (bossType === 'all' || bossType === 'boss-clan') {
        const allBossClanKeys = DataManager.getBossClanKeys();
        const settings = DataManager.getSettings();
        const maxKeys = settings?.bossClanKeysPerDay || 4;

        Object.keys(allBossClanKeys).forEach(date => {
            const keys = allBossClanKeys[date];
            members.forEach(member => {
                const memberKeys = keys[member.id];
                if (memberKeys) {
                    const status = KeysManager.calculateStatus(memberKeys.used, maxKeys);
                    if (statusFilter === 'all' || statusFilter === status) {
                        results.push({
                            member: member.name,
                            boss: 'Boss de Clan',
                            period: date,
                            status: status,
                            used: memberKeys.used,
                            max: maxKeys
                        });
                    }
                }
            });
        });
    }

    // Chimère
    if (bossType === 'all' || bossType === 'chimere') {
        const allChimereKeys = DataManager.getChimereKeys();
        const maxKeys = 2;

        Object.keys(allChimereKeys).forEach(week => {
            const keys = allChimereKeys[week];
            members.forEach(member => {
                const memberKeys = keys[member.id];
                if (memberKeys) {
                    const status = KeysManager.calculateStatus(memberKeys.used, maxKeys);
                    if (statusFilter === 'all' || statusFilter === status) {
                        results.push({
                            member: member.name,
                            boss: 'Chimère',
                            period: week,
                            status: status,
                            used: memberKeys.used,
                            max: maxKeys
                        });
                    }
                }
            });
        });
    }

    // Hydre
    if (bossType === 'all' || bossType === 'hydre') {
        const allHydreKeys = DataManager.getHydreKeys();
        const maxKeys = 3;

        Object.keys(allHydreKeys).forEach(week => {
            const keys = allHydreKeys[week];
            members.forEach(member => {
                const memberKeys = keys[member.id];
                if (memberKeys) {
                    const status = KeysManager.calculateStatus(memberKeys.used, maxKeys);
                    if (statusFilter === 'all' || statusFilter === status) {
                        results.push({
                            member: member.name,
                            boss: 'Hydre',
                            period: week,
                            status: status,
                            used: memberKeys.used,
                            max: maxKeys
                        });
                    }
                }
            });
        });
    }

    // Afficher les résultats
    if (results.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Aucun résultat trouvé.</p>';
        return;
    }

    // Grouper par statut
    const grouped = {};
    results.forEach(result => {
        if (!grouped[result.status]) {
            grouped[result.status] = [];
        }
        grouped[result.status].push(result);
    });

    container.innerHTML = Object.keys(grouped).map(status => {
        const items = grouped[status];
        return `
            <div class="summary-section">
                <h3>${KeysManager.getStatusText(status)} (${items.length})</h3>
                <ul class="summary-list">
                    ${items.map(item => `
                        <li>
                            <strong>${item.member}</strong> - ${item.boss} 
                            (${item.period}) : ${item.used}/${item.max} clés
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }).join('');
}

// Configuration des contrôles pour Boss de Clan
function setupBossClanControls() {
    const container = document.getElementById('boss-clan-tracking');
    const gridBtn = document.getElementById('boss-clan-grid-view');
    const listBtn = document.getElementById('boss-clan-list-view');
    const filter = document.getElementById('boss-clan-filter');

    if (gridBtn) {
        gridBtn.addEventListener('click', () => {
            container.classList.remove('list-view');
            container.classList.add('grid-view');
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            const date = document.getElementById('boss-clan-date').value;
            if (date) KeysManager.renderBossClanTracking(date);
        });
    }

    if (listBtn) {
        listBtn.addEventListener('click', () => {
            container.classList.remove('grid-view');
            container.classList.add('list-view');
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            const date = document.getElementById('boss-clan-date').value;
            if (date) KeysManager.renderBossClanTracking(date);
        });
    }

    if (filter) {
        filter.addEventListener('change', () => {
            const date = document.getElementById('boss-clan-date').value;
            if (date) KeysManager.renderBossClanTracking(date);
        });
    }
}

// Configuration des actions rapides (recherche, saisie rapide, screenshots)
function setupQuickActions() {
    // Recherche avec autocomplete
    const searchInput = document.getElementById('boss-clan-search');
    const searchResults = document.getElementById('boss-clan-search-results');
    
    if (searchInput) {
        let selectedIndex = -1;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length === 0) {
                searchResults.classList.remove('active');
                return;
            }

            const members = DataManager.getMembers();
            const filtered = members.filter(m => 
                m.name.toLowerCase().includes(query)
            ).slice(0, 10);

            if (filtered.length === 0) {
                searchResults.innerHTML = '<div class="search-result-item">Aucun résultat</div>';
                searchResults.classList.add('active');
                return;
            }

            searchResults.innerHTML = filtered.map((member, index) => `
                <div class="search-result-item" data-index="${index}" data-member-id="${member.id}">
                    ${member.name}
                </div>
            `).join('');

            searchResults.classList.add('active');
            selectedIndex = -1;

            // Gérer les clics sur les résultats
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const memberId = item.getAttribute('data-member-id');
                    const date = document.getElementById('boss-clan-date').value;
                    if (date && memberId) {
                        KeysManager.openKeysModal(memberId, 'boss-clan', date);
                        searchInput.value = '';
                        searchResults.classList.remove('active');
                    }
                });
            });
        });

        // Navigation au clavier
        searchInput.addEventListener('keydown', (e) => {
            const items = searchResults.querySelectorAll('.search-result-item');
            if (items.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(items);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                items[selectedIndex].click();
            } else if (e.key === 'Escape') {
                searchResults.classList.remove('active');
            }
        });

        function updateSelection(items) {
            items.forEach((item, index) => {
                item.classList.toggle('highlight', index === selectedIndex);
            });
        }

        // Fermer les résultats en cliquant ailleurs
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });
    }

    // Bouton saisie rapide
    const quickEditBtn = document.getElementById('boss-clan-quick-edit-btn');
    const quickEditModal = document.getElementById('quick-edit-modal');
    const quickEditContainer = document.getElementById('quick-edit-container');
    const quickEditSaveBtn = document.getElementById('quick-edit-save-btn');
    const quickEditCancelBtn = document.getElementById('quick-edit-cancel-btn');

    if (quickEditBtn) {
        quickEditBtn.addEventListener('click', () => {
            openQuickEditModal('boss-clan');
        });
    }

    if (quickEditCancelBtn) {
        quickEditCancelBtn.addEventListener('click', () => {
            quickEditModal.classList.remove('active');
        });
    }

    // Fermer le modal de saisie rapide avec la croix
    if (quickEditModal) {
        const quickEditClose = quickEditModal.querySelector('.close');
        if (quickEditClose) {
            quickEditClose.addEventListener('click', () => {
                quickEditModal.classList.remove('active');
            });
        }
    }

    if (quickEditSaveBtn) {
        quickEditSaveBtn.addEventListener('click', () => {
            saveQuickEdit('boss-clan');
        });
    }

    // Bouton upload screenshots
    const screenshotBtn = document.getElementById('boss-clan-screenshot-btn');
    const screenshotModal = document.getElementById('screenshot-modal');
    const screenshotFiles = document.getElementById('screenshot-files');
    const screenshotUploadZone = document.getElementById('screenshot-upload-zone');
    const screenshotPreview = document.getElementById('screenshot-preview');
    const screenshotProcessBtn = document.getElementById('screenshot-process-btn');
    const screenshotCancelBtn = document.getElementById('screenshot-cancel-btn');

    if (screenshotBtn) {
        screenshotBtn.addEventListener('click', () => {
            screenshotModal.classList.add('active');
        });
    }

    if (screenshotCancelBtn) {
        screenshotCancelBtn.addEventListener('click', () => {
            screenshotModal.classList.remove('active');
            screenshotPreview.innerHTML = '';
            screenshotFiles.value = '';
        });
    }

    // Fermer le modal screenshots avec la croix
    if (screenshotModal) {
        const screenshotClose = screenshotModal.querySelector('.close');
        if (screenshotClose) {
            screenshotClose.addEventListener('click', () => {
                screenshotModal.classList.remove('active');
                screenshotPreview.innerHTML = '';
                screenshotFiles.value = '';
            });
        }
    }

    // Gestion de l'upload de fichiers
    if (screenshotFiles) {
        screenshotFiles.addEventListener('change', (e) => {
            handleScreenshotFiles(e.target.files);
        });
    }

    // Drag and drop
    if (screenshotUploadZone) {
        screenshotUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            screenshotUploadZone.classList.add('dragover');
        });

        screenshotUploadZone.addEventListener('dragleave', () => {
            screenshotUploadZone.classList.remove('dragover');
        });

        screenshotUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            screenshotUploadZone.classList.remove('dragover');
            handleScreenshotFiles(e.dataTransfer.files);
        });
    }

    function handleScreenshotFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const div = document.createElement('div');
                    div.className = 'screenshot-item';
                    div.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
                    `;
                    screenshotPreview.appendChild(div);
                    screenshotProcessBtn.disabled = false;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (screenshotProcessBtn) {
        screenshotProcessBtn.addEventListener('click', () => {
            // TODO: Implémenter la reconnaissance d'image
            alert('La reconnaissance automatique des screenshots sera disponible prochainement. Pour l\'instant, utilisez la saisie rapide.');
        });
    }
}

// Ouvrir le modal de saisie rapide
function openQuickEditModal(bossType) {
    const modal = document.getElementById('quick-edit-modal');
    const container = document.getElementById('quick-edit-container');
    const title = document.getElementById('quick-edit-title');
    
    const members = DataManager.getMembers();
    const date = document.getElementById('boss-clan-date').value;
    const keys = DataManager.getBossClanKeysForDate(date);
    
    const bossNames = {
        'boss-clan': 'Boss de Clan',
        'chimere': 'Chimère',
        'hydre': 'Hydre'
    };
    
    title.textContent = `⚡ Saisie Rapide - ${bossNames[bossType]}`;
    
    container.innerHTML = members.map(member => {
        const memberKeys = keys[member.id] || { used: 0, details: [] };
        const existingDetails = memberKeys.details || [];
        
        return `
            <div class="quick-edit-item" data-member-id="${member.id}">
                <div class="quick-edit-name">${member.name}</div>
                <div class="quick-edit-difficulty">
                    <select class="difficulty-select" data-member-id="${member.id}">
                        <option value="">Sélectionner difficulté</option>
                        ${KeysManager.DIFFICULTIES.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                </div>
                <div class="quick-edit-count">
                    <input type="number" min="0" value="0" class="count-input" data-member-id="${member.id}" placeholder="0">
                </div>
                <div class="quick-edit-actions">
                    <button class="btn btn-primary btn-small" onclick="addQuickEditDifficulty('${member.id}')">+</button>
                </div>
            </div>
        `;
    }).join('');
    
    modal.classList.add('active');
}

// Ajouter une difficulté dans la saisie rapide (accessible globalement)
window.addQuickEditDifficulty = function(memberId) {
    const item = document.querySelector(`.quick-edit-item[data-member-id="${memberId}"]`);
    if (!item) return;
    const newRow = item.cloneNode(true);
    newRow.querySelector('.difficulty-select').value = '';
    newRow.querySelector('.count-input').value = '0';
    item.parentNode.insertBefore(newRow, item.nextSibling);
};

// Sauvegarder la saisie rapide
function saveQuickEdit(bossType) {
    const items = document.querySelectorAll('.quick-edit-item');
    const date = document.getElementById('boss-clan-date').value;
    const modal = document.getElementById('quick-edit-modal');
    
    let savedCount = 0;
    let updatedMembers = [];
    
    items.forEach(item => {
        const memberId = item.getAttribute('data-member-id');
        const memberName = item.querySelector('.quick-edit-name').textContent;
        const difficultySelects = item.querySelectorAll('.difficulty-select');
        const countInputs = item.querySelectorAll('.count-input');
        
        const details = [];
        let totalUsed = 0;
        
        difficultySelects.forEach((select, index) => {
            const difficulty = select.value;
            const count = parseInt(countInputs[index].value) || 0;
            
            if (difficulty && count > 0) {
                const existing = details.find(d => d.difficulte === difficulty);
                if (existing) {
                    existing.nombre += count;
                } else {
                    details.push({ difficulte: difficulty, nombre: count });
                }
                totalUsed += count;
            }
        });
        
        if (totalUsed > 0 || details.length > 0) {
            const data = { used: totalUsed, details: details };
            const keys = DataManager.getBossClanKeysForDate(date);
            keys[memberId] = data;
            DataManager.saveBossClanKeysForDate(date, keys);
            savedCount++;
            updatedMembers.push({ name: memberName, keys: totalUsed });
        }
    });
    
    // Afficher les résultats
    const resultsHtml = updatedMembers.length > 0 
        ? `<div class="quick-edit-results">
            <h3>✅ ${savedCount} joueur(s) mis à jour :</h3>
            <ul style="list-style: none; padding: 0; margin: 10px 0;">
                ${updatedMembers.map(m => `<li style="padding: 5px; background: #f8f9fa; margin: 5px 0; border-radius: 5px;">${m.name} : ${m.keys} clé(s)</li>`).join('')}
            </ul>
          </div>`
        : '<div class="quick-edit-results"><p>Aucune donnée à enregistrer.</p></div>';
    
    // Afficher les résultats dans le modal avant de fermer
    const container = document.getElementById('quick-edit-container');
    container.innerHTML = resultsHtml;
    
    // Fermer le modal après 2 secondes et rafraîchir
    setTimeout(() => {
        modal.classList.remove('active');
        KeysManager.renderBossClanTracking(date);
    }, 2000);
}

// Calculer le numéro de semaine ISO
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Afficher les statistiques mensuelles
function renderMonthlyStats(monthString) {
    const container = document.getElementById('monthly-stats');
    const members = DataManager.getMembers();

    if (!monthString) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Veuillez sélectionner un mois.</p>';
        return;
    }

    // Parser le mois (format: YYYY-MM)
    const [year, month] = monthString.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0); // Dernier jour du mois

    // Calculer les statistiques pour chaque membre
    const stats = members.map(member => {
        let bossClanTotal = 0;
        let chimereTotal = 0;
        let hydreTotal = 0;

        // Boss de Clan (quotidien) - compter tous les jours du mois
        const allBossClanKeys = DataManager.getBossClanKeys();
        Object.keys(allBossClanKeys).forEach(date => {
            const dateObj = new Date(date);
            if (dateObj >= monthStart && dateObj <= monthEnd) {
                const keys = allBossClanKeys[date];
                if (keys[member.id]) {
                    bossClanTotal += keys[member.id].used || 0;
                }
            }
        });

        // Chimère et Hydre (hebdomadaires) - compter toutes les semaines du mois
        const allChimereKeys = DataManager.getChimereKeys();
        const allHydreKeys = DataManager.getHydreKeys();

        // Pour chaque semaine, vérifier si elle appartient au mois
        Object.keys(allChimereKeys).forEach(week => {
            const weekDate = getDateFromWeek(week);
            if (weekDate && weekDate >= monthStart && weekDate <= monthEnd) {
                const keys = allChimereKeys[week];
                if (keys[member.id]) {
                    chimereTotal += keys[member.id].used || 0;
                }
            }
        });

        Object.keys(allHydreKeys).forEach(week => {
            const weekDate = getDateFromWeek(week);
            if (weekDate && weekDate >= monthStart && weekDate <= monthEnd) {
                const keys = allHydreKeys[week];
                if (keys[member.id]) {
                    hydreTotal += keys[member.id].used || 0;
                }
            }
        });

        return {
            member: member.name,
            bossClan: bossClanTotal,
            chimere: chimereTotal,
            hydre: hydreTotal,
            total: bossClanTotal + chimereTotal + hydreTotal
        };
    });

    // Trier par total décroissant
    stats.sort((a, b) => b.total - a.total);

    // Afficher les statistiques
    if (stats.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Aucune donnée pour ce mois.</p>';
        return;
    }

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthName = monthNames[month - 1];

    container.innerHTML = `
        <div class="monthly-header">
            <h3 style="color: #667eea; margin-bottom: 20px;">Statistiques pour ${monthName} ${year}</h3>
        </div>
        <div class="monthly-table">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #667eea; color: white;">
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Membre</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Boss de Clan</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Chimère</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Hydre</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.map(stat => `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600;">${stat.member}</td>
                            <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${stat.bossClan}</td>
                            <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${stat.chimere}</td>
                            <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${stat.hydre}</td>
                            <td style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; color: #667eea;">${stat.total}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr style="background: #f8f9fa; font-weight: bold;">
                        <td style="padding: 12px; border: 1px solid #ddd;">TOTAL</td>
                        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">
                            ${stats.reduce((sum, s) => sum + s.bossClan, 0)}
                        </td>
                        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">
                            ${stats.reduce((sum, s) => sum + s.chimere, 0)}
                        </td>
                        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">
                            ${stats.reduce((sum, s) => sum + s.hydre, 0)}
                        </td>
                        <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #667eea;">
                            ${stats.reduce((sum, s) => sum + s.total, 0)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

// Convertir une semaine ISO (YYYY-Www) en date (premier jour de la semaine)
function getDateFromWeek(weekString) {
    try {
        const [year, week] = weekString.split('-W').map(Number);
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dow = simple.getDay();
        const ISOweekStart = simple;
        if (dow <= 4) {
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        } else {
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        }
        return ISOweekStart;
    } catch (e) {
        return null;
    }
}

