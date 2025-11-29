# Gestionnaire de Clan - Raid Shadow Legends

Application web simple pour gérer les membres d'un clan et suivre l'utilisation des clés pour les différents boss.

## 🎯 Fonctionnalités

### 1. Gestion des Membres
- Ajouter des membres (jusqu'à ~30 membres)
- Modifier le nom d'un membre
- Supprimer un membre

### 2. Suivi des Clés

#### Boss de Clan Classique (Quotidien)
- Suivi quotidien des clés utilisées
- Nombre de clés par jour configurable (par défaut : 2)
- Suivi par difficulté (Facile, Normal, Difficile, Brutal, Cauchemar, Ultra-Cauchemar)
- Statut : Non utilisé / Partiellement utilisé / Utilisé

#### Chimère (Hebdomadaire)
- Suivi hebdomadaire des clés (2 clés par semaine)
- Suivi par difficulté
- Statut : Non utilisé / Partiellement utilisé / Utilisé

#### Hydre (Hebdomadaire)
- Suivi hebdomadaire des clés (3 clés par semaine)
- Suivi par difficulté
- Statut : Non utilisé / Partiellement utilisé / Utilisé

### 3. Résumé
- Vue d'ensemble de l'utilisation des clés
- Filtrage par type de boss
- Filtrage par statut d'utilisation
- Liste des membres non utilisés ou partiellement utilisés

## 📁 Structure du Projet

```
rsl-UnionTeam/
├── index.html          # Page principale
├── css/
│   └── style.css      # Styles de l'application
├── js/
│   ├── app.js         # Application principale (initialisation, événements)
│   ├── data.js        # Gestion du stockage des données (localStorage)
│   ├── members.js      # Gestion de l'interface des membres
│   └── keys.js        # Gestion du suivi des clés
├── rules.txt          # Instructions du projet
└── README.md          # Ce fichier
```

## 🚀 Installation et Utilisation

### Installation locale

1. Téléchargez ou clonez le projet
2. Ouvrez `index.html` dans votre navigateur web
3. C'est tout ! L'application fonctionne entièrement côté client

### Hébergement sur Hostinger

1. Connectez-vous à votre espace Hostinger
2. Accédez au gestionnaire de fichiers (File Manager)
3. Uploadez tous les fichiers du projet dans le dossier `public_html` (ou le dossier racine de votre domaine)
4. Assurez-vous que `index.html` est à la racine
5. Accédez à votre site via votre domaine

## 💾 Stockage des Données

Les données sont stockées localement dans le navigateur via `localStorage`. Cela signifie que :
- Les données sont conservées même après fermeture du navigateur
- Chaque utilisateur a ses propres données
- Pour partager les données entre plusieurs utilisateurs, il faudrait implémenter un système de sauvegarde/restauration

### Structure des Données

Les données sont stockées au format JSON avec les clés suivantes :
- `rsl_clan_members` : Liste des membres
- `rsl_boss_clan_keys` : Clés du boss de clan (par date)
- `rsl_chimere_keys` : Clés de la Chimère (par semaine)
- `rsl_hydre_keys` : Clés de l'Hydre (par semaine)
- `rsl_settings` : Paramètres de l'application

## 📝 Format de Données

Les données suivent le format JSON standardisé :

```json
{
  "joueur": "PseudoDuJoueur",
  "periode": {
    "type": "jour",
    "date_debut": "2025-11-24",
    "date_fin": "2025-11-30"
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

## 🔧 Personnalisation

### Modifier le nombre de clés par jour pour le Boss de Clan

Dans `js/data.js`, la valeur par défaut est définie dans la fonction `init()` :
```javascript
bossClanKeysPerDay: 2  // Modifiez cette valeur
```

## 🎨 Technologies Utilisées

- HTML5
- CSS3 (avec animations et design moderne)
- JavaScript (ES6+)
- localStorage pour la persistance des données

## 📱 Compatibilité

L'application est compatible avec tous les navigateurs modernes :
- Chrome
- Firefox
- Safari
- Edge

## 🔮 Fonctionnalités Futures

- Upload et reconnaissance automatique des captures d'écran
- Export/Import des données (sauvegarde)
- Statistiques avancées
- Notifications pour les membres non actifs

## 📄 Licence

Ce projet est créé pour un usage personnel/gestion de clan.

