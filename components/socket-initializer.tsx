"use client"

import { useEffect } from "react"
import useSocketAuth from "@/hooks/use-socket-auth"

export function SocketInitializer() {
    useSocketAuth()
    return null
}