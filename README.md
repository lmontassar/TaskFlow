# TaskFlow: Smart Project Management Software

TaskFlow is an intelligent and collaborative web platform designed to streamline project management. It leverages Artificial Intelligence to optimize task scheduling, resource allocation, and collaborator assignment, providing a seamless and efficient workflow for project managers and teams.

This project was developed as a final year project for the National License in Information Systems Development at ISET Radès, in collaboration with Turing Academy.

## ✨ Key Features

TaskFlow is packed with features designed to enhance productivity and project visibility:

-   **🤖 AI-Powered Optimization**:
    -   **Automated Scheduling**: Utilizes Google's OR-Tools to automatically schedule tasks, optimizing for time and resource constraints.
    -   **Intelligent Assignment**: Assigns collaborators to tasks based on their skills, availability, and current workload.
    -   **AI-Generated Descriptions**: Let the AI assist in writing clear and comprehensive task descriptions.
    -   **Conversational AI**: Interact with an AI assistant to get insights and suggestions about your projects.

-   **📋 Comprehensive Project & Task Management**:
    -   Create and manage projects with detailed descriptions, budgets, and timelines.
    -   Define tasks with dependencies (Finish-to-Start, Start-to-Start), sub-tasks, and priorities.
    -   Visualize your project timeline with an interactive **Gantt Chart**.
    -   Track progress with a drag-and-drop **Kanban Board**.
  
-   **👥 Collaborative Workspace**:
    -   **Real-Time Chat**: Communicate with project members instantly through integrated project discussions.
    -   **Task Comments & Mentions**: Leave comments on tasks and mention teammates to notify them.
    -   **File Attachments**: Attach relevant files and documents directly to tasks.
    -   **Notifications**: Stay updated with real-time notifications for important events.
    
-   **📊 Analytics & Reporting**:
    -   **Admin Dashboard**: A comprehensive dashboard for administrators to monitor platform-wide statistics, manage users, and oversee projects.
    -   **Project Analytics**: Generate and export detailed project reports in **PDF format** to analyze progress and performance.
    -   **Data Export**: Export user lists, project lists, and analytics charts to CSV.
        
-   **🔐 Secure Authentication**:
    -   Robust user authentication with email/password, **Google**, and **GitHub** OAuth.
    -   Enhanced security with **Two-Factor Authentication (2FA)**.
        

## 🏗️ Architecture

TaskFlow is built on a modern microservices architecture to ensure scalability, flexibility, and maintainability.

-   **Frontend**: A dynamic and responsive single-page application built with **React.js**.
-   **Backend (Core Services)**: A robust backend powered by **Spring Boot** that handles business logic, data persistence, and user authentication.
-   **Backend (AI & Scheduling API)**: A high-performance microservice built with **Python** and **FastAPI** to handle the complex computational tasks of project optimization.
-   **Database**: **MongoDB** is used as the primary database for its flexibility in handling complex, document-oriented data structures.
-   **Communication**: The system uses a combination of a **REST API** for standard client-server communication and **WebSockets** for real-time features like chat and notifications.
    

## 🛠️ Tech Stack
This project combines a range of powerful technologies:

-   **Frontend**:
    -   React.js, Vite, Tailwind CSS
    -   Recharts & Chart.js for data visualization
    -   Frappe Gantt & dhtmlx-gantt for interactive Gantt charts
    -   StompJS & SockJS for WebSocket communication
  
-   **Backend (Core Services)**:
    -   Spring Boot 3, Java 21
    -   Spring Security, JWT for authentication
    -   MongoDB Atlas for data persistence
    -   OpenPDF for PDF generation
    
-   **Backend (AI & Scheduling API)**:
    -   Python 3, FastAPI
    -   Google OR-Tools (CP-SAT Solver) for constraint programming and optimization
    -   Sentence-Transformers for semantic analysis
-   **DevOps & Tools**:
    -   Maven, Jira, GitHub, Postman, PyTest

## 🚀 Getting Started
To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Java 21+ and Maven
-   Python 3.10+ and Pip
-   Node.js and npm
-   A running MongoDB instance (local or cloud)


----------

## 📸 Realisation Screenshots

Here are some screenshots showcasing the core functionalities and user interface of **TaskFlow** during its development:


### 🔐 Authentication  
1. *Multi-step user registration interface*

