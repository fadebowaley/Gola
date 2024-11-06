# Use the official Node.js image as a base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
# COPY package*.json ./
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Install nodemon for hot reloading
RUN npm install -g nodemon

# Copy the rest of your application files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app with nodemon
CMD ["nodemon", "app.js"]
