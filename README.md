# Event-Sync: Event Management System (Microservices Architecture)

Event-Sync is a modern, scalable **Event Management System** built using a Microservices Architecture. The backend is powered by Node.js/Express, MongoDB, and Kafka for event-driven async communication, while the frontend is built with React (Vite). All services are containerized using Docker, smoothly integrated with an automated GitOps CI/CD pipeline using GitHub Actions, Kubernetes, and ArgoCD.

---

## 🏛️ Project Architecture & Services

The application relies on 4 core business microservices and 1 API Gateway, routing external traffic appropriately.

- **API Gateway** (`/api-gateway`): Routes requests, handles authentication (JWT), and encapsulates individual microservices.
- **User Service** (`/services/user-service`): Manages user authentication, registration, profiles, and handles role-based authorization.
- **Event Service** (`/services/event-service`): Handles the core logic related to creating, updating, and viewing events.
- **Registration Service** (`/services/registration-service`): Manages event registrations, generating tickets, and ensuring capacity limits are not breached.
- **Notification Service** (`/services/notification-service`): Listens to Kafka topics to trigger and send out email notifications to users (SMTP).
- **Frontend** (`/frontend`): The React/Vite-based modern UI allowing end-users to interact with the system.

## 📂 Required Documents & Artifacts

As requested, all key elements of the microservice project are structured as follows within this repository:

### 1. Code Repository
All the source code for the microservices, gateway, and frontend resides consistently structured in this single repository:
*   **Microservices Path**: All backend service code sits under the [`/services`](./services/) directory.
*   **API Gateway Path**: Resides locally in the [`/api-gateway`](./api-gateway/) directory.
*   **Frontend UI Path**: Available in the [`/frontend`](./frontend/) directory.

### 2. API Contract (OpenAPI/Swagger)
The overarching API specifications and endpoints are comprehensively documented using OpenAPI.
*   **Swagger File**: Located at the root of the project: [`swagger.yaml`](./swagger.yaml)
*   **Documentation Features**: Describes all endpoints for external clients, expected payloads, authentications, and response schema definitions.

### 3. CI/CD Pipeline Configuration
We use **GitHub Actions** for our Continuous Integration and Delivery (CI/CD) workflows.
*   **Pipeline File**: Available in the native GitHub actions directory: [`/.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
*   **Features**: Includes automated builds, testing (if added), and pushing of image artifacts to a container registry upon code changes.

### 4. Container & Orchestration Configuration
The project is completely Dockerized and designed to run on Kubernetes (K8s) following GitOps principles with ArgoCD.
*   **Dockerfiles**: Each individual microservice, the frontend, and the API Gateway contains its own `Dockerfile` situated in its respective root directory (e.g., `/services/user-service/Dockerfile`).
*   **Docker Compose**: A full multi-container setup is available for local development usage testing at [`docker-compose.yml`](./docker-compose.yml).
*   **Kubernetes Manifests**: K8s deployment structures, services, stateful components and configs sit in the [`/k8s`](./k8s/) directory.
*   **ArgoCD Configurations**: GitOps continuous deployment syncing parameters live within the [`/argocd`](./argocd/) directory.

---

## 🚀 Getting Started Locally

### Prerequisites
*   [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

### Run with Docker Compose
1. Ensure the required `.env` variables are correctly configured in your root `.env` file (Database URIs, JWT secrets, SMTP configs).
2. Spin up the cluster locally including Kafka, front-end, and all microservices.
   ```bash
   docker-compose up --build
   ```
3.  **Frontend URL**: `http://localhost:5173`
4.  **API Gateway URL**: `http://localhost:3000`

## 🛠 Tech Stack Details
*   **Backend Runtime Env**: Node.js / Express
*   **Databases**: MongoDB (Per microservice data encapsulation)
*   **Message Broker**: Apache Kafka (KRaft Mode)
*   **Frontend**: React (Vite, TailwindCSS)
*   **Containerization**: Docker
*   **Orchestration**: Kubernetes & ArgoCD (GitOps)
*   **CI/CD**: GitHub Actions
