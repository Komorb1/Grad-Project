# Smart emergency alert system using ESP32

## Overview

This project is a full-stack Smart Emergency Alert System designed to detect environmental hazards and intrusion events in real time.

The system uses an ESP32-based device to monitor:

- Gas levels
- Smoke / flame presence
- Motion detection
- Door open/close status

Sensor data is securely transmitted to a backend server and displayed on a web dashboard for centralized monitoring.

This project is developed as a Software Engineering Capstone project with emphasis on:

- Structured task planning (Kanban)
- CI/CD integration
- Database design with ER diagram
- Full-stack vertical slice implementation
- Secure and reliable system design

## Architecture

The system consists of three main layers:

### 1. Firmware (ESP32)
Located in `/firmware`

- Reads sensors
- Detects abnormal conditions
- Triggers local alerts (LED / buzzer)
- Sends encrypted data to backend
- Handles offline queueing

### 2. Backend (Next.js API)
Located in `/backend`

- Receives device data
- Authenticates devices
- Stores sensor readings and events
- Manages users and system states
- Exposes REST API endpoints

### 3. Dashboard (Next.js UI)
Located in `/backend` (App Router)

- Displays device status
- Shows event history
- Supports system monitoring and management

## Tech Stack

- Next.js (App Router)
- TypeScript
- PostgreSQL (planned)
- Prisma ORM (planned)
- Jest (unit testing)
- GitHub Actions (CI/CD)
- ESP32 (Arduino framework)