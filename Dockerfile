# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files into the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your application files into the container
COPY . .

# Expose the port your application will listen on
EXPOSE 3000

# Define the command to start your Node.js application
CMD ["npm", "start"]
