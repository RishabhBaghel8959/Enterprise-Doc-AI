# 🚀 EnterpriseDocAI – AI Document Assistant

A production-ready **AI-powered document querying system** built using **FastAPI, Next.js, LangChain, LangGraph, and Ollama (local LLMs)**.

---

## 🧠 Overview

EnterpriseDocAI allows users to upload documents and interact with them using natural language queries. It leverages **Retrieval-Augmented Generation (RAG)** to provide accurate, context-aware answers.

---

## ✨ Features

* 🔐 Authentication (NextAuth)
* 📂 PDF Upload & Processing
* 🧠 RAG-based Question Answering
* ⚡ Streaming Responses (real-time)
* 🗂️ Vector Database (FAISS)
* 🤖 Local LLM via Ollama (LLaMA3)
* ⚡ Redis Caching (optional)
* 🐳 Dockerized Full Stack App
* 🎨 Modern SaaS UI (Mistral-style)

---

## 🏗️ Tech Stack

### Backend

* FastAPI
* LangChain + LangGraph
* FAISS (Vector DB)
* Ollama (Local LLM)
* Redis

### Frontend

* Next.js 14 (App Router)
* NextAuth (Authentication)
* Tailwind CSS

### DevOps

* Docker + Docker Compose

---

## 📸 UI Preview

> Clean, minimal AI interface inspired by modern SaaS tools

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repo

```bash
git clone https://github.com/YOUR_USERNAME/enterprise-doc-ai.git
cd enterprise-doc-ai
```

---

### 2️⃣ Run Ollama

```bash
ollama serve
ollama pull llama3
ollama pull nomic-embed-text
```

---

### 3️⃣ Run with Docker

```bash
docker-compose up --build
```

---

### 4️⃣ Access App

* Frontend → http://localhost:3000
* Backend → http://localhost:8000

---

## 🔐 Authentication

* Username: admin
* Password: admin

---

## 🧪 Usage

1. Login
2. Upload PDF
3. Ask questions
4. Get real-time AI responses

---

## 📊 Architecture

```text
Next.js (Frontend)
        ↓
FastAPI (Backend)
        ↓
LangGraph Agent
        ↓
Vector DB (FAISS)
        ↓
Ollama (LLM)
```

---

## 🚀 Future Improvements

* Chat history persistence (DB)
* Multi-user support
* Cloud deployment (AWS/GCP)
* Document preview panel
* Drag & drop upload

---

## 👨‍💻 Author

**Rishabh Singh Baghel**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
