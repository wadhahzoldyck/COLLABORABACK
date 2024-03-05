FROM node:alpine-20

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including 'devDependencies' since 'vite' is a devDependency
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD ["npm", "run", "start:prod"]
