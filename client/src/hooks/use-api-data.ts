"use client"

import { useState, useEffect } from "react"

export interface User {
  _id: { $oid: string }
  email: string
  phoneNumber: string
  role: "USER" | "ADMIN"
  nom: string
  prenom: string
  title: string
  avatar: string
  creationDate: { $date: string }
  blocked: boolean
  activation: boolean
  online?: boolean
}

export interface Task {
  _id: { $oid: string }
  nomTache: string
  description: string
  budgetEstime: number
  statut: "TODO" | "DONE" | "REVIEW" | "IN_PROGRESS"
  qualite: number
  difficulte: "easy" | "normal" | "hard"
  dateCreation: { $date: string }
  dateDebut: { $date: string }
  dateFinEstime: { $date: string }
  duree: { $numberLong: string }
  assignee: Array<{ $ref: string; $id: { $oid: string } }>
  rapporteur: { $ref: string; $id: { $oid: string } }
}

export interface Project {
  _id: { $oid: string }
  nom: string
  description: string
  budgetEstime: number
  dateDebut: { $date: string }
  dateFinEstime: { $date: string }
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD"
  createur: { $ref: string; $id: { $oid: string } }
  dateCreation: { $date: string }
  listeCollaborateur: Array<{
    user: { $ref: string; $id: { $oid: string } }
    role: string
    competances: Array<{ titre: string; niveau: number }>
    disponibilite: boolean
    heurTravail: number
  }>
}

export interface Resource {
  _id: { $oid: string }
  nom: string
  type: "Material" | "Energetic" | "Temporary"
  coutUnitaire: number
  status: "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE"
  categorie: string
  qte?: number
  qteDisponibilite?: number
  utilisationTotale?: number
  consommationTotale?: number
  consommationMax?: number
  unitMeasure?: string
}

