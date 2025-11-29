# 🏰 Gestionnaire de Clan RSL - UnionTeam Boss Counter

Application web moderne pour gérer les membres d'un clan Raid Shadow Legends et suivre l'utilisation des clés pour les différents boss.

## 🎯 Fonctionnalités Principales

### 1. Gestion des Membres
- ✅ Ajouter, modifier et supprimer des membres (jusqu'à ~30 membres)
- ✅ Interface moderne avec cartes visuelles
- ✅ Recherche rapide avec autocomplete

### 2. Suivi des Clés

#### ⚔️ Boss de Clan Classique (Quotidien)
- Suivi quotidien des clés utilisées
- Pas de limite (1 clé toutes les 6h = 4 recommandées par jour)
- Suivi par difficulté (Facile, Normal, Difficile, Brutal, Cauchemar, Ultra-Cauchemar)
- Système d'alertes visuelles simplifié :
  - 🔴 **Rouge** : 0 clé
  - 🟠 **Orange** : 1-2 clés
  - 🟢 **Vert** : 3+ clés

#### 🐉 Chimère (Hebdomadaire)
- Suivi hebdomadaire des clés (2 clés par semaine maximum)
- Suivi par difficulté
- Statut : Non utilisé / Partiellement utilisé / Utilisé

#### 🐍 Hydre (Hebdomadaire)
- Suivi hebdomadaire des clés (3 clés par semaine maximum)
- Suivi par difficulté
- Statut : Non utilisé / Partiellement utilisé / Utilisé

### 3. Outils de Productivité

#### ⚡ Saisie Rapide
- Modal avec tous les joueurs en liste
- Saisie groupée pour gagner du temps
- Affichage des résultats après enregistrement

#### 🔍 Recherche Intelligente
- Barre de recherche avec autocomplete
- Navigation au clavier (flèches + Entrée)
- Ouverture directe du modal d'édition

#### 📸 Upload Screenshots
- Interface prête pour la reconnaissance automatique
- Glisser-déposer multiple fichiers
- Prévisualisation des images

### 4. Statistiques et Vues

#### 📊 Statistiques en Temps Réel
- Panneau de statistiques avec indicateurs colorés
- Vue d'ensemble instantanée de l'état du clan
- Filtres par statut d'alerte

#### 📅 Statistiques Mensuelles
- Vue mensuelle avec tableau récapitulatif
- Total de clés utilisées par membre et par boss
- Tri automatique par performance

#### 📋 Résumé
- Vue d'ensemble avec filtres
- Liste des membres non utilisés ou partiellement utilisés
- Export des données structurées

## 🚀 Installation et Utilisation

### Installation Locale

1. Clonez le repository :
```bash
git clone https://github.com/Rogue06/UnionTeam-BossCounter.git
cd UnionTeam-BossCounter
```

2. Ouvrez `index.html` dans votre navigateur web

3. C'est tout ! L'application fonctionne entièrement côté client

### Hébergement sur Hostinger

1. Connectez-vous à votre espace Hostinger
2. Accédez au gestionnaire de fichiers (File Manager)
3. Uploadez tous les fichiers du projet dans le dossier `public_html`
4. Assurez-vous que `index.html` est à la racine
5. Accédez à votre site via votre domaine

## 📁 Structure du Projet

```
UnionTeam-BossCounter/
├── index.html          # Page principale
├── css/
│   └── style.css      # Styles modernes avec animations
├── js/
│   ├── app.js         # Application principale
│   ├── data.js        # Gestion du stockage (localStorage)
│   ├── keys.js        # Gestion du suivi des clés
│   └── members.js     # Gestion des membres
├── README.md          # Documentation
├── rules.txt          # Instructions du projet
└── .gitignore         # Fichiers ignorés par Git
```

## 💾 Stockage des Données

Les données sont stockées localement dans le navigateur via `localStorage`. Cela signifie que :
- ✅ Les données sont conservées même après fermeture du navigateur
- ✅ Chaque utilisateur a ses propres données
- ⚠️ Pour partager les données entre plusieurs utilisateurs, il faudrait implémenter un système de sauvegarde/restauration

### Structure des Données

Les données sont stockées au format JSON avec les clés suivantes :
- `rsl_clan_members` : Liste des membres
- `rsl_boss_clan_keys` : Clés du boss de clan (par date)
- `rsl_chimere_keys` : Clés de la Chimère (par semaine)
- `rsl_hydre_keys` : Clés de l'Hydre (par semaine)
- `rsl_settings` : Paramètres de l'application

## 🎨 Technologies Utilisées

- **HTML5** : Structure moderne et sémantique
- **CSS3** : Design moderne avec animations et dégradés
- **JavaScript (ES6+)** : Logique applicative
- **localStorage** : Persistance des données côté client

## 📱 Compatibilité

L'application est compatible avec tous les navigateurs modernes :
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🔮 Fonctionnalités Futures

- [ ] Reconnaissance automatique des captures d'écran (OCR)
- [ ] Export/Import des données (sauvegarde)
- [ ] Statistiques avancées et graphiques
- [ ] Notifications pour les membres non actifs
- [ ] Mode sombre
- [ ] Synchronisation cloud (optionnelle)

## 📝 Format de Données

Les données suivent le format JSON standardisé :

```json
{
  "joueur": "PseudoDuJoueur",
  "periode": {
    "type": "jour",
    "date_debut": "2025-01-24",
    "date_fin": "2025-01-30"
  },
  "boss": "Hydre",
  "cles_max": 3,
  "cles_utilisees": 2,
  "detail_cles": [
    { "difficulte": "Brutal", "nombre": 1 },
    { "difficulte": "Cauchemar", "nombre": 1 }
  ],
  "statut_utilisation": "partiellement utilisé"
}
```

## 🤝 Contribution

Ce projet est créé pour un usage personnel/gestion de clan. Les contributions sont les bienvenues !

## 📄 Licence

Ce projet est sous licence libre pour usage personnel.

## 👤 Auteur

**Rogue06**
- GitHub: [@Rogue06](https://github.com/Rogue06)
- Repository: [UnionTeam-BossCounter](https://github.com/Rogue06/UnionTeam-BossCounter)

---

⭐ Si ce projet vous est utile, n'hésitez pas à lui donner une étoile sur GitHub !
