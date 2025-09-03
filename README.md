# 📚 Projet EDT — Gestion des cours & notes (Angular)

## 🌍 Lien de production
- **URL** : https://edt-cours-8q7zvdwnh-lucas-projects-12caa5a1.vercel.app  
  Accessible publiquement (sans login Vercel).

---

## 🎯 Contexte
Application Angular pour gérer des **cours**, des **étudiants** et leurs **notes**.  
Deux profils :
- **Admin** : crée/édite/supprime les ressources, réorganise les cours.
- **Utilisateur** : consulte ses cours et ses notes.

---

## 🔑 Comptes de test
**Administrateur**
- Email : `admin@test.com`
- Mot de passe : `123456`

**Utilisateur**
- Email : `user@test.com`
- Mot de passe : `123456`

> ⚠️ Ces identifiants sont de test. Ne pas y stocker de données sensibles.

---

## 🗺️ Pages (aperçu rapide)
### Commun
- **Login / Register** : accès à l’application.
- **404** : page introuvable.

### Espace Admin
- **Cours** : liste + création/édition/suppression, réorganisation (drag & drop).
- **Étudiants** : liste + création/édition/suppression.
- **Notes** : attribution, édition et suppression des notes, aperçu global.

### Espace Utilisateur
- **Cours** : affiche uniquement les cours de l’utilisateur.
- **Notes** : notes personnelles, formats lisibles (moyennes/notations).

---

## 🚀 Déploiement & mises à jour (Vercel)

### Déploiement continu via Git (recommandé)
1. Modifie le code.
2. Commit & push sur la branche de prod (ex. `main`) :
   ```bash
   git add .
   git commit -m "Mise à jour"
   git push origin main
3. Vercel reconstruit et déploie automatiquement.
Le lien de prod est mis à jour :
https://edt-cours-8q7zvdwnh-lucas-projects-12caa5a1.vercel.



### Déploiement manuel via CLI

Installer la CLI :
```bash
npm i -g vercel
```

Se connecter :
```bash
vercel login
```

Déployer en production :
```bash
vercel --prod
```
