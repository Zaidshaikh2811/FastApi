# FastApi Product Dashboard

A full-stack product dashboard combining a React frontend and a FastAPI backend, packaged and ready for deployment via Docker. 

## Features

- **FastAPI backend** built with clean, efficient Python.
- **React frontend** for dynamic and responsive UI.
- All-in-one **Docker setup** for seamless development and deployment.

## Repository Structure

FastApi/
├── frontend/ # React application code
├── main.py # FastAPI application entry point
├── models.py # FastAPI data models (schemas)
├── Dockerfile # Docker configuration for building the full stack
├── .gitignore # Files and directories to ignore in Git
└── README.md # Project documentation

*Note:* For a functional Docker build, your React app should reside in the `frontend` directory (contains `App.jsx`, `src`, `public`, `package.json`, etc.).

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) installed and running on your machine.
- (Optional) Node.js and npm installed for development before Docker usage.

### Build & Run Locally with Docker

1. Clone the repository:
    ```bash
    git clone https://github.com/Zaidshaikh2811/FastApi.git
    cd FastApi
    ```
2. Build the Docker image:
    ```bash
    docker build -t product-dashboard .
    ```
3. Run the Docker container:
    ```bash
    docker run -p 8000:8000 product-dashboard
    ```
4. Visit in your browser:  
   **Frontend + Backend:** [http://localhost:8000](http://localhost:8000)

### Development Workflow (Optional)

If you'd like to work without Docker during development:

1. Navigate into the `frontend/` folder:
    ```bash
    cd frontend
    npm install
    npm start
    ```
2. In another terminal, run the backend:
    ```bash
    uvicorn main:app --reload
    ```
3. Access the frontend (usually on port 3000) and backend on port 8000.

## Deployment Options

You can deploy the Dockerized app using these free-tier hosting providers:

| Platform         | Advantages                    | Setup Overview                              |
|------------------|-------------------------------|---------------------------------------------|
| **Render**       | User-friendly, automatic Docker builds | Connect repo → Deploy via Dockerfile         |
| **Fly.io**       | Always free servers close to users     | `fly launch` auto-detects Dockerfile        |
| **Google Cloud Run** | Scalable with generous free tier    | Push to Artifact Registry → Deploy to Cloud Run |

### General Deployment Steps

1. Push your project to GitHub.
2. Choose a provider and connect your GitHub repo.
3. Point their setup to use your `Dockerfile`.
4. Deploy — the platform builds and serves your app.

## Contributing

Contributions are welcome! 

1. Fork the repository.
2. Create a branch: `git checkout -b feature-desc`
3. Commit your changes.
4. Submit a pull request with a concise description.

