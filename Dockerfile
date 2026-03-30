# =============================================
# СМЛ ФАСАД — Dockerfile
# Статический сайт на Nginx (Alpine)
# =============================================

FROM nginx:stable-alpine

# Удаляем дефолтный конфиг
RUN rm /etc/nginx/conf.d/default.conf

# Копируем наш конфиг
COPY nginx.conf /etc/nginx/conf.d/sml-fasad.conf

# Копируем статику сайта
COPY index.html  /usr/share/nginx/html/index.html
COPY styles.css  /usr/share/nginx/html/styles.css
COPY script.js   /usr/share/nginx/html/script.js

# Если есть папка с изображениями — раскомментируйте:
# COPY images/ /usr/share/nginx/html/images/

# Nginx слушает порт 80
EXPOSE 80

# Запуск в foreground-режиме
CMD ["nginx", "-g", "daemon off;"]
