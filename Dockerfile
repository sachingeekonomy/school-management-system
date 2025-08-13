# Use Node.js as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Disable ESLint during build
ENV NEXT_DISABLE_ESLINT=true

# Set a dummy DATABASE_URL for build time to prevent connection errors
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Build the Next.js application
RUN npm run build

# Copy standalone server files
RUN cp -r .next/standalone ./
RUN cp -r .next/static ./.next/standalone/.next/
RUN cp -r public ./.next/standalone/

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application using standalone server
CMD ["node", ".next/standalone/server.js"]
