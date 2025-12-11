"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { io, Socket } from "socket.io-client"

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
    joinUserRoom: (userId: string) => void
    sendMessage: (message: string, userId: string) => void
    sendAIMessage: (message: string, userId: string, conversationId?: string) => void
    updateTaskStatus: (taskId: string, completed: boolean, userId: string) => void
    notifyRoutineCreated: (routineData: any, userId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function useSocket() {
    const context = useContext(SocketContext)
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider")
    }
    return context
}

interface SocketProviderProps {
    children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Initialize Socket.io connection
        const socketInstance = io(process.env.NODE_ENV === "production"
            ? "https://your-production-domain.com"
            : "http://localhost:3000", {
            path: "/socket.io",
            autoConnect: true,
        })

        socketInstance.on("connect", () => {
            console.log("[Socket.io] Connected to server")
            setIsConnected(true)
        })

        socketInstance.on("disconnect", () => {
            console.log("[Socket.io] Disconnected from server")
            setIsConnected(false)
        })

        socketInstance.on("connect_error", (error) => {
            console.error("[Socket.io] Connection error:", error)
            setIsConnected(false)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    const joinUserRoom = (userId: string) => {
        if (socket) {
            socket.emit("join-user-room", userId)
        }
    }

    const sendMessage = (message: string, userId: string) => {
        if (socket) {
            socket.emit("send-message", {
                userId,
                message,
                timestamp: new Date().toISOString(),
                type: "user"
            })
        }
    }

    const sendAIMessage = (message: string, userId: string, conversationId = "default") => {
        if (socket) {
            socket.emit("ai-conversation", {
                userId,
                message,
                conversationId
            })
        }
    }

    const updateTaskStatus = (taskId: string, completed: boolean, userId: string) => {
        if (socket) {
            socket.emit("task-completed", {
                taskId,
                completed,
                userId,
                timestamp: new Date().toISOString()
            })
        }
    }

    const notifyRoutineCreated = (routineData: any, userId: string) => {
        if (socket) {
            socket.emit("routine-created", {
                ...routineData,
                userId,
                timestamp: new Date().toISOString()
            })
        }
    }

    return (
        <SocketContext.Provider
            value={{
                socket,
                isConnected,
                joinUserRoom,
                sendMessage,
                sendAIMessage,
                updateTaskStatus,
                notifyRoutineCreated,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}