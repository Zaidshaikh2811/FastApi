
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json to leverage Docker cache
COPY App.jsx ./src/App.jsx
# In a real project, you would copy your entire frontend source
# For this example, we'll assume App.jsx is the main component.
# You would also need to copy package.json, tailwind.config.js etc.
# COPY package*.json ./
# COPY tailwind.config.js ./
# COPY postcss.config.js ./
# COPY public ./public
# COPY src ./src

# Create a minimal package.json to install dependencies
RUN echo '{ \
  "name": "react-frontend", \
  "version": "0.1.0", \
  "private": true, \
  "dependencies": { \
    "react": "^18.2.0", \
    "react-dom": "^18.2.0" \
  }, \
  "devDependencies": { \
    "@types/react": "^18.2.15", \
    "@types/react-dom": "^18.2.7", \
    "@vitejs/plugin-react": "^4.0.3", \
    "vite": "^4.4.5", \
    "tailwindcss": "^3.3.3", \
    "autoprefixer": "^10.4.16", \
    "postcss": "^8.4.31" \
  }, \
  "scripts": { \
    "dev": "vite", \
    "build": "vite build", \
    "preview": "vite preview" \
  } \
}' > package.json

# Install dependencies - you would run 'npm install' in a real project
# For this example, we are skipping this step as we don't have all files.
# In a real scenario, uncomment the line below.
# RUN npm install

# In a real project, you'd build your app. We'll simulate a build folder.
RUN mkdir -p build && echo "<html><body>React App</body></html>" > build/index.html


# Stage 2: Build the Python backend
# Use a Python image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY ./backend/requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code into the container
COPY ./backend/main.py .

# Copy the built frontend static files from the 'builder' stage
# This is the key step that combines the frontend and backend.
COPY --from=builder /app/frontend/build ./static

# Expose the port the app runs on
EXPOSE 8000

# Command to run the Uvicorn server
# This will start the FastAPI backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
