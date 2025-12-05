# AI-based-network

A web-based AI assistant that allows users to create and visualize network topologies (star, ring, bus, line, mesh) through natural language. Powered by **Rasa NLU**, **Flask backend**, and **React/React Flow frontend**.

---

## Features

- **Chat with AI Assistant**: Users can describe the network topology and number of devices in natural language.  
- **Entity Extraction**: Detects topology type and device count using Rasa NLU slots.  
- **Topology Visualization**: Generates network diagrams in real-time using React Flow.  
- **Session Management**: Resets conversation after a topology is created to start fresh.  
- **Health Checks**: Backend and Rasa health endpoints to monitor service status.

---

## Tech Stack

- **Backend**: Flask, Requests, Python 3.10  
- **AI/NLU**: Rasa (NLU + Core)  
- **Frontend**: React, TypeScript, Material UI, React Flow  
- **Containerization**: Docker & Docker Compose  

---

## Services

The project is composed of multiple services, each running in its own container using **Docker Compose**:

### 1. Rasa NLU & Core

- **Image**: `rasa/rasa:3.6.0-full`  
- **Purpose**: Natural Language Understanding and dialogue management.  
- **Port**: `5005`  
- **Endpoints**:  
  - `/webhooks/rest/webhook` → Send user messages and receive bot responses  
  - `/model/parse` → Extract entities from text  
  - `/conversations/{sender_id}/tracker` → Track conversation state  
  - `/health` → Check Rasa server health  

---

### 2. Flask Backend

- **Build**: `./backend` 
- **Purpose**: Acts as a middleware between frontend and Rasa.  
- **Port**: `5000`  
- **Endpoints**:  
  - `/chat` → Receives user messages, sends to Rasa, extracts entities, and returns bot response with extracted data.  
  - `/health` → Checks the backend and Rasa health status.  

---

### 3. React Frontend

- **Build**: `./frontend`  
- **Purpose**: Provides a UI for the chatbot and network topology visualization using **React Flow**.  
- **Port**: `3000`  

---


