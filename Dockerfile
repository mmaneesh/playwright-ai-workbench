FROM mcr.microsoft.com/playwright:v1.63.0-noble
WORKDIR /workbench
COPY package.json package-lock.json ./
RUN HUSKY=0 npm ci
COPY . .
ENV CI=true
CMD ["npm", "test"]

