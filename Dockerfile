FROM nginx:1.27.1 AS base

COPY ./shared/nginx/*.conf /etc/nginx/conf.d/
COPY ./shared/nginx/page/*.html /usr/share/nginx/
