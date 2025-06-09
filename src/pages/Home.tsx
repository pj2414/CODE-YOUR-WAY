import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Zap, Trophy, Users, ArrowRight } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Code,
      title: 'Interactive Code Editor',
      description: 'Write and test your code with our advanced Monaco editor supporting multiple languages.',
      color: 'neon-purple'
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Get immediate results and detailed explanations for your solutions.',
      color: 'neon-blue'
    },
    {
      icon: Trophy,
      title: 'Track Progress',
      description: 'Monitor your improvement with detailed analytics and achievement badges.',
      color: 'neon-green'
    },
    {
      icon: Users,
      title: 'Learn Together',
      description: 'Join a community of developers solving problems and sharing knowledge.',
      color: 'neon-pink'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-blue/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green bg-clip-text text-transparent">
                CYW
              </span>{' '}
              <span className="text-foreground hidden md:inline">- Code Your Way</span>{' '}
              <span className="bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple bg-clip-text text-transparent block md:inline mt-2 md:mt-0">
                to Success
              </span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
              Master algorithmic thinking with our comprehensive coding platform. 
              Practice, learn, and grow with problems designed to challenge and inspire.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/problems">
                  <Button size="lg" className="btn-primary text-lg px-8 py-3">
                    Continue Coding
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="btn-primary text-lg px-8 py-3">
                      Start Coding
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/problems">
                    <Button variant="outline" size="lg" className="btn-secondary text-lg px-8 py-3">
                      Browse Problems
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and resources you need to become a better programmer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-glass border border-white/10 text-center group">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r from-${feature.color} to-${feature.color}/70 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-neon-blue/10 to-neon-green/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Start Your Coding Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who are improving their skills every day.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="btn-primary text-lg px-8 py-3">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="btn-secondary text-lg px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
