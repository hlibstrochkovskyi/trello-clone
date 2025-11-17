<div align="center">
  <h1>Full-Stack Trello Clone</h1>
  <p>
    A complete Trello clone built from scratch with Spring Boot (Java 17), React, and PostgreSQL.
  </p>
  
  <p>
    <img alt="Java" src="https://img.shields.io/badge/Java-17-blue?logo=openjdk&logoColor=white">
    <img alt="Spring Boot" src="https://img.shields.io/badge/Spring%20Boot-3.1.5-brightgreen?logo=spring&logoColor=white">
    <img alt="React" src="https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white">
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql&logoColor=white">
    <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-blue?logo=docker&logoColor=white">
  </p>
</div>

<hr>



## 1. Introduction

This repository contains a full-stack, production-ready clone of Trello. The project was built as a personal portfolio piece to demonstrate a deep understanding of modern backend (Java/Spring) and frontend (React) architecture, including robust API design, JWT security, complex state management, and full containerization with Docker.

The core feature is a stable, "ironclad" Drag & Drop (DND) system for both tasks and columns, which correctly handles database transactions and position re-indexing to prevent concurrency issues.

## 2. Table of Contents

1.  [Introduction](#1-introduction)
2.  [Table of Content](#2-table-of-contents)
3.  [Tech Stack](#3-tech-stack)
4.  [Core Features](#4-core-features)
5.  [How to Run Locally (Docker)](#5-how-to-run-locally-docker)
6.  [Gallery](#6-gallery)

## 3. Tech Stack

The application is architected as a multi-container Docker application.

| Service | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | **Java 17** | Core language for the backend API. |
| | **Spring Boot 3** | Framework for building the REST API. |
| | **Spring Security (JWT)** | JWT-based authentication and endpoint authorization. |
| | **Spring Data JPA** | Data persistence and ORM. |
| **Frontend** | **React 18** | UI library for building the single-page application. |
| | **Vite** | Frontend build tooling and dev server. |
| | **Zustand** | Lightweight state management. |
| | **@hello-pangea/dnd** | The core library for all Drag & Drop functionality. |
| | **Axios** | HTTP client with interceptors for attaching JWT tokens. |
| **Database** | **PostgreSQL 15** | Relational database for storing all user data. |
| **Infra** | **Docker & Docker Compose** | Full containerization for all three services. |
| | **Nginx** | Serves the static React build and proxies API requests. |

---

## 4. Core Features

### Auth & Board Management
* **JWT Authentication**: Full user registration and login.
* **Logout**: A working "Logout" button that clears the local token.
* **Dashboard**: A main page to view, create, and delete boards.

### Column & Task Functionality
* **Full CRUD**: Create, Read, Update, and Delete functionality for Columns and Tasks.
* **Task Modal**: Clicking a task opens a modal to edit its `title` and `description`.
* **Optimistic UI**: All state changes (deleting, moving) happen instantly in the UI and are rolled back only if the server request fails.

### "Ironclad" Drag & Drop Logic
This project's main challenge was solving the `UNIQUE constraint` violation that occurs during DND re-ordering in PostgreSQL.
The solution implemented is:
1.  **DB Level**: `UNIQUE` constraints on `position` are set to `DEFERRABLE INITIALLY DEFERRED`. This tells PostgreSQL to only check for duplicates at the *end* of the transaction, not after every `UPDATE` statement.
2.  **Java Level**: The backend `TaskService` and `TaskColumnService` load the entire list, re-order it in Java, and iterate (`0, 1, 2...`) to re-assign all positions. This is extremely robust and fixes any "gaps" in position data.

---

## 5. How to Run Locally (Docker)

This entire application (Backend, Frontend, DB) can be launched with one command.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running.
* Ensure ports `80`, `5432`, and `8080` are free on your machine.

### Installation & Launch

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/hlibstrochkovskyi/trello-clone.git](https://github.com/hlibstrochkovskyi/trello-clone.git)
    cd trello-clone
    ```

2.  **Build and run all services:**
    This command will:
    * Build the Java `.jar` file using a Maven container.
    * Build the static React files using a Node.js container.
    * Start the `postgres_db`, `trello_backend`, and `trello_frontend` (Nginx) containers.

    ```bash
    docker-compose up --build
    ```

3.  **Open the app:**
    Once the logs show that all services are running, open your browser and go to:
    
    **`http://localhost`**

---

## 6. Gallery

*This section showcases the application's features.*

### Dashboard (Board Management)
*Create, view, and delete boards. Includes logout functionality.*
![Dashboard View](https://i.imgur.com/zHGDXaV.png)
### Board View (DND)
*Drag & Drop columns and tasks. Create new columns and tasks.*
![Board View Screenshot](https://i.imgur.com/9x0mTbu.png)
### Task Details Modal
*Click any task to open the modal. Edit title and description.*
![Task Modal Screenshot](https://i.imgur.com/tQThjow.png)
