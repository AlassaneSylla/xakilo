# Étape 1 : Build du frontend avec Node
# utilisation de l'image officielle Node.js basée sur Alpine Linux pour une image légère
# on donne le nom "build" à cette étape pour pouvoir y faire référence plus tard
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
# installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste des fichiers de l'application
# et construire l'application pour la production
COPY . .
RUN npm run build

# Étape 2 : Servir avec Nginx
FROM nginx:alpine

# Copier les fichiers construits depuis l'étape de build vers le répertoire par défaut de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80 pour le trafic HTTP
EXPOSE 80

# Démarrer Nginx en mode non-démon
CMD ["nginx", "-g", "daemon off;"]
