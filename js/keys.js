/**
 * Gestion du suivi des clés pour les différents boss
 */

const KeysManager = {
    // Difficultés disponibles
    DIFFICULTIES: ['Facile', 'Normal', 'Difficile', 'Brutal', 'Cauchemar', 'Ultra-Cauchemar'],

    // Calculer le statut d'utilisation
    calculateStatus(used, max) {
        if (used === 0) return 'non-utilise';
        if (used < max) return 'partiellement-utilise';
        return 'utilise';
    },

    // Obtenir le texte du statut
    getStatusText(status) {
        const statusMap = {
            'non-utilise': 'Non utilisé',
            'partiellement-utilise': 'Partiellement utilisé',
            'utilise': 'Utilisé'
        };
        return statusMap[status] || status;
    },

    // Obtenir la classe CSS du statut
    getStatusClass(status) {
        return `status-${status}`;
    },

    // Calculer le temps restant avant la réinitialisation (10h du matin heure française)
    getTimeUntilReset(dateString) {
        const settings = DataManager.getSettings();
        const resetHour = settings?.resetHour || 10;
        
        const now = new Date();
        
        // Créer la date de réinitialisation pour la date sélectionnée
        const selectedDate = new Date(dateString + 'T00:00:00');
        const resetDate = new Date(selectedDate);
        resetDate.setHours(resetHour, 0, 0, 0);
        
        // Si la date sélectionnée est aujourd'hui et qu'on est après l'heure de réinitialisation,
        // la prochaine réinitialisation est demain
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);
        
        if (selectedDateOnly.getTime() === today.getTime() && now >= resetDate) {
            // Si on est après l'heure de réinitialisation aujourd'hui, la prochaine est demain
            resetDate.setDate(resetDate.getDate() + 1);
        } else if (selectedDateOnly.getTime() < today.getTime()) {
            // Si la date sélectionnée est dans le passé, on ne calcule pas le temps restant
            return {
                total: 0,
                hours: 0,
                minutes: 0,
                isUrgent: false,
                isVeryUrgent: false
            };
        }
        
        const timeRemaining = resetDate - now;
        const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
            total: timeRemaining,
            hours: hoursRemaining,
            minutes: minutesRemaining,
            isUrgent: hoursRemaining < 6, // Urgent si moins de 6h restantes
            isVeryUrgent: hoursRemaining < 2 // Très urgent si moins de 2h restantes
        };
    },

    // Obtenir le niveau d'alerte pour un joueur (simplifié)
    getAlertLevel(memberKeys, maxKeys, timeUntilReset) {
        const used = memberKeys.used || 0;
        
        // Rouge : 0 clé
        if (used === 0) {
            return 'critical';
        }
        
        // Orange : moins de 2 clés ou 2 clés
        if (used <= 2) {
            return 'warning';
        }
        
        // Vert : 3 clés ou plus
        return 'normal';
    },

    // Afficher les statistiques pour Boss de Clan (simplifié)
    renderBossClanStats(members, keys, referenceKeys, timeUntilReset) {
        const statsContainer = document.getElementById('boss-clan-stats');
        if (!statsContainer) return;

        let critical = 0, warning = 0, ok = 0;

        members.forEach(member => {
            const memberKeys = keys[member.id] || { used: 0, details: [] };
            const alertLevel = this.getAlertLevel(memberKeys, referenceKeys, timeUntilReset);
            if (alertLevel === 'critical') critical++;
            else if (alertLevel === 'warning') warning++;
            else ok++;
        });

        statsContainer.innerHTML = `
            <div class="stat-card critical">
                <div class="stat-value">${critical}</div>
                <div class="stat-label">🔴 0 clé</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-value">${warning}</div>
                <div class="stat-label">🟠 ≤ 2 clés</div>
            </div>
            <div class="stat-card success">
                <div class="stat-value">${ok}</div>
                <div class="stat-label">🟢 3+ clés</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${members.length}</div>
                <div class="stat-label">Total joueurs</div>
            </div>
        `;
    },

    // Afficher le suivi pour Boss de Clan (quotidien)
    renderBossClanTracking(date) {
        const members = DataManager.getMembers();
        const keys = DataManager.getBossClanKeysForDate(date);
        const settings = DataManager.getSettings();
        // Pour le Boss de Clan, on utilise 4 clés comme référence pour le statut, mais on peut en ajouter plus
        const referenceKeys = 4; // Référence : 1 clé toutes les 6h = 4 clés par jour
        const container = document.getElementById('boss-clan-tracking');

        if (members.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Aucun membre. Ajoutez des membres dans l\'onglet "Membres".</p>';
            return;
        }

        // Calculer le temps restant avant réinitialisation
        const timeUntilReset = this.getTimeUntilReset(date);

        // Afficher les statistiques
        this.renderBossClanStats(members, keys, referenceKeys, timeUntilReset);

        // Récupérer le filtre actif
        const filter = document.getElementById('boss-clan-filter')?.value || 'all';
        const view = container.classList.contains('list-view') ? 'list' : 'grid';

        // Filtrer les membres selon le filtre actif (simplifié)
        const filteredMembers = members.filter(member => {
            if (filter === 'all') return true;
            const memberKeys = keys[member.id] || { used: 0, details: [] };
            const alertLevel = this.getAlertLevel(memberKeys, referenceKeys, timeUntilReset);
            if (filter === 'critical') return alertLevel === 'critical';
            if (filter === 'warning') return alertLevel === 'warning';
            if (filter === 'ok') return alertLevel === 'normal';
            return true;
        });

        container.innerHTML = filteredMembers.map(member => {
            const memberKeys = keys[member.id] || { used: 0, details: [] };
            // Calculer le statut basé sur la référence (4 clés), mais on peut en avoir plus
            const status = this.calculateStatus(memberKeys.used, referenceKeys);
            // Pourcentage basé sur la référence, mais limité à 100% pour l'affichage
            const percentage = Math.min(100, (memberKeys.used / referenceKeys) * 100);
            const alertLevel = this.getAlertLevel(memberKeys, referenceKeys, timeUntilReset);
            
            // Déterminer la classe CSS et le message d'alerte (simplifié)
            let alertClass = '';
            let alertMessage = '';
            let cardBorderColor = '';
            
            if (alertLevel === 'critical') {
                // Rouge : 0 clé
                alertClass = 'alert-critical';
                alertMessage = `🔴 0 clé`;
                cardBorderColor = '#dc3545';
            } else if (alertLevel === 'warning') {
                // Orange : moins de 2 clés ou 2 clés
                alertClass = 'alert-warning';
                alertMessage = `🟠 ${memberKeys.used} clé(s)`;
                cardBorderColor = '#ff9800';
            } else {
                // Vert : 3 clés ou plus
                alertClass = 'alert-success';
                alertMessage = `🟢 ${memberKeys.used} clé(s)`;
                cardBorderColor = '#28a745';
            }

            const cardClass = view === 'list' ? 'member-keys-card list-view' : 'member-keys-card';

            return `
                <div class="${cardClass}" style="border-color: ${cardBorderColor || '#e9ecef'}; ${cardBorderColor ? 'border-width: 3px;' : ''}">
                    ${alertMessage && view === 'grid' ? `<div class="alert-banner ${alertClass}">${alertMessage}</div>` : ''}
                    <div class="keys-header">
                        <div class="keys-member-name">${this.escapeHtml(member.name)}</div>
                        <div class="keys-status ${this.getStatusClass(status)}">
                            ${this.getStatusText(status)}
                        </div>
                    </div>
                    <div class="keys-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%">
                                ${memberKeys.used} clé(s)${memberKeys.used > referenceKeys ? ` (${referenceKeys} recommandées)` : ''}
                            </div>
                        </div>
                    </div>
                    ${view === 'grid' ? `
                    <div class="keys-details">
                        <h4>Détails :</h4>
                        ${memberKeys.details && memberKeys.details.length > 0 
                            ? `<div class="difficulty-list">
                                ${memberKeys.details.map((d, idx) => 
                                    `<span class="difficulty-badge">
                                        ${d.difficulte} x${d.nombre}
                                        <button class="badge-remove" onclick="KeysManager.removeDifficultyFromCard('${member.id}', 'boss-clan', '${date}', '${d.difficulte}', ${idx})" title="Supprimer">×</button>
                                    </span>`
                                ).join('')}
                               </div>`
                            : '<p style="color: #999; font-size: 0.9em;">Aucune clé</p>'
                        }
                    </div>
                    <div class="quick-edit-on-card">
                        <div class="quick-edit-row">
                            <select class="quick-difficulty-select" data-member-id="${member.id}" data-boss-type="boss-clan" data-period="${date}">
                                <option value="">Choisir difficulté</option>
                                ${this.DIFFICULTIES.map(d => `<option value="${d}">${d}</option>`).join('')}
                            </select>
                            <div class="quick-count-controls">
                                <button class="btn-counter minus" onclick="KeysManager.quickAdjustKeys('${member.id}', 'boss-clan', '${date}', -1)" title="Réduire">−</button>
                                <input type="number" class="quick-count-input" value="1" min="1" data-member-id="${member.id}" data-boss-type="boss-clan" data-period="${date}">
                                <button class="btn-counter plus" onclick="KeysManager.quickAdjustKeys('${member.id}', 'boss-clan', '${date}', 1)" title="Ajouter">+</button>
                            </div>
                            <button class="btn btn-primary btn-small" onclick="KeysManager.quickAddKeys('${member.id}', 'boss-clan', '${date}')">✓ Ajouter</button>
                        </div>
                    </div>
                    ` : ''}
                    <div style="margin-top: ${view === 'list' ? '0' : '15px'}; display: flex; gap: 10px;">
                        <button class="btn btn-secondary btn-small" onclick="KeysManager.openKeysModal('${member.id}', 'boss-clan', '${date}')">
                            ✏️ Modifier
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Afficher le suivi pour Chimère (hebdomadaire)
    renderChimereTracking(week) {
        const members = DataManager.getMembers();
        const keys = DataManager.getChimereKeysForWeek(week);
        const maxKeys = 2; // Toujours 2 clés par semaine pour la Chimère
        const container = document.getElementById('chimere-tracking');

        if (members.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Aucun membre. Ajoutez des membres dans l\'onglet "Membres".</p>';
            return;
        }

        container.innerHTML = members.map(member => {
            const memberKeys = keys[member.id] || { used: 0, details: [] };
            const status = this.calculateStatus(memberKeys.used, maxKeys);
            const percentage = (memberKeys.used / maxKeys) * 100;

            return `
                <div class="member-keys-card">
                    <div class="keys-header">
                        <div class="keys-member-name">${this.escapeHtml(member.name)}</div>
                        <div class="keys-status ${this.getStatusClass(status)}">
                            ${this.getStatusText(status)}
                        </div>
                    </div>
                    <div class="keys-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%">
                                ${memberKeys.used} / ${maxKeys}
                            </div>
                        </div>
                    </div>
                    <div class="keys-details">
                        <h4>Détails :</h4>
                        ${memberKeys.details && memberKeys.details.length > 0 
                            ? `<div class="difficulty-list">
                                ${memberKeys.details.map((d, idx) => 
                                    `<span class="difficulty-badge">
                                        ${d.difficulte} x${d.nombre}
                                        <button class="badge-remove" onclick="KeysManager.removeDifficultyFromCard('${member.id}', 'chimere', '${week}', '${d.difficulte}', ${idx})" title="Supprimer">×</button>
                                    </span>`
                                ).join('')}
                               </div>`
                            : '<p style="color: #999; font-size: 0.9em;">Aucune clé</p>'
                        }
                    </div>
                    <div class="quick-edit-on-card">
                        <div class="quick-edit-row">
                            <select class="quick-difficulty-select" data-member-id="${member.id}" data-boss-type="chimere" data-period="${week}">
                                <option value="">Choisir difficulté</option>
                                ${this.DIFFICULTIES.map(d => `<option value="${d}">${d}</option>`).join('')}
                            </select>
                            <div class="quick-count-controls">
                                <button class="btn-counter minus" onclick="KeysManager.quickAdjustKeys('${member.id}', 'chimere', '${week}', -1)" title="Réduire">−</button>
                                <input type="number" class="quick-count-input" value="1" min="1" max="2" data-member-id="${member.id}" data-boss-type="chimere" data-period="${week}">
                                <button class="btn-counter plus" onclick="KeysManager.quickAdjustKeys('${member.id}', 'chimere', '${week}', 1)" title="Ajouter">+</button>
                            </div>
                            <button class="btn btn-primary btn-small" onclick="KeysManager.quickAddKeys('${member.id}', 'chimere', '${week}')">✓ Ajouter</button>
                        </div>
                    </div>
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <button class="btn btn-secondary btn-small" onclick="KeysManager.openKeysModal('${member.id}', 'chimere', '${week}')">
                            ✏️ Modifier
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Afficher le suivi pour Hydre (hebdomadaire)
    renderHydreTracking(week) {
        const members = DataManager.getMembers();
        const keys = DataManager.getHydreKeysForWeek(week);
        const maxKeys = 3; // Toujours 3 clés par semaine pour l'Hydre
        const container = document.getElementById('hydre-tracking');

        if (members.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Aucun membre. Ajoutez des membres dans l\'onglet "Membres".</p>';
            return;
        }

        container.innerHTML = members.map(member => {
            const memberKeys = keys[member.id] || { used: 0, details: [] };
            const status = this.calculateStatus(memberKeys.used, maxKeys);
            const percentage = (memberKeys.used / maxKeys) * 100;

            return `
                <div class="member-keys-card">
                    <div class="keys-header">
                        <div class="keys-member-name">${this.escapeHtml(member.name)}</div>
                        <div class="keys-status ${this.getStatusClass(status)}">
                            ${this.getStatusText(status)}
                        </div>
                    </div>
                    <div class="keys-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%">
                                ${memberKeys.used} / ${maxKeys}
                            </div>
                        </div>
                    </div>
                    <div class="keys-details">
                        <h4>Détails :</h4>
                        ${memberKeys.details && memberKeys.details.length > 0 
                            ? `<div class="difficulty-list">
                                ${memberKeys.details.map((d, idx) => 
                                    `<span class="difficulty-badge">
                                        ${d.difficulte} x${d.nombre}
                                        <button class="badge-remove" onclick="KeysManager.removeDifficultyFromCard('${member.id}', 'hydre', '${week}', '${d.difficulte}', ${idx})" title="Supprimer">×</button>
                                    </span>`
                                ).join('')}
                               </div>`
                            : '<p style="color: #999; font-size: 0.9em;">Aucune clé</p>'
                        }
                    </div>
                    <div class="quick-edit-on-card">
                        <div class="quick-edit-row">
                            <select class="quick-difficulty-select" data-member-id="${member.id}" data-boss-type="hydre" data-period="${week}">
                                <option value="">Choisir difficulté</option>
                                ${this.DIFFICULTIES.map(d => `<option value="${d}">${d}</option>`).join('')}
                            </select>
                            <div class="quick-count-controls">
                                <button class="btn-counter minus" onclick="KeysManager.quickAdjustKeys('${member.id}', 'hydre', '${week}', -1)" title="Réduire">−</button>
                                <input type="number" class="quick-count-input" value="1" min="1" max="3" data-member-id="${member.id}" data-boss-type="hydre" data-period="${week}">
                                <button class="btn-counter plus" onclick="KeysManager.quickAdjustKeys('${member.id}', 'hydre', '${week}', 1)" title="Ajouter">+</button>
                            </div>
                            <button class="btn btn-primary btn-small" onclick="KeysManager.quickAddKeys('${member.id}', 'hydre', '${week}')">✓ Ajouter</button>
                        </div>
                    </div>
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <button class="btn btn-secondary btn-small" onclick="KeysManager.openKeysModal('${member.id}', 'hydre', '${week}')">
                            ✏️ Modifier
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Ouvrir le modal pour enregistrer les clés
    openKeysModal(memberId, bossType, period) {
        const members = DataManager.getMembers();
        const member = members.find(m => m.id === memberId);
        
        if (!member) return;

        const modal = document.getElementById('keys-modal');
        const form = document.getElementById('keys-form');
        const title = document.getElementById('keys-modal-title');
        const memberNameDisplay = document.getElementById('keys-member-name');
        const memberIdInput = document.getElementById('keys-member-id');
        const bossTypeInput = document.getElementById('keys-boss-type');
        const periodInput = document.getElementById('keys-period');
        const difficultiesContainer = document.getElementById('difficulties-container');

        // Déterminer le nom du boss
        const bossNames = {
            'boss-clan': 'Boss de Clan',
            'chimere': 'Chimère',
            'hydre': 'Hydre'
        };

        title.textContent = `Enregistrer les clés - ${bossNames[bossType]}`;
        memberNameDisplay.textContent = member.name;
        memberIdInput.value = memberId;
        bossTypeInput.value = bossType;
        periodInput.value = period;

        // Charger les données existantes
        let existingData = { used: 0, details: [] };
        if (bossType === 'boss-clan') {
            const keys = DataManager.getBossClanKeysForDate(period);
            existingData = keys[memberId] || existingData;
        } else if (bossType === 'chimere') {
            const keys = DataManager.getChimereKeysForWeek(period);
            existingData = keys[memberId] || existingData;
        } else if (bossType === 'hydre') {
            const keys = DataManager.getHydreKeysForWeek(period);
            existingData = keys[memberId] || existingData;
        }

        // Déterminer la limite de clés selon le type de boss
        // Pas de limite pour le Boss de Clan (on peut avoir autant de clés qu'on veut, 1 clé toutes les 6h)
        const maxKeys = bossType === 'chimere' ? 2 : (bossType === 'hydre' ? 3 : null);

        // Créer les champs de difficultés
        difficultiesContainer.innerHTML = '';
        const difficultyInputs = [];

        // Créer le bouton "Ajouter une difficulté" AVANT de l'utiliser
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'btn btn-secondary';
        addBtn.textContent = '+ Ajouter une difficulté';
        addBtn.onclick = () => {
            // Calculer le total actuel
            let currentTotal = 0;
            difficultyInputs.forEach(inputGroup => {
                const input = inputGroup.querySelector('input[type="number"]');
                if (input && input.value) {
                    currentTotal += parseInt(input.value) || 0;
                }
            });

        // Vérifier la limite (uniquement pour Chimère et Hydre, pas pour Boss de Clan)
        if (maxKeys && currentTotal >= maxKeys) {
            alert(`Limite atteinte : maximum ${maxKeys} clé(s) par semaine pour ${bossType === 'chimere' ? 'la Chimère' : 'l\'Hydre'}`);
            return;
        }

            const index = difficultyInputs.length;
            const div = this.createDifficultyInput('', 1, index, bossType, maxKeys, difficultyInputs, addBtn);
            difficultiesContainer.insertBefore(div, addBtn);
            difficultyInputs.push(div);
            this.updateKeysTotal(bossType, maxKeys, difficultyInputs);
        };

        // Ajouter les difficultés existantes
        existingData.details.forEach((detail, index) => {
            const div = this.createDifficultyInput(detail.difficulte, detail.nombre, index, bossType, maxKeys, difficultyInputs, addBtn);
            difficultiesContainer.appendChild(div);
            difficultyInputs.push(div);
        });

        // Ajouter le bouton à la fin
        difficultiesContainer.appendChild(addBtn);

        // Ajouter un indicateur du total de clés
        const totalDisplay = document.createElement('div');
        totalDisplay.id = 'keys-total-display';
        totalDisplay.style.marginTop = '10px';
        totalDisplay.style.padding = '10px';
        totalDisplay.style.background = '#f8f9fa';
        totalDisplay.style.borderRadius = '5px';
        totalDisplay.style.fontWeight = '600';
        difficultiesContainer.appendChild(totalDisplay);

        // Initialiser l'affichage du total
        this.updateKeysTotal(bossType, maxKeys, difficultyInputs);

        modal.classList.add('active');

        // Gérer la soumission
        form.onsubmit = (e) => {
            e.preventDefault();
            if (!this.saveKeys(memberId, bossType, period, difficultyInputs, maxKeys)) {
                return; // Ne pas fermer le modal si erreur
            }
            modal.classList.remove('active');
            this.updateAllTabs();
        };
    },

    // Créer un champ de saisie pour une difficulté avec boutons + et -
    createDifficultyInput(difficulty, count, index, bossType, maxKeys, difficultyInputs, addBtn) {
        const div = document.createElement('div');
        div.className = 'difficulty-input-group';
        
        const select = document.createElement('select');
        select.required = true;
        this.DIFFICULTIES.forEach(diff => {
            const option = document.createElement('option');
            option.value = diff;
            option.textContent = diff;
            if (diff === difficulty) option.selected = true;
            select.appendChild(option);
        });

        // Conteneur pour les boutons + et - et l'input
        const counterContainer = document.createElement('div');
        counterContainer.style.display = 'flex';
        counterContainer.style.alignItems = 'center';
        counterContainer.style.gap = '10px';

        // Bouton -
        const minusBtn = document.createElement('button');
        minusBtn.type = 'button';
        minusBtn.className = 'btn btn-secondary counter-btn';
        minusBtn.textContent = '−';
        minusBtn.style.width = '40px';
        minusBtn.style.height = '40px';
        minusBtn.style.fontSize = '20px';
        minusBtn.style.padding = '0';
        minusBtn.onclick = () => {
            const currentValue = parseInt(input.value) || 1;
            if (currentValue > 1) {
                input.value = currentValue - 1;
                this.updateKeysTotal(bossType, maxKeys, difficultyInputs);
            }
        };

        // Input pour le nombre de clés
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        // Pas de limite max pour le Boss de Clan
        if (maxKeys) {
            input.max = maxKeys;
        }
        input.value = count || 1;
        input.required = true;
        input.style.width = '60px';
        input.style.textAlign = 'center';
        input.style.fontSize = '16px';
        input.style.fontWeight = '600';

        // Ajouter un événement pour vérifier la limite en temps réel (uniquement pour Chimère et Hydre)
        input.addEventListener('input', () => {
            // Vérifier que la valeur ne dépasse pas la limite totale (uniquement si maxKeys existe)
            if (maxKeys) {
                let currentTotal = 0;
                difficultyInputs.forEach(inputGroup => {
                    const otherInput = inputGroup.querySelector('input[type="number"]');
                    if (otherInput && otherInput !== input && otherInput.value) {
                        currentTotal += parseInt(otherInput.value) || 0;
                    }
                });
                const thisValue = parseInt(input.value) || 0;
                if ((currentTotal + thisValue) > maxKeys) {
                    input.value = Math.max(1, maxKeys - currentTotal);
                }
            }
            this.updateKeysTotal(bossType, maxKeys, difficultyInputs);
        });

        // Bouton +
        const plusBtn = document.createElement('button');
        plusBtn.type = 'button';
        plusBtn.className = 'btn btn-primary counter-btn';
        plusBtn.textContent = '+';
        plusBtn.style.width = '40px';
        plusBtn.style.height = '40px';
        plusBtn.style.fontSize = '20px';
        plusBtn.style.padding = '0';
        plusBtn.onclick = () => {
            const currentValue = parseInt(input.value) || 1;
            // Vérifier la limite totale (uniquement pour Chimère et Hydre, pas pour Boss de Clan)
            if (maxKeys) {
                let currentTotal = 0;
                difficultyInputs.forEach(inputGroup => {
                    const otherInput = inputGroup.querySelector('input[type="number"]');
                    if (otherInput && otherInput.value) {
                        currentTotal += parseInt(otherInput.value) || 0;
                    }
                });
                
                if (currentTotal >= maxKeys) {
                    alert(`Limite atteinte : maximum ${maxKeys} clé(s) par semaine pour ${bossType === 'chimere' ? 'la Chimère' : 'l\'Hydre'}`);
                    return;
                }
            }
            
            input.value = currentValue + 1;
            this.updateKeysTotal(bossType, maxKeys, difficultyInputs);
        };

        // Assembler les éléments
        counterContainer.appendChild(minusBtn);
        counterContainer.appendChild(input);
        counterContainer.appendChild(plusBtn);

        // Bouton pour supprimer cette difficulté
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-danger btn-small';
        removeBtn.textContent = '× Supprimer';
        removeBtn.onclick = () => {
            div.remove();
            const index = difficultyInputs.indexOf(div);
            if (index > -1) {
                difficultyInputs.splice(index, 1);
            }
            this.updateKeysTotal(bossType, maxKeys, difficultyInputs);
        };

        div.appendChild(select);
        div.appendChild(counterContainer);
        div.appendChild(document.createTextNode(' clé(s)'));
        div.appendChild(removeBtn);

        return div;
    },

    // Mettre à jour l'affichage du total de clés
    updateKeysTotal(bossType, maxKeys, difficultyInputs) {
        const totalDisplay = document.getElementById('keys-total-display');
        if (!totalDisplay) return;

        let total = 0;
        difficultyInputs.forEach(inputGroup => {
            const input = inputGroup.querySelector('input[type="number"]');
            if (input && input.value) {
                total += parseInt(input.value) || 0;
            }
        });

        if (maxKeys) {
            const bossName = bossType === 'chimere' ? 'Chimère' : 'Hydre';
            const color = total > maxKeys ? '#dc3545' : (total === maxKeys ? '#28a745' : '#667eea');
            totalDisplay.innerHTML = `Total : <span style="color: ${color};">${total} / ${maxKeys}</span> clé(s) ${bossType === 'chimere' || bossType === 'hydre' ? 'par semaine' : ''}`;
            
            if (total > maxKeys) {
                totalDisplay.style.background = '#ffe6e6';
                totalDisplay.style.color = '#dc3545';
            } else {
                totalDisplay.style.background = '#f8f9fa';
                totalDisplay.style.color = '#333';
            }
        } else {
            totalDisplay.innerHTML = `Total : ${total} clé(s)`;
            totalDisplay.style.background = '#f8f9fa';
            totalDisplay.style.color = '#333';
        }
    },

    // Sauvegarder les clés
    saveKeys(memberId, bossType, period, difficultyInputs, maxKeys) {
        const details = [];
        let totalUsed = 0;

        difficultyInputs.forEach(inputGroup => {
            const select = inputGroup.querySelector('select');
            const input = inputGroup.querySelector('input[type="number"]');
            
            if (select && input && select.value && input.value) {
                const difficulte = select.value;
                const nombre = parseInt(input.value);
                totalUsed += nombre;
                
                // Vérifier si cette difficulté existe déjà
                const existing = details.find(d => d.difficulte === difficulte);
                if (existing) {
                    existing.nombre += nombre;
                } else {
                    details.push({ difficulte, nombre });
                }
            }
        });

        // Vérifier la limite uniquement pour Chimère et Hydre (pas pour Boss de Clan)
        if (maxKeys && totalUsed > maxKeys) {
            const bossName = bossType === 'chimere' ? 'Chimère' : 'Hydre';
            alert(`Erreur : Vous ne pouvez pas enregistrer plus de ${maxKeys} clé(s) par semaine pour ${bossName}. Total actuel : ${totalUsed}`);
            return false;
        }

        const data = {
            used: totalUsed,
            details: details
        };

        if (bossType === 'boss-clan') {
            const keys = DataManager.getBossClanKeysForDate(period);
            keys[memberId] = data;
            DataManager.saveBossClanKeysForDate(period, keys);
        } else if (bossType === 'chimere') {
            const keys = DataManager.getChimereKeysForWeek(period);
            keys[memberId] = data;
            DataManager.saveChimereKeysForWeek(period, keys);
        } else if (bossType === 'hydre') {
            const keys = DataManager.getHydreKeysForWeek(period);
            keys[memberId] = data;
            DataManager.saveHydreKeysForWeek(period, keys);
        }

        return true;
    },

    // Mettre à jour tous les onglets
    updateAllTabs() {
        const bossClanDate = document.getElementById('boss-clan-date').value;
        const chimereWeek = document.getElementById('chimere-week').value;
        const hydreWeek = document.getElementById('hydre-week').value;

        if (bossClanDate) this.renderBossClanTracking(bossClanDate);
        if (chimereWeek) this.renderChimereTracking(chimereWeek);
        if (hydreWeek) this.renderHydreTracking(hydreWeek);
    },

    // Échapper le HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Ajouter rapidement des clés depuis la carte
    quickAddKeys(memberId, bossType, period) {
        const select = document.querySelector(`.quick-difficulty-select[data-member-id="${memberId}"][data-boss-type="${bossType}"]`);
        const input = document.querySelector(`.quick-count-input[data-member-id="${memberId}"][data-boss-type="${bossType}"]`);
        
        if (!select || !input) return;
        
        const difficulty = select.value;
        const count = parseInt(input.value) || 1;
        
        if (!difficulty) {
            alert('Veuillez sélectionner une difficulté');
            return;
        }
        
        // Vérifier les limites pour Chimère et Hydre
        const maxKeys = bossType === 'chimere' ? 2 : (bossType === 'hydre' ? 3 : null);
        
        // Charger les données existantes
        let keys = {};
        if (bossType === 'boss-clan') {
            keys = DataManager.getBossClanKeysForDate(period);
        } else if (bossType === 'chimere') {
            keys = DataManager.getChimereKeysForWeek(period);
        } else if (bossType === 'hydre') {
            keys = DataManager.getHydreKeysForWeek(period);
        }
        
        const memberKeys = keys[memberId] || { used: 0, details: [] };
        
        // Vérifier la limite totale
        if (maxKeys && (memberKeys.used + count) > maxKeys) {
            alert(`Limite atteinte : maximum ${maxKeys} clé(s) par semaine pour ${bossType === 'chimere' ? 'la Chimère' : 'l\'Hydre'}`);
            return;
        }
        
        // Ajouter ou mettre à jour la difficulté
        const existing = memberKeys.details.find(d => d.difficulte === difficulty);
        if (existing) {
            existing.nombre += count;
        } else {
            memberKeys.details.push({ difficulte: difficulty, nombre: count });
        }
        
        memberKeys.used += count;
        
        // Sauvegarder
        if (bossType === 'boss-clan') {
            keys[memberId] = memberKeys;
            DataManager.saveBossClanKeysForDate(period, keys);
        } else if (bossType === 'chimere') {
            keys[memberId] = memberKeys;
            DataManager.saveChimereKeysForWeek(period, keys);
        } else if (bossType === 'hydre') {
            keys[memberId] = memberKeys;
            DataManager.saveHydreKeysForWeek(period, keys);
        }
        
        // Réinitialiser les champs
        select.value = '';
        input.value = 1;
        
        // Rafraîchir l'affichage
        this.updateAllTabs();
    },

    // Ajuster rapidement le nombre de clés (boutons + et -)
    quickAdjustKeys(memberId, bossType, period, delta) {
        const input = document.querySelector(`.quick-count-input[data-member-id="${memberId}"][data-boss-type="${bossType}"]`);
        if (!input) return;
        
        const maxKeys = bossType === 'chimere' ? 2 : (bossType === 'hydre' ? 3 : null);
        const currentValue = parseInt(input.value) || 1;
        let newValue = Math.max(1, currentValue + delta);
        
        // Respecter la limite max si elle existe
        if (maxKeys) {
            newValue = Math.min(newValue, maxKeys);
        }
        
        input.value = newValue;
    },

    // Supprimer une difficulté depuis la carte
    removeDifficultyFromCard(memberId, bossType, period, difficulty, index) {
        if (!confirm(`Supprimer ${difficulty} ?`)) return;
        
        // Charger les données existantes
        let keys = {};
        if (bossType === 'boss-clan') {
            keys = DataManager.getBossClanKeysForDate(period);
        } else if (bossType === 'chimere') {
            keys = DataManager.getChimereKeysForWeek(period);
        } else if (bossType === 'hydre') {
            keys = DataManager.getHydreKeysForWeek(period);
        }
        
        const memberKeys = keys[memberId] || { used: 0, details: [] };
        
        // Trouver et supprimer la difficulté
        const detailIndex = memberKeys.details.findIndex(d => d.difficulte === difficulty);
        if (detailIndex !== -1) {
            const removedCount = memberKeys.details[detailIndex].nombre;
            memberKeys.details.splice(detailIndex, 1);
            memberKeys.used = Math.max(0, memberKeys.used - removedCount);
        }
        
        // Si plus de détails, réinitialiser
        if (memberKeys.details.length === 0) {
            memberKeys.used = 0;
        }
        
        // Sauvegarder
        if (bossType === 'boss-clan') {
            keys[memberId] = memberKeys;
            DataManager.saveBossClanKeysForDate(period, keys);
        } else if (bossType === 'chimere') {
            keys[memberId] = memberKeys;
            DataManager.saveChimereKeysForWeek(period, keys);
        } else if (bossType === 'hydre') {
            keys[memberId] = memberKeys;
            DataManager.saveHydreKeysForWeek(period, keys);
        }
        
        // Rafraîchir l'affichage
        this.updateAllTabs();
    }
};

