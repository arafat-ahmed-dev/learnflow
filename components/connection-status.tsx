"use client"

import { useSocket } from "@/lib/socket-context"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Wifi, WifiOff, Zap } from "lucide-react"

export function ConnectionStatus() {
    const { isConnected } = useSocket()

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant={isConnected ? "default" : "destructive"}
                        className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-300 hover:scale-105 ${isConnected
                            ? "bg-green-500 hover:bg-green-600 shadow-md"
                            : "bg-red-500 hover:bg-red-600"
                            }`}
                    >
                        <div className="relative">
                            {isConnected ? (
                                <>
                                    <Zap className="w-3.5 h-3.5" />
                                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-300 rounded-full animate-ping"></div>
                                </>
                            ) : (
                                <WifiOff className="w-3.5 h-3.5" />
                            )}
                        </div>
                        <span className="font-medium text-xs">
                            {isConnected ? "Live Updates" : "Offline"}
                        </span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-sm">
                        {isConnected
                            ? "✅ Real-time updates are active"
                            : "❌ Disconnected from real-time updates"
                        }
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}