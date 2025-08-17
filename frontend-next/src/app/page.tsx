import { AutoTyping } from "@/components/auto-typing";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Code,
  Play,
  Rocket,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
  Cpu,
  Shield,
  Globe,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  console.log("[v0] HomePage component rendering");

  const typingPhrases = [
    "JOIN to make great coding career",
    "Build real-world projects",
    "Compete with top developers",
    "Master algorithmic thinking",
    "Launch your tech career",
  ];

  const features = [
    {
      icon: Code,
      title: "Code Challenges",
      description:
        "Solve algorithmic problems and improve your programming skills with our extensive collection of coding challenges.",
      color: "text-blue-400",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Trophy,
      title: "Competitive Contests",
      description:
        "Participate in timed contests and compete with developers worldwide to climb the leaderboard.",
      color: "text-yellow-400",
      gradient: "from-yellow-500/20 to-orange-500/20",
    },
    {
      icon: Users,
      title: "Community Learning",
      description:
        "Join a vibrant community of developers, share solutions, and learn from each other's approaches.",
      color: "text-green-400",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: Zap,
      title: "Real-time Coding",
      description:
        "Practice with our advanced Monaco editor supporting multiple programming languages.",
      color: "text-purple-400",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: Target,
      title: "Skill Assessment",
      description:
        "Track your progress with detailed analytics and performance metrics across different topics.",
      color: "text-red-400",
      gradient: "from-red-500/20 to-rose-500/20",
    },
    {
      icon: Rocket,
      title: "Career Growth",
      description:
        "Build a strong portfolio and showcase your skills to potential employers and recruiters.",
      color: "text-indigo-400",
      gradient: "from-indigo-500/20 to-blue-500/20",
    },
  ];

  const stats = [
    { label: "Active Developers", value: "50K+", icon: Users },
    { label: "Coding Challenges", value: "1,200+", icon: Code },
    { label: "Contests Hosted", value: "500+", icon: Trophy },
    { label: "Success Stories", value: "10K+", icon: Star },
  ];

  const faqs = [
    {
      question: "What is HackathonPlus?",
      answer:
        "HackathonPlus is a comprehensive platform for developers to improve their coding skills through challenges, contests, and community interaction. We provide a professional environment for algorithmic problem-solving and career development.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply create an account, browse our collection of contests, and start participating. You can join contests, track your progress, and connect with other developers in our community.",
    },
    {
      question: "What programming languages are supported?",
      answer:
        "We support multiple programming languages including Java, Python, JavaScript, C++, and Ballerina. Our Monaco editor provides syntax highlighting and intelligent code completion for all supported languages.",
    },
    {
      question: "Are the contests free to participate?",
      answer:
        "Yes! All our contests and challenges are completely free. We believe in making quality coding education accessible to everyone, regardless of their background or financial situation.",
    },
    {
      question: "How does the leaderboard work?",
      answer:
        "Our leaderboard ranks users based on their performance in contests and challenges. Points are awarded for correct solutions, with bonus points for faster submissions and optimal solutions.",
    },
    {
      question: "Can I create my own challenges?",
      answer:
        "Only admin users can create and manage coding challenges. This ensures quality control and maintains the integrity of our platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/3 rounded-full blur-3xl animate-pulse delay-1500"></div>
        
        {/* Matrix-style Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        
        {/* Animated Circuit Lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M10,20 Q30,10 50,20 T90,20"
              stroke="url(#lineGradient)"
              strokeWidth="0.1"
              fill="none"
              className="animate-pulse"
            />
            <path
              d="M10,40 Q30,30 50,40 T90,40"
              stroke="url(#lineGradient)"
              strokeWidth="0.1"
              fill="none"
              className="animate-pulse delay-1000"
            />
            <path
              d="M10,60 Q30,50 50,60 T90,60"
              stroke="url(#lineGradient)"
              strokeWidth="0.1"
              fill="none"
              className="animate-pulse delay-2000"
            />
            <path
              d="M10,80 Q30,70 50,80 T90,80"
              stroke="url(#lineGradient)"
              strokeWidth="0.1"
              fill="none"
              className="animate-pulse delay-1500"
            />
          </svg>
        </div>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/40 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-accent/30 rounded-full animate-bounce delay-1500"></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-primary/25 rounded-full animate-bounce delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-accent/35 rounded-full animate-bounce delay-2500"></div>

        {/* Moving Data Streams */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-xs text-primary/20 font-mono whitespace-nowrap animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['01', '10', '11', '00', 'FF', 'AA', 'BB', 'CC'].join(' ')}
            </div>
          ))}
        </div>

        {/* Animated Hexagons */}
        <div className="absolute top-10 right-10 w-16 h-16 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,10 90,30 90,70 50,90 10,70 10,30"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              className="animate-spin"
              style={{ animationDuration: '20s' }}
            />
          </svg>
        </div>
        <div className="absolute bottom-20 left-20 w-12 h-12 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,10 90,30 90,70 50,90 10,70 10,30"
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="1"
              className="animate-spin"
              style={{ animationDuration: '15s', animationDirection: 'reverse' }}
            />
          </svg>
        </div>

        {/* Scanning Lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse delay-2000"></div>
        </div>

        {/* Glowing Corners */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-accent/10 to-transparent"></div>

        {/* Animated Rings */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 border border-primary/10 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-accent/10 rounded-full animate-ping" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/5 rounded-full animate-ping" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
        </div>

        {/* Floating Code Symbols */}
        <div className="absolute top-1/4 right-1/4 text-primary/10 text-2xl animate-bounce" style={{ animationDuration: '3s' }}>&lt;/&gt;</div>
        <div className="absolute bottom-1/4 left-1/4 text-accent/10 text-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>{'{}'}</div>
        <div className="absolute top-3/4 right-1/3 text-primary/10 text-lg animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>()</div>
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              🚀 Welcome to the Future of Coding
            </Badge>

            <div className="relative">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Code Your
                <span className="text-primary block relative">
                  Future
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl -z-10"></div>
                </span>
              </h1>
              
              {/* Animated underline */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
            </div>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Master algorithmic thinking, compete with top developers, and
              build the coding career of your dreams.
            </p>

            <div className="h-16 flex items-center justify-center">
              <div className="relative">
                <p className="text-lg md:text-xl text-accent font-medium">
                  <AutoTyping phrases={typingPhrases} />
                </p>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse"></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg relative overflow-hidden group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25"
                asChild
              >
                <Link href="/signup" className="relative z-10">
                  Start Coding Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg bg-transparent border-primary/30 hover:bg-primary/5 backdrop-blur-sm transition-all duration-300"
                asChild
              >
                <Link href="/contests" className="group">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Explore Contests
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/30 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="relative">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="absolute -top-2 -right-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">HackathonPlus</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to excel in your coding journey, all in one
              platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-primary/20 bg-card/50 backdrop-blur-sm relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <CardHeader className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-primary/20`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color} group-hover:animate-pulse`} />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your <span className="text-primary">Coding Career</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have already started their journey
            to coding excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg relative overflow-hidden group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25"
              asChild
            >
              <Link href="/signup" className="relative z-10">
                Get Started Free
                <Star className="ml-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg bg-transparent border-primary/30 hover:bg-primary/5 backdrop-blur-sm transition-all duration-300"
              asChild
            >
              <Link href="/contests">View Contests</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about HackathonPlus
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-primary/20 rounded-lg px-6 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors duration-300"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
}
