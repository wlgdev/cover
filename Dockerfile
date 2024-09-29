FROM nginx:1.27.1 AS base

EXPOSE 8282

COPY ./shared/nginx/*.conf /etc/nginx/conf.d/
COPY ./shared/nginx/page/*.html /usr/share/nginx/
