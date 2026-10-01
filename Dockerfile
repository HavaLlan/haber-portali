FROM node:24-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./

# npm install-scripts onay ve güvenlik uyarılarını geç
RUN npm install --legacy-peer-deps \
    && npm install-scripts approve @prisma/client \
    && npm install-scripts approve prisma \
    && npm install-scripts approve @prisma/engines \
    || npm install --legacy-peer-deps --ignore-scripts \
    && npx prisma generate

COPY prisma ./prisma/
RUN npx prisma db push

COPY . .

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]