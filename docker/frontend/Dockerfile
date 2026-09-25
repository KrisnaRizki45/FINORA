FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci 2>/dev/null || npm install

# Copy application code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
