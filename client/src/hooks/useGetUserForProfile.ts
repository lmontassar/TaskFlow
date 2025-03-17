import { useState, useEffect } from "react"

interface UserData {
  id: string
  name?: string
  fullName?: string
  nom?: string
  prenom?: string
  title?: string | null
  email: string
  phone?: string
  phoneNumber?: string | null
  location?: string
  region?: string | null
  joinDate?: string
  creationDate?: string
  department?: string
  bio?: string | null
  avatar?: string
  verified?: boolean
  activation?: boolean
  twoFactorAuth?: boolean | null
  stats?: {
    projects: number
    tasks: number
    teams: number
  }
  activeProjects?: Array<{
    id: string
    name: string
    role: string
    tasks: {
      completed: number
      total: number
    }
    progress: number
    dueDate: string
  }>
  teams?: Array<{
    id: string
    name: string
    role: string
    members: number
  }>
  recentActivity?: Array<{
    id: string
    type: string
    title: string
    description: string
    date: string
  }>
}

const useGetUserForProfile = () => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Default data to use when no user data is available
  const defaultUserData: UserData = {
    id: "user-1",
    name: "John",
    fullName: "John Doe",
    title: "Software Engineer",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    location: "New York, USA",
    joinDate: "January 1, 2023",
    department: "Engineering",
    bio: "Passionate software engineer with a focus on building scalable and maintainable applications.",
    avatar: "https://avatars.githubusercontent.com/u/88793933?v=4",
    verified: true,
    stats: {
      projects: 23,
      tasks: 105,
      teams: 8,
    },
    activeProjects: [
      {
        id: "project-1",
        name: "E-commerce Platform",
        role: "Frontend Developer",
        tasks: {
          completed: 15,
          total: 20,
        },
        progress: 75,
        dueDate: "December 31, 2023",
      },
      {
        id: "project-2",
        name: "Mobile App Redesign",
        role: "UI/UX Designer",
        tasks: {
          completed: 8,
          total: 10,
        },
        progress: 80,
        dueDate: "November 15, 2023",
      },
    ],
    teams: [
      {
        id: "team-1",
        name: "Frontend Team",
        role: "Member",
        members: 12,
      },
      {
        id: "team-2",
        name: "Backend Team",
        role: "Lead",
        members: 8,
      },
    ],
  }

  
const getUser = async () =>{
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchUser = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("authToken")
        if (!token) {
          // If no token, use default data for development
          setUser(defaultUserData)
          setLoading(false)
          return
        }

        const response = await fetch("/api/user/get", {
          method: "GET",
          headers: {
            Authorization: token,
          },
          signal,
        })

        if (response.status === 403) {
          console.log("Token has expired")
          localStorage.removeItem("authToken") // Clear the token
          setUser(defaultUserData) // Use default data instead of null
          setLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const userData:{avatar:String} | any = await response.json()

        // Merge the API data with default data for missing fields
        const mergedData = {
          ...defaultUserData,
          ...userData,
          name: userData.prenom || defaultUserData.name,
          fullName: userData.nom && userData.prenom ? `${userData.prenom} ${userData.nom}` : defaultUserData.fullName,
          phone: userData.phoneNumber || defaultUserData.phone,
          // Map region to location if it exists
          location: userData.region || defaultUserData.location,
          twoFactorAuth : userData.twoFactorAuth !== null ? userData.twoFactorAuth : null,
          avatar: userData.avatar.indexOf("avatar") == 0 ? "/api/user/avatar/"+userData.avatar :  userData.avatar,

          // Map creationDate to joinDate if it exists
          joinDate: userData.creationDate
            ? new Date(userData.creationDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : defaultUserData.joinDate,
        }

        setUser(mergedData)
        console.log(mergedData);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch user data", err)
          setError(err.message || "Failed to fetch user data")
          // Use default data on error
          setUser(defaultUserData)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    return () => {
      abortController.abort()
    }
}

  useEffect( () => {
    getUser();
  }, [])

  const refreshUser = async ()=>{
    await getUser();
  }


  return { user, setUser, loading, error , refreshUser }
}


export default useGetUserForProfile

