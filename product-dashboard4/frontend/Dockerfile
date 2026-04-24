# Etap 1 kopiowanie plikow statycznych
FROM alpine:3.20 AS builder
WORKDIR /build
COPY static/ /build/

# Etap 2 produkcja
FROM nginx:alpine

ARG NGINX_VERSION
LABEL version=$NGINX_VERSION

RUN mkdir -p /var/cache/nginx/stats_cache

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]