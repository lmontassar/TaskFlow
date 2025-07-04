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
----------

### 🧠 Resource Management

#### 📦 Resource Management Interface

_Manage available resources with roles and availability_
1. add resources

![Image](https://github.com/user-attachments/assets/b711f426-847a-45fa-ad81-a072a8a5464c)

2. Display of a resource

![Image](https://github.com/user-attachments/assets/5c59f243-8478-484d-9c41-be2f995358a7)

3. editing a resource

![Image](https://github.com/user-attachments/assets/7ea6de36-e00d-44e7-b2fc-ca111f067696)

4. Deletion of a resource

![Image](https://github.com/user-attachments/assets/89d67e64-2495-4c45-875f-6ad94e718be9)


#### 🧩 Assign Resource to Task

_Assigning appropriate resources to a task_
1. resources assigned

![Image](https://github.com/user-attachments/assets/ef0150bb-33d3-48ea-befa-35b0695354ca)

![Image](https://github.com/user-attachments/assets/251cf530-bda8-4e2e-b212-0d778593c52a)

2. Modification of assigned resources

![Image](https://github.com/user-attachments/assets/ba07d63c-5f0d-46a8-bc6d-e1e963a0b811)

3. Allocation énergétique - barre chart

![Image](https://github.com/user-attachments/assets/db695280-26c1-4f30-9c87-6f49a71da3f1)

#### 📅 Gantt Timeline

_Gantt view showing tasks over time and resource allocation_

![Image](https://github.com/user-attachments/assets/3974746e-9370-42ff-9cd7-8a3457ba207a)


#### 🔍 Resource Identification

_System identifying required resources automatically_

![Image](https://github.com/user-attachments/assets/491c150d-215d-41f6-8bb6-dbc17a5eebef)



#### 📎 File Attachment

_Attach supporting documents or files to a task_

![Image](https://github.com/user-attachments/assets/e0e2ce0f-409d-4c0d-99fa-3014777e53aa)

![Image](https://github.com/user-attachments/assets/b8a27acb-8b26-4063-a2db-58182fb5349e)

----------
----------

### 💬 AI & Real-Time Features

#### 💻 Real-Time Discussions

_Chat interface and real-time messaging_

![Image](https://github.com/user-attachments/assets/bb5d35cc-59df-4259-a4d2-11d8a4af1ea6)

#### 🧠 AI-Based Task Optimization

_AI-generated task schedule suggestion view_

![Image](https://github.com/user-attachments/assets/d68dc3b4-d5df-4621-a5e8-ecb1d6b71dde)

![Image](https://github.com/user-attachments/assets/c9bffad8-dd4b-4848-bf26-89e1d31e289f)

#### 📈 Gantt & Dynamic Task Handling

_Interactively update task dependencies in Gantt view_

![Image](https://github.com/user-attachments/assets/a4a8301e-05fa-4b81-b661-13bb98a81173)

#### 📝 AI Task Description Generator

_Automatic description suggestion using AI_

![Image](https://github.com/user-attachments/assets/2e4406da-9694-4c10-9173-612c85498d86)

#### 🤖 AI Chat System

_Interact with AI to get help or optimize project_

![Image](https://github.com/user-attachments/assets/3aad92d6-aa3c-43f4-877c-c2cddb09576f)

----------
----------

### 🛠️ Admin & Analytics

#### 📤 Export Project Report

_Interface to export project summary as PDF or CSV_

![Image](https://github.com/user-attachments/assets/75d06e64-d1ea-49b1-8a82-15b2c9ae96f0)

#### 📊 Admin Dashboard

_Overview of system activity, projects, users_

![Image](https://github.com/user-attachments/assets/a19746a8-8749-45b9-94d6-f08b1dd826f4)

#### 👤 User List Interface

_Admin view of all platform users_

![Image](https://github.com/user-attachments/assets/e603c2f4-6566-4a5b-a03a-70c396fbeae0)

#### 📋 Project List Interface

_Admin view of all existing projects_

![Image](https://github.com/user-attachments/assets/80116dcb-7aba-4147-b9bc-2f2cab94c332)

#### 📈 Analytics Section

_Charts showing productivity, task completion, workload_

![Image](https://github.com/user-attachments/assets/80a811cd-e152-4b72-a18a-455fb3adc0d5)





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