![Image](https://github.com/user-attachments/assets/6227f208-2ce1-453f-b238-e6b554407e7e)


2. *Multi-step user login interface*

![Image](https://github.com/user-attachments/assets/fcb9cb15-cbe5-4e58-bcd2-1cbcfaa8ba5b)



3. *Multi-step password reset interface*

![Image](https://github.com/user-attachments/assets/2bc453f1-6367-4e6e-a6cc-91e583da1ad0)

4. *User logout interface*

![Image](https://github.com/user-attachments/assets/abc77038-9c50-4ffc-9da5-f335dbcf545b)


5. *User profile interface*

![Image](https://github.com/user-attachments/assets/5cd5d8ea-80bf-4755-8195-07351937f7ed)

----------

### 📁 Project Management

#### 🧱 Create a Project

_Project creation interface_

![Image](https://github.com/user-attachments/assets/b3687986-e991-4585-b391-d6f21139e2b5)

#### 👥 Add a Collaborator

_Interface to add a project collaborator_
![Image](https://github.com/user-attachments/assets/e578d257-069f-42df-8f70-00944ffdb9e5)
![Image](https://github.com/user-attachments/assets/4383f366-173c-40cf-b07d-39e9c9ecbedd)

#### ✅ Create a Task

_Task creation interface with input fields and parameters_
![Image](https://github.com/user-attachments/assets/50ec781e-908c-49e6-999d-aa931f8914ae)


#### 📝 Task List

_Overview of all tasks in a project_
![Image](https://github.com/user-attachments/assets/c61712bf-1627-455f-aff0-cffb4741c730)
![Image](https://github.com/user-attachments/assets/ee62d72a-c2fc-4533-9fa8-cb8b79b9a98c)

#### 🔍 Task Detail Page

_Detailed view of a task, with comments, status, and history_
![Image](https://github.com/user-attachments/assets/feb33499-2ccf-4355-8863-ca9a97d7a1bb)


#### 🔗 Task Dependencies

_Visual management of task dependencies_
![Image](https://github.com/user-attachments/assets/f4c7fd33-8b7b-4d5e-b010-ae332bdb5ef1)


#### 🙋 Manual Task Assignment

_Assigning a user manually to a task_
![Image](https://github.com/user-attachments/assets/87497c4f-2aff-48ce-a6af-6e5233ec43a8)


----------

### 🧠 Resource Management

#### 📦 Resource Management Interface

_Manage available resources with roles and availability_



#### 🧩 Assign Resource to Task

_Assigning appropriate resources to a task_



#### 📅 Gantt Timeline

_Gantt view showing tasks over time and resource allocation_



#### 🔍 Resource Identification

_System identifying required resources automatically_

<p align="center"> <img src="screenshots/resource-identification.png" alt="Resource Identification" width="600"/> </p>

#### 📎 File Attachment

_Attach supporting documents or files to a task_

<p align="center"> <img src="screenshots/file-attachment.png" alt="File Attachment" width="600"/> </p>

----------

### 💬 AI & Real-Time Features

#### 💻 Real-Time Discussions

_Chat interface and real-time messaging_

<p align="center"> <img src="screenshots/real-time-chat.png" alt="Real-Time Chat" width="600"/> </p>

#### 🧠 AI-Based Task Optimization

_AI-generated task schedule suggestion view_

<p align="center"> <img src="screenshots/ai-optimization.png" alt="AI Task Optimization" width="600"/> </p>

#### 📈 Gantt & Dynamic Task Handling

_Interactively update task dependencies in Gantt view_

<p align="center"> <img src="screenshots/gantt-dynamic.png" alt="Gantt Dynamic Management" width="600"/> </p>

#### 📝 AI Task Description Generator

_Automatic description suggestion using AI_

<p align="center"> <img src="screenshots/ai-description.png" alt="AI Task Description Generator" width="600"/> </p>

#### 🤖 AI Chat System

_Interact with AI to get help or optimize project_

<p align="center"> <img src="screenshots/ai-chat.png" alt="AI Chat System" width="600"/> </p>

----------

### 🛠️ Admin & Analytics

#### 📤 Export Project Report

_Interface to export project summary as PDF or CSV_

<p align="center"> <img src="screenshots/export-report.png" alt="Export Project Report" width="600"/> </p>

#### 📊 Admin Dashboard

_Overview of system activity, projects, users_

<p align="center"> <img src="screenshots/admin-dashboard.png" alt="Admin Dashboard" width="600"/> </p>

#### 👤 User List Interface

_Admin view of all platform users_

<p align="center"> <img src="screenshots/user-list.png" alt="User List Interface" width="600"/> </p>

#### 📋 Project List Interface

_Admin view of all existing projects_

<p align="center"> <img src="screenshots/project-list.png" alt="Project List Interface" width="600"/> </p>

#### 📈 Analytics Section

_Charts showing productivity, task completion, workload_

<p align="center"> <img src="screenshots/analytics.png" alt="Analytics Charts" width="600"/> </p>





## 👥 Authors

-   **Lounissi Montassar**
-   **Choukani Halim**


## 🌟 Acknowledgements

We extend our sincere gratitude to everyone who contributed to the success of this project:

-   **Turing Academy** for providing the opportunity and framework for this project.
    
-   **Mme. Lamia Mansouri** (ISET Radès Supervisor) for her invaluable guidance and academic support.
    
-   **Mme. Olfa Mosbahi** (Turing Academy Supervisor) for her professional mentorship and industry insights.
    

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
