/**
 * Gestion de l'interface des membres
 */

const MembersManager = {
    // Afficher la liste des membres
    renderMembers() {
        const members = DataManager.getMembers();
        const container = document.getElementById('members-list');
        
        if (members.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Aucun membre pour le moment. Cliquez sur "Ajouter un membre" pour commencer.</p>';
            return;
        }

        container.innerHTML = members.map(member => `
            <div class="member-card">
                <div class="member-name">${this.escapeHtml(member.name)}</div>
                <div class="member-actions">
                    <button class="btn btn-secondary btn-small" onclick="MembersManager.editMember('${member.id}')">Modifier</button>
                    <button class="btn btn-danger btn-small" onclick="MembersManager.removeMember('${member.id}')">Supprimer</button>
                </div>
            </div>
        `).join('');
    },

    // Ajouter un nouveau membre
    addMember() {
        const modal = document.getElementById('member-modal');
        const form = document.getElementById('member-form');
        const title = document.getElementById('modal-title');
        const memberIdInput = document.getElementById('member-id');
        const memberNameInput = document.getElementById('member-name');

        // Réinitialiser le formulaire
        title.textContent = 'Ajouter un membre';
        memberIdInput.value = '';
        memberNameInput.value = '';
        
        modal.classList.add('active');

        // Gérer la soumission du formulaire
        form.onsubmit = (e) => {
            e.preventDefault();
            const name = memberNameInput.value.trim();
            
            if (!name) {
                alert('Veuillez entrer un nom de membre');
                return;
            }

            if (memberIdInput.value) {
                // Modification
                this.updateMember(memberIdInput.value, name);
            } else {
                // Ajout
                DataManager.addMember(name);
            }

            this.renderMembers();
            modal.classList.remove('active');
        };
    },

    // Modifier un membre
    editMember(id) {
        const members = DataManager.getMembers();
        const member = members.find(m => m.id === id);
        
        if (!member) return;

        const modal = document.getElementById('member-modal');
        const form = document.getElementById('member-form');
        const title = document.getElementById('modal-title');
        const memberIdInput = document.getElementById('member-id');
        const memberNameInput = document.getElementById('member-name');

        title.textContent = 'Modifier un membre';
        memberIdInput.value = member.id;
        memberNameInput.value = member.name;
        
        modal.classList.add('active');

        form.onsubmit = (e) => {
            e.preventDefault();
            const name = memberNameInput.value.trim();
            
            if (!name) {
                alert('Veuillez entrer un nom de membre');
                return;
            }

            this.updateMember(id, name);
            this.renderMembers();
            modal.classList.remove('active');
        };
    },

    // Mettre à jour un membre
    updateMember(id, name) {
        const members = DataManager.getMembers();
        const member = members.find(m => m.id === id);
        if (member) {
            member.name = name;
            DataManager.saveMembers(members);
        }
    },

    // Supprimer un membre
    removeMember(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
            DataManager.removeMember(id);
            this.renderMembers();
            // Mettre à jour les autres onglets si nécessaire
            if (typeof KeysManager !== 'undefined') {
                KeysManager.updateAllTabs();
            }
        }
    },

    // Échapper le HTML pour éviter les injections
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

