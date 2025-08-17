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
    },
    {
      icon: Trophy,
      title: "Competitive Contests",
      description:
        "Participate in timed contests and compete with developers worldwide to climb the leaderboard.",
      color: "text-yellow-400",
    },
    {
      icon: Users,
      title: "Community Learning",
      description:
        "Join a vibrant community of developers, share solutions, and learn from each other's approaches.",
      color: "text-green-400",
    },
    {
      icon: Zap,
      title: "Real-time Coding",
      description:
        "Practice with our advanced Monaco editor supporting multiple programming languages.",
      color: "text-purple-400",
    },
    {
      icon: Target,
      title: "Skill Assessment",
      description:
        "Track your progress with detailed analytics and performance metrics across different topics.",
      color: "text-red-400",
    },
    {
      icon: Rocket,
      title: "Career Growth",
      description:
        "Build a strong portfolio and showcase your skills to potential employers and recruiters.",
      color: "text-indigo-400",
    },
  ];

  const stats = [
    { label: "Active Developers", value: "50K+" },
    { label: "Coding Challenges", value: "1,200+" },
    { label: "Contests Hosted", value: "500+" },
    { label: "Success Stories", value: "10K+" },
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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              🚀 Welcome to the Future of Coding
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Code Your
              <span className="text-primary block">Future</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Master algorithmic thinking, compete with top developers, and
              build the coding career of your dreams.
            </p>

            <div className="h-16 flex items-center justify-center">
              <p className="text-lg md:text-xl text-accent font-medium">
                <AutoTyping phrases={typingPhrases} />
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8 py-4 text-lg" asChild>
                <Link href="/signup">
                  Start Coding Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg bg-transparent"
                asChild
              >
                <Link href="/contests">
                  <Play className="mr-2 h-5 w-5" />
                  Explore Contests
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose HackathonPlus?
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
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-card flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Coding Career?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have already started their journey
            to coding excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-4 text-lg" asChild>
              <Link href="/signup">
                Get Started Free
                <Star className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg bg-transparent"
              asChild
            >
              <Link href="/contests">View Contests</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
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
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
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
