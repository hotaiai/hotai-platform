"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  Flame,
  Plus,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Hash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Project {
  id: string
  name: string
  color: string
  chatCount: number
}

interface Chat {
  id: string
  title: string
  projectId: string | null
  updatedAt: string
}

const navigation = [
  { name: "새 채팅", href: "/chat", icon: MessageSquare },
  { name: "프롬프트", href: "/prompts", icon: BookOpen },
  { name: "사용량", href: "/usage", icon: BarChart3 },
  { name: "설정", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [projects, setProjects] = useState<Project[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  // Mock data - 실제로는 API에서 가져옴
  useEffect(() => {
    setProjects([
      { id: "1", name: "개인 프로젝트", color: "#3B82F6", chatCount: 5 },
      { id: "2", name: "업무", color: "#EF4444", chatCount: 3 },
      { id: "3", name: "학습", color: "#10B981", chatCount: 2 },
    ])
    
    setChats([
      { id: "1", title: "React 코드 리뷰", projectId: "1", updatedAt: "2024-01-20" },
      { id: "2", title: "API 설계", projectId: "1", updatedAt: "2024-01-19" },
      { id: "3", title: "보고서 작성", projectId: "2", updatedAt: "2024-01-18" },
      { id: "4", title: "일반 대화", projectId: null, updatedAt: "2024-01-17" },
    ])
  }, [])

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const projectChats = (projectId: string) => 
    chats.filter(chat => chat.projectId === projectId)

  const generalChats = chats.filter(chat => !chat.projectId)

  return (
    <div className="flex h-full w-64 flex-col bg-secondary">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Flame className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-white">HotAI</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="px-2 py-2">
        {navigation.slice(0, 1).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-secondary-light hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* Projects and Chats */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2">
          {/* Projects */}
          <div className="mt-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-gray-400 uppercase">프로젝트</span>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
            {projects.map((project) => (
              <div key={project.id} className="mt-1">
                <button
                  onClick={() => toggleProject(project.id)}
                  className="flex items-center w-full px-2 py-1.5 text-sm text-gray-300 hover:bg-secondary-light rounded-md"
                >
                  {expandedProjects.has(project.id) ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <Hash className="h-4 w-4 mr-1" style={{ color: project.color }} />
                  <span className="flex-1 text-left">{project.name}</span>
                  <span className="text-xs text-gray-500">{project.chatCount}</span>
                </button>
                {expandedProjects.has(project.id) && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {projectChats(project.id).map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/chat/${chat.id}`}
                        className="block px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-secondary-light rounded-md truncate"
                      >
                        {chat.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* General Chats */}
          {generalChats.length > 0 && (
            <div className="mt-4">
              <div className="px-2 py-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">일반 채팅</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {generalChats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="block px-2 py-1 text-sm text-gray-400 hover:text-white hover:bg-secondary-light rounded-md truncate"
                  >
                    {chat.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <nav className="space-y-1 px-2 py-4 border-t border-gray-700">
        {navigation.slice(1).map((item) => {
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