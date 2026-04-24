FROM node:20-alpine

ARG IMAGE_VERSION
LABEL version=$IMAGE_VERSION

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

COPY package.json package-lock.json ./
# npm ci -  usuwa istniejący node_modules i instaluje wszystko od zera, instaluje pakiety dokładnie według package-lock.json
# nie instalowane devDependencies z package json--omit=dev
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

#uruchamianie procesu jako użytkownik nieprivilegiowany
USER node

EXPOSE 3000

CMD ["npm", "start"]