export function useApiData() {
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Enhanced mock data with more realistic entries
        const usersData = [
          {
            _id: { $oid: "6813af2511fc2a54d08b5245" },
            email: "choukani.halim@gmail.com",
            phoneNumber: "+21658968759",
            role: "USER" as const,
            nom: "Choukani",
            prenom: "Halim",
            title: "Senior Developer",
            avatar: "avatar_20250501210954.jpg",
            creationDate: { $date: "2025-01-15T17:28:04.890Z" },
            blocked: false,
            activation: true,
            online: true,
          },
          {
            _id: { $oid: "6813af7011fc2a54d08b5247" },
            email: "montassar9000@gmail.com",
            phoneNumber: "+21626226626",
            role: "ADMIN" as const,
            nom: "Lounissi",
            prenom: "Montassar",
            title: "Project Manager",
            avatar: "avatar_20250525014822.png",
            creationDate: { $date: "2025-01-10T17:29:20.912Z" },
            blocked: false,
            activation: true,
            online: true,
          },
          {
            _id: { $oid: "6813af9b11fc2a54d08b5249" },
            email: "ramisassi@gmail.com",
            phoneNumber: "",
            role: "USER" as const,
            nom: "Sassi",
            prenom: "Rami",
            title: "DevOps Engineer",
            avatar: "avatar_20250501211020.jpg",
            creationDate: { $date: "2025-02-01T17:30:03.124Z" },
            blocked: false,
            activation: true,
            online: false,
          },
          {
            _id: { $oid: "6813afcd11fc2a54d08b524b" },
            email: "mechergui.medaziz@gmail.com",
            phoneNumber: "",
            role: "USER" as const,
            nom: "Mechergui",
            prenom: "Med Aziz",
            title: "QA Engineer",
            avatar: "avatar_20250501211007.jpg",
            creationDate: { $date: "2025-02-15T17:30:53.067Z" },
            blocked: false,
            activation: true,
            online: true,
          },
          {
            _id: { $oid: "6813b00d11fc2a54d08b524d" },
            email: "badouimahdi@gmail.com",
            phoneNumber: "",
            role: "USER" as const,
            nom: "Badoui",
            prenom: "Mahdi",
            title: "UI/UX Designer",
            avatar: "avatar_20250501210941.jpg",
            creationDate: { $date: "2025-03-01T17:31:57.002Z" },
            blocked: false,
            activation: true,
            online: true,
          },
          {
            _id: { $oid: "6813b00d11fc2a54d08b524e" },
            email: "sarah.johnson@gmail.com",
            phoneNumber: "+1234567890",
            role: "USER" as const,
            nom: "Johnson",
            prenom: "Sarah",
            title: "Backend Developer",
            avatar: "avatar_sarah.jpg",
            creationDate: { $date: "2025-03-15T10:15:30.000Z" },
            blocked: false,
            activation: true,
            online: false,
          },
        ]

        const tasksData = [
          {
            _id: { $oid: "682210ee5a712c2393ad58eb" },
            nomTache: "Design Database Schema",
            description: "Model all data entities and relationships",
            budgetEstime: 5000,
            statut: "DONE" as const,
            qualite: 5,
            difficulte: "normal" as const,
            dateCreation: { $date: "2025-01-12T15:17:02.867Z" },
            dateDebut: { $date: "2025-01-15T23:00:00.000Z" },
            dateFinEstime: { $date: "2025-01-20T23:00:00.000Z" },
            duree: { $numberLong: "345600" },
            assignee: [
              { $ref: "users", $id: { $oid: "6813af9b11fc2a54d08b5249" } },
              { $ref: "users", $id: { $oid: "6813afcd11fc2a54d08b524b" } },
            ],
            rapporteur: { $ref: "users", $id: { $oid: "6813af7011fc2a54d08b5247" } },
          },
          {
            _id: { $oid: "682211155a712c2393ad58ec" },
            nomTache: "Set Up Development Environment",
            description: "Configure IDEs, build tools, repositories",
            budgetEstime: 3000,
            statut: "DONE" as const,
            qualite: 4,
            difficulte: "easy" as const,
            dateCreation: { $date: "2025-01-15T15:17:41.713Z" },
            dateDebut: { $date: "2025-01-20T23:00:00.000Z" },
            dateFinEstime: { $date: "2025-01-25T23:00:00.000Z" },
            duree: { $numberLong: "172800" },
            assignee: [{ $ref: "users", $id: { $oid: "6813af2511fc2a54d08b5245" } }],
            rapporteur: { $ref: "users", $id: { $oid: "6813af7011fc2a54d08b5247" } },
          },
          {
            _id: { $oid: "682211405a712c2393ad58ed" },
            nomTache: "Implement Authentication Module",
            description: "OAuth2, JWT, session management",
            budgetEstime: 6000,
            statut: "IN_PROGRESS" as const,
            qualite: 3,
            difficulte: "hard" as const,
            dateCreation: { $date: "2025-02-01T15:18:24.251Z" },
            dateDebut: { $date: "2025-02-05T23:00:00.000Z" },
            dateFinEstime: { $date: "2025-02-15T23:00:00.000Z" },
            duree: { $numberLong: "432000" },
            assignee: [{ $ref: "users", $id: { $oid: "6813b00d11fc2a54d08b524e" } }],
            rapporteur: { $ref: "users", $id: { $oid: "6813af7011fc2a54d08b5247" } },
          },
          {
            _id: { $oid: "682211685a712c2393ad58ee" },
            nomTache: "Design REST API Endpoints",
            description: "Define resource URIs and payloads",
            budgetEstime: 4000,
            statut: "REVIEW" as const,
            qualite: 4,
            difficulte: "normal" as const,
            dateCreation: { $date: "2025-02-10T15:19:04.900Z" },
            dateDebut: { $date: "2025-02-15T23:00:00.000Z" },
            dateFinEstime: { $date: "2025-02-20T23:00:00.000Z" },
            duree: { $numberLong: "259200" },
            assignee: [{ $ref: "users", $id: { $oid: "6813af2511fc2a54d08b5245" } }],
            rapporteur: { $ref: "users", $id: { $oid: "6813af7011fc2a54d08b5247" } },
          },
          {
            _id: { $oid: "6822117f5a712c2393ad58ef" },
            nomTache: "Frontend Scaffold with Angular",
            description: "Setup Angular project and basic modules",
            budgetEstime: 6000,
            statut: "TODO" as const,
            qualite: 0,
            difficulte: "normal" as const,
            dateCreation: { $date: "2025-03-01T15:19:27.230Z" },
            dateDebut: { $date: "2025-03-05T23:00:00.000Z" },
            dateFinEstime: { $date: "2025-03-15T23:00:00.000Z" },
            duree: { $numberLong: "432000" },
            assignee: [{ $ref: "users", $id: { $oid: "6813b00d11fc2a54d08b524d" } }],
            rapporteur: { $ref: "users", $id: { $oid: "6813af7011fc2a54d08b5247" } },
          },
          {
            _id: { $oid: "682211965a712c2393ad58f0" },
            nomTache: "Implement UI Login Page",
            description: "Login form, validation, error handling",
            budgetEstime: 4000,
            statut: "TODO" as const,
            qualite: 0,
            difficulte: "easy" as const,
            dateCreation: { $date: "2025-03-10T15:19:50.340Z" },
            dateDebut: { $date: "2025-03-15T23:00:00.000Z" },
            dateFinEstime: { $date: "2025-03-20T23:00:00.000Z" },
            duree: { $numberLong: "216000" },
            assignee: [{ $ref: "users", $id: { $oid: "6813b00d11fc2a54d08b524d" } }],
            rapporteur: { $ref: "users", $id: { $oid: "6813af7011fc2a54d08b5247" } },
          },
          {
            _id: { $oid: "682211b55a712c2393ad58f1" },
            nomTache: "Implement UI Registration Page",
            description: "Form fields, API hookup, client validation",
            budgetEstime: 5000,
            statut: "TODO" as const,
            qualite: 0,
            difficulte: "normal" as const,
            dateCreation: { $date: "2025-03-15T15:20:21.986Z" },
            dateDebut: { $date: "2025-03-20T23:00:00.000Z" },
            dateFinEstime: { $date: "2025-03-25T23:00:00.000Z" },
            duree: { $numberLong: "345600" },
            assignee: [{ $ref: "users", $id: { $oid: "6813b00d11fc2a54d08b524d" } }],
            rapporteur: { $ref: "users", $id: { $oid: "6813af7011fc2a54d08b5247" } },
          },
          {
            _id: { $oid: "682211d75a712c2393ad58f2" },
            nomTache: "Back-end Service for Tasks",
            description: "CRUD services and validation",
            budgetEstime: 6000,
            statut: "IN_PROGRESS" as const,
            qualite: 3,
            difficulte: "hard" as const,
            dateCreation: { $date: "2025-02-20T15:20:55.404Z" },
            dateDebut: { $date: "2025-02-25T23:00:00.000Z" },
            dateFinEstime: { $date: "2025-03-10T23:00:00.000Z" },
            duree: { $numberLong: "432000" },
            assignee: [{ $ref: "users", $id: { $oid: "6813b00d11fc2a54d08b524e" } }],
            rapporteur: { $ref: "users", $id: { $oid: "6813af7011fc2a54d08b5247" } },
          },
        ]

        const projectsData = [
          {
            _id: { $oid: "6821fdc382a69a5d91119b8d" },
            nom: "TaskFlow Platform",
            description: "Full end-to-end development and rollout of the TaskFlow project management system",
            budgetEstime: 200000,
            dateDebut: { $date: "2025-01-01T00:00:00.000Z" },
            dateFinEstime: { $date: "2025-06-30T23:59:59.000Z" },
            status: "IN_PROGRESS" as const,
            createur: { $ref: "users", $id: { $oid: "6813af7011fc2a54d08b5247" } },
            dateCreation: { $date: "2024-12-15T13:55:15.994Z" },
            listeCollaborateur: [
              {
                user: { $ref: "users", $id: { $oid: "6813af2511fc2a54d08b5245" } },
                role: "Senior Developer",
                competances: [
                  { titre: "Angular", niveau: 4 },
                  { titre: "Node.js", niveau: 5 },
                  { titre: "TypeScript", niveau: 4 },
                ],
                disponibilite: true,
                heurTravail: 40,
              },
              {
                user: { $ref: "users", $id: { $oid: "6813af9b11fc2a54d08b5249" } },
                role: "DevOps Engineer",
                competances: [
                  { titre: "Docker", niveau: 5 },
                  { titre: "Kubernetes", niveau: 4 },
                  { titre: "AWS", niveau: 4 },
                ],
                disponibilite: true,
                heurTravail: 35,
              },
            ],
          },
          {
            _id: { $oid: "6821fdc382a69a5d91119b8e" },
            nom: "Mobile App Development",
            description: "Cross-platform mobile application for TaskFlow",
            budgetEstime: 150000,
            dateDebut: { $date: "2025-04-01T00:00:00.000Z" },
            dateFinEstime: { $date: "2025-09-30T23:59:59.000Z" },
            status: "NOT_STARTED" as const,
            createur: { $ref: "users", $id: { $oid: "6813af7011fc2a54d08b5247" } },
            dateCreation: { $date: "2025-01-20T10:30:00.000Z" },
            listeCollaborateur: [],
          },
        ]

        const resourcesData = [
          {
            _id: { $oid: "6821fe8a82a69a5d91119b8e" },
            utilisationTotale: 3,
            qteDisponibilite: 2,
            qte: 5,
            nom: "Development Workstation",
            type: "Material" as const,
            coutUnitaire: 2500,
            status: "AVAILABLE" as const,
            categorie: "Hardware",
          },
          {
            _id: { $oid: "6822001982a69a5d91119b8f" },
            utilisationTotale: 8,
            qteDisponibilite: 2,
            qte: 10,
            nom: "Laptop Pro",
            type: "Material" as const,
            coutUnitaire: 1800,
            status: "AVAILABLE" as const,
            categorie: "Hardware",
          },
          {
            _id: { $oid: "6822006482a69a5d91119b91" },
            utilisationTotale: 1,
            qteDisponibilite: 1,
            qte: 2,
            nom: "Conference Room A",
            type: "Material" as const,
            coutUnitaire: 100,
            status: "AVAILABLE" as const,
            categorie: "Facilities",
          },
          {
            _id: { $oid: "682209055a712c2393ad58cf" },
            unitMeasure: "kWh",
            consommationTotale: 1200,
            consommationMax: 5000,
            nom: "Office Electricity",
            type: "Energetic" as const,
            coutUnitaire: 0.15,
            status: "AVAILABLE" as const,
            categorie: "Utilities",
          },
          {
            _id: { $oid: "68220cc45a712c2393ad58da" },
            unitMeasure: "License",
            qte: 45,
            nom: "Software Licenses",
            type: "Temporary" as const,
            coutUnitaire: 299,
            status: "AVAILABLE" as const,
            categorie: "Software",
          },
        ]

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        setUsers(usersData)
        setTasks(tasksData)
        setProjects(projectsData)
        setResources(resourcesData)
      } catch (err) {
        setError("Failed to fetch data")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { users, tasks, projects, resources, loading, error }
}
