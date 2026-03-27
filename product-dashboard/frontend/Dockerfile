FROM alpine:3.20 AS builder
WORKDIR /build
COPY static/ /build/

FROM nginx:1.27-alpine
RUN mkdir -p /var/cache/nginx/stats_cache
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]