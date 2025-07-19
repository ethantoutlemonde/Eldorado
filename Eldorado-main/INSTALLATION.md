# 🎰 Eldorado – Casino Décentralisé

## 📦 Prérequis

- [PHP 8.x](https://www.php.net/)
- [Composer](https://getcomposer.org/)
- [Node.js 16+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/) ou [SQLite](https://www.sqlite.org/) pour la base de données

---

## ⚙️ Backend – API Laravel

### Installation

```bash
# Se placer dans le dossier de l'API
cd api

# Installer les dépendances PHP
composer install

# Lancer les migrations
php artisan migrate

# Démarrer le serveur local
php artisan serve

```


💻 Frontend – Eldorado & Interface Admin (Next.js)
Installation
```bash

# Se placer dans le dossier du front ou de l’admin
cd front      # ou cd admin-dashboard

# Installer les dépendances avec legacy peer deps
npm install --legacy-peer-deps

# Démarrer le serveur de développement
npm run dev
```