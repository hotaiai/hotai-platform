"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  Flame,
} from "lucide-react"

const navigation = [
  { name: "채팅", href: "/chat", icon: MessageSquare },
  { name: "프롬프트", href: "/prompts", icon: BookOpen },
  { name: "사용량", href: "/usage", icon: BarChart3 },
  { name: "설정", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-secondary">
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Flame className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-white">HotAI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-secondary-light hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}