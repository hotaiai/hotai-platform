import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, MessageSquare, BookOpen, BarChart3, Users, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">HotAI</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/features">
              <Button variant="ghost">기능</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost">요금제</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/register">
              <Button>시작하기</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              모든 AI를 한 곳에서
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              GPT-4, Claude, Gemini 등 최신 AI 모델을 하나의 플랫폼에서 사용하세요.
              비교하고, 선택하고, 최적의 결과를 얻으세요.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  무료로 시작하기
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  데모 보기
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <MessageSquare className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>멀티 AI 채팅</CardTitle>
                  <CardDescription>
                    여러 AI 모델과 동시에 대화하고 최적의 답변을 선택하세요
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>프롬프트 라이브러리</CardTitle>
                  <CardDescription>
                    검증된 프롬프트를 저장하고 팀과 공유하세요
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>사용량 분석</CardTitle>
                  <CardDescription>
                    AI 사용량과 비용을 실시간으로 모니터링하세요
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>팀 협업</CardTitle>
                  <CardDescription>
                    워크스페이스에서 팀원들과 AI 경험을 공유하세요
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>빠른 응답</CardTitle>
                  <CardDescription>
                    스트리밍 응답으로 즉각적인 피드백을 받으세요
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Flame className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>뜨거운 인사이트</CardTitle>
                  <CardDescription>
                    AI 모델별 성능을 비교하고 최적의 선택을 하세요
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-primary text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              지금 시작하고 AI의 모든 가능성을 경험하세요
            </h2>
            <p className="text-xl mb-8 opacity-90">
              매월 10,000 토큰 무료 제공 • 신용카드 불필요
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                무료로 시작하기
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 HotAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}