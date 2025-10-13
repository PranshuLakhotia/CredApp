'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Chip,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import { 
  ArrowRight, 
  Shield, 
  Award, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Star,
  Globe,
  Zap,
  Target,
  Sparkles,
  FileCheck,
  Brain,
  Workflow,
  Building2,
  GraduationCap,
  Briefcase,
  ChevronDown,
  Upload,
  Search,
  Download,
  Check,
  ArrowUpRight,
  Play,
  Lock,
  Layers,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingAnimation from '@/components/LoadingAnimation';

const LandingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    // Show loader for 2 seconds
    const loadTimer = setTimeout(() => {
      setLoading(false);
      setVisible(true);
    }, 2000);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    
    return () => {
      clearTimeout(loadTimer);
      clearInterval(interval);
    };
  }, []);

  // Show loading animation
  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a'
      }}>
        <Box sx={{ maxWidth: '400px', width: '100%' }}>
          <LoadingAnimation />
        </Box>
      </Box>
    );
  }

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Credentials",
      description: "Blockchain-verified digital certificates with tamper-proof security",
      color: "#2563eb"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "NSQF Aligned",
      description: "All credentials mapped to National Skills Qualification Framework",
      color: "#3b82f6"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Stakeholder",
      description: "Connect learners, employers, and institutions seamlessly",
      color: "#60a5fa"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "AI-Powered Insights",
      description: "Personalized learning recommendations and career pathways",
      color: "#0ea5e9"
    }
  ];

  const stats = [
    { value: "50K+", label: "Active Users", icon: <Users className="w-5 h-5" /> },
    { value: "100K+", label: "Credentials Issued", icon: <Award className="w-5 h-5" /> },
    { value: "500+", label: "Partner Institutions", icon: <Building2 className="w-5 h-5" /> },
    { value: "98%", label: "Satisfaction Rate", icon: <Star className="w-5 h-5" /> }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Upload Credentials",
      description: "Institutions upload certificates and qualifications to our secure platform",
      icon: <Upload className="w-6 h-6" />
    },
    {
      step: "02",
      title: "Blockchain Verification",
      description: "Credentials are cryptographically signed and stored on blockchain",
      icon: <FileCheck className="w-6 h-6" />
    },
    {
      step: "03",
      title: "AI Analysis",
      description: "Machine learning algorithms map credentials to NSQF standards",
      icon: <Brain className="w-6 h-6" />
    },
    {
      step: "04",
      title: "Instant Access",
      description: "Learners and employers can verify and share credentials instantly",
      icon: <Download className="w-6 h-6" />
    }
  ];

  const useCases = [
    {
      icon: <GraduationCap className="w-10 h-10" />,
      title: "Educational Institutions",
      description: "Issue tamper-proof digital degrees, certificates, and transcripts",
      benefits: ["Reduce administrative costs", "Prevent certificate fraud", "Enhance reputation"],
      color: "#2563eb"
    },
    {
      icon: <Briefcase className="w-10 h-10" />,
      title: "Employers",
      description: "Instantly verify candidate credentials and skills",
      benefits: ["Faster hiring process", "Reduce verification costs", "Access skill analytics"],
      color: "#3b82f6"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Learners",
      description: "Own and control your digital credential portfolio",
      benefits: ["Lifelong credential storage", "Share instantly", "Career recommendations"],
      color: "#60a5fa"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Priya Sharma",
      role: "Dean, IIT Delhi",
      company: "Indian Institute of Technology",
      avatar: "PS",
      rating: 5,
      text: "Credify has revolutionized how we issue and manage digital credentials. The blockchain security gives our students and alumni complete confidence.",
      color: "#2563eb"
    },
    {
      name: "Rajesh Kumar",
      role: "HR Director",
      company: "Tech Mahindra",
      avatar: "RK",
      rating: 5,
      text: "We've reduced our credential verification time by 95%. The AI-powered skill matching has been a game-changer for our recruitment process.",
      color: "#3b82f6"
    },
    {
      name: "Ananya Desai",
      role: "Software Engineer",
      company: "Recent Graduate",
      avatar: "AD",
      rating: 5,
      text: "Having all my credentials in one place with instant sharing capability made my job search so much easier. Employers love the verified badges!",
      color: "#60a5fa"
    }
  ];

  const integrations = [
    { name: "NSQF", logo: "N" },
    { name: "DigiLocker", logo: "D" },
    { name: "AICTE", logo: "A" },
    { name: "UGC", logo: "U" },
    { name: "LinkedIn", logo: "L" },
    { name: "NPTEL", logo: "NP" },
    { name: "Coursera", logo: "C" },
    { name: "Udacity", logo: "UD" }
  ];

  const comparisonData = [
    {
      feature: "Blockchain Security",
      credify: true,
      traditional: false
    },
    {
      feature: "Instant Verification",
      credify: true,
      traditional: false
    },
    {
      feature: "NSQF Mapping",
      credify: true,
      traditional: false
    },
    {
      feature: "AI Recommendations",
      credify: true,
      traditional: false
    },
    {
      feature: "Lifetime Access",
      credify: true,
      traditional: false
    },
    {
      feature: "Multi-Platform Sharing",
      credify: true,
      traditional: false
    }
  ];

  const faqs = [
    {
      question: "What is Credify and how does it work?",
      answer: "Credify is a blockchain-powered digital credential platform that allows institutions to issue, learners to store, and employers to verify educational credentials instantly. We use blockchain technology for security and AI for intelligent credential mapping to NSQF standards."
    },
    {
      question: "Is my data secure on Credify?",
      answer: "Absolutely. We use enterprise-grade encryption and blockchain technology to ensure your credentials are tamper-proof and secure. Your data is stored with multiple layers of security and you maintain complete control over who can access your credentials."
    },
    {
      question: "How do employers verify credentials?",
      answer: "Employers can instantly verify any credential shared through Credify by clicking on the verification link or scanning the QR code. The blockchain verification happens in real-time and shows the complete authenticity trail."
    },
    {
      question: "What is NSQF alignment?",
      answer: "NSQF (National Skills Qualifications Framework) is India's national framework for skills and qualifications. Credify automatically maps your credentials to NSQF levels, making it easier for employers to understand your skill levels."
    },
    {
      question: "How much does Credify cost?",
      answer: "We offer flexible pricing for institutions, free accounts for learners, and pay-per-verification for employers. Contact our sales team for detailed pricing information tailored to your needs."
    },
    {
      question: "Can I integrate Credify with existing systems?",
      answer: "Yes! Credify offers comprehensive APIs and pre-built integrations with popular student information systems, HR platforms, and learning management systems. Our technical team provides full support during integration."
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#0a0a0a',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Grid Background */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(37, 99, 235, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(37, 99, 235, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite',
        '@keyframes gridMove': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(50px)' }
        }
      }} />

      {/* Gradient Orbs */}
      <Box sx={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
        top: '-300px',
        left: '-300px',
        animation: 'float 15s ease-in-out infinite',
        filter: 'blur(60px)',
        '@keyframes float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(50px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.9)' }
        }
      }} />

      <Box sx={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        bottom: '-250px',
        right: '-250px',
        animation: 'float 20s ease-in-out infinite reverse',
        filter: 'blur(60px)'
      }} />

      <Box sx={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%)',
        top: '50%',
        right: '10%',
        animation: 'float 18s ease-in-out infinite',
        filter: 'blur(60px)'
      }} />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            borderRadius: '50%',
            background: `rgba(37, 99, 235, ${Math.random() * 0.5 + 0.2})`,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `particle${i % 3} ${Math.random() * 10 + 10}s linear infinite`,
            '@keyframes particle0': {
              '0%, 100%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(-50px, -100px)' }
            },
            '@keyframes particle1': {
              '0%, 100%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(50px, 100px)' }
            },
            '@keyframes particle2': {
              '0%, 100%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(-100px, 50px)' }
            }
          }}
        />
      ))}

      {/* Header */}
      <Box sx={{ 
        position: 'sticky',
        top: 0,
        zIndex: 100,
        py: 3,
        px: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(37, 99, 235, 0.1)',
        background: 'rgba(10, 10, 10, 0.8)'
      }}>
        <Fade in={visible} timeout={1000}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)'
            }
          }}>
            <Box sx={{
              width: 50,
              height: 50,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 3s infinite'
              },
              '@keyframes shimmer': {
                '0%': { left: '-100%' },
                '100%': { left: '100%' }
              }
            }}>
              C
            </Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '1px'
            }}>
              Credify
            </Typography>
          </Box>
        </Fade>

        <Fade in={visible} timeout={1200}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/auth/login')}
              sx={{
                color: 'rgba(255,255,255,0.9)',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                borderWidth: '2px',
                px: 3,
                py: 1,
                fontWeight: 600,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), transparent)',
                  transition: 'left 0.5s ease'
                },
                '&:hover': {
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  transform: 'translateY(-2px)',
                  '&::before': {
                    left: '100%'
                  }
                },
                transition: 'all 0.3s ease'
              }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push('/auth/register')}
              sx={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                color: 'white',
                px: 3,
                py: 1,
                fontWeight: 600,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '0',
                  height: '0',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'translate(-50%, -50%)',
                  transition: 'width 0.6s ease, height 0.6s ease'
                },
                '&:hover': {
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 8px 30px rgba(139, 92, 246, 0.6)',
                  '&::before': {
                    width: '300px',
                    height: '300px'
                  }
                },
                transition: 'all 0.3s ease'
              }}
            >
              Get Started
            </Button>
          </Box>
        </Fade>
      </Box>

      {/* Hero Section - IMPROVED WITH BETTER SPACE UTILIZATION */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, py: { xs: 8, md: 10 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* Left Content - 50% */}
          <Grid item xs={12} md={6} {...({} as any)}>
            <Slide direction="right" in={visible} timeout={1000}>
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: '50px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    mb: 3,
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.4)' },
                      '50%': { boxShadow: '0 0 0 8px rgba(139, 92, 246, 0)' }
                    }
                  }}>
                    <Sparkles size={16} color="#8b5cf6" />
                    <Typography sx={{ 
                      color: '#8b5cf6',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}>
                      Next-Gen Credentialing
                    </Typography>
                  </Box>
                </Box>
                
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 900,
                    color: 'rgba(255,255,255,0.95)',
                    mb: 3,
                    fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    '& span': {
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'gradientShift 5s ease infinite',
                      display: 'inline-block'
                    },
                    '@keyframes gradientShift': {
                      '0%, 100%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' }
                    }
                  }}
                >
                  Your Digital
                  <br />
                  <span>Credential Platform</span>
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    mb: 4,
                    lineHeight: 1.7,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    maxWidth: { xs: '100%', md: '90%' }
                  }}
                >
                  Secure, verify, and showcase your skills with blockchain-powered 
                  digital credentials. Join the future of professional certification.
                </Typography>

                <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, flexWrap: 'wrap', mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowRight />}
                    onClick={() => router.push('/auth/register')}
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      px: { xs: 3, sm: 4 },
                      py: { xs: 1.5, sm: 1.8 },
                      fontSize: { xs: '0.95rem', sm: '1.05rem' },
                      fontWeight: 700,
                      borderRadius: '50px',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '& .MuiButton-endIcon': {
                        transition: 'transform 0.3s ease'
                      },
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 12px 48px rgba(139, 92, 246, 0.6)',
                        '&::before': {
                          opacity: 1
                        },
                        '& .MuiButton-endIcon': {
                          transform: 'translateX(5px)'
                        }
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Start Your Journey
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Play />}
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      borderColor: 'rgba(139, 92, 246, 0.4)',
                      borderWidth: '2px',
                      px: { xs: 3, sm: 4 },
                      py: { xs: 1.5, sm: 1.8 },
                      fontSize: { xs: '0.95rem', sm: '1.05rem' },
                      fontWeight: 700,
                      borderRadius: '50px',
                      background: 'rgba(139, 92, 246, 0.05)',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '0',
                        height: '0',
                        borderRadius: '50%',
                        background: 'rgba(139, 92, 246, 0.2)',
                        transform: 'translate(-50%, -50%)',
                        transition: 'width 0.6s ease, height 0.6s ease'
                      },
                      '&:hover': {
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        transform: 'translateY(-3px)',
                        '&::before': {
                          width: '400px',
                          height: '400px'
                        }
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Watch Demo
                  </Button>
                </Box>

                {/* Stats Grid - Improved */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} sm={6} md={3} key={index} {...({} as any)}>
                      <Box sx={{
                        background: 'rgba(17, 17, 17, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '16px',
                        p: 2.5,
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          borderColor: '#8b5cf6',
                          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
                        },
                        '@keyframes fadeInUp': {
                          from: {
                            opacity: 0,
                            transform: 'translateY(20px)'
                          },
                          to: {
                            opacity: 1,
                            transform: 'translateY(0)'
                          }
                        }
                      }}>
                        <Box sx={{ 
                          color: '#8b5cf6',
                          mb: 1.5,
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                          {stat.icon}
                        </Box>
                        <Typography sx={{
                          fontSize: { xs: '1.4rem', sm: '1.6rem' },
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 0.5
                        }}>
                          {stat.value}
                        </Typography>
                        <Typography sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          color: 'rgba(255,255,255,0.6)',
                          fontWeight: 500
                        }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Slide>
          </Grid>

          {/* Right Content - 50% - IMPROVED VISUAL */}
          <Grid item xs={12} md={6} {...({} as any)}>
            <Zoom in={visible} timeout={1200}>
              <Box sx={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                mt: { xs: 4, md: 0 }
              }}>
                {/* Main Credential Card */}
                <Box sx={{
                  width: '100%',
                  maxWidth: { xs: '50%', sm: 450, md: 500 },
                  position: 'relative'
                }}>
                  {/* Animated Feature Cards */}
                  <Box sx={{ position: 'relative', height: { xs: 400, sm: 450 } }}>
                    {features.map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          left: '5%',
                          top: '50%',
                          transform: `translateY(-50%) translateX(${(index - activeFeature) * 100}%)`,
                          opacity: index === activeFeature ? 1 : 0.3,
                          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          pointerEvents: index === activeFeature ? 'auto' : 'none'
                        }}
                      >
                        <Box sx={{
                          background: `linear-gradient(135deg, 
                            rgba(139, 92, 246, ${index === activeFeature ? 0.2 : 0.1}),
                            rgba(236, 72, 153, ${index === activeFeature ? 0.15 : 0.05})
                          )`,
                          backdropFilter: 'blur(20px)',
                          border: `2px solid ${index === activeFeature ? feature.color : 'rgba(139, 92, 246, 0.2)'}`,
                          borderRadius: { xs: '24px', sm: '32px' },
                          p: { xs: 3, sm: 4, md: 5 },
                          textAlign: 'center',
                          transition: 'all 0.5s ease',
                          boxShadow: index === activeFeature ? `0 30px 60px ${feature.color}40` : 'none',
                          transform: index === activeFeature ? 'scale(1)' : 'scale(0.95)'
                        }}>
                          {/* Icon */}
                          <Box sx={{
                            width: { xs: 80, sm: 90, md: 100 },
                            height: { xs: 80, sm: 90, md: 100 },
                            margin: { xs: '0 auto 2rem', md: '0 auto 3rem' },
                            borderRadius: { xs: '20px', sm: '24px' },
                            background: `${feature.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: feature.color,
                            transform: index === activeFeature ? 'scale(1) rotate(0deg)' : 'scale(0.8)',
                            transition: 'all 0.5s ease',
                            boxShadow: index === activeFeature ? `0 20px 40px ${feature.color}30` : 'none'
                          }}>
                            {React.cloneElement(feature.icon, { 
                              className: 'w-12 h-12',
                              style: { 
                                filter: index === activeFeature ? `drop-shadow(0 0 10px ${feature.color})` : 'none'
                              }
                            })}
                          </Box>

                          {/* Content */}
                          <Typography sx={{
                            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                            fontWeight: 400,
                            color: 'rgba(255,255,255,0.95)',
                            mb: 2
                          }}>
                            {feature.title}
                          </Typography>

                          <Typography sx={{
                            fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                            color: 'rgba(255,255,255,0.7)',
                            lineHeight: 1.7
                          }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Feature Indicators */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mt: 3
                  }}>
                    {features.map((feature, index) => (
                      <Box
                        key={index}
                        onClick={() => setActiveFeature(index)}
                        sx={{
                          width: index === activeFeature ? 40 : 12,
                          height: 12,
                          borderRadius: '6px',
                          background: index === activeFeature ? feature.color : 'rgba(139, 92, 246, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: feature.color,
                            transform: 'scale(1.1)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Zoom>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={1500}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#8b5cf6',
              mb: 2,
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Features
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Why Choose Credify?
            </Typography>
            <Typography sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1.1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}>
              Experience the next generation of digital credentialing with cutting-edge technology
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} {...({} as any)}>
              <Slide 
                direction="up" 
                in={visible} 
                timeout={1000 + index * 200}
              >
                <Card sx={{
                  height: '100%',
                  background: 'rgba(17, 17, 17, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '24px',
                  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at 50% 0%, ${feature.color}20, transparent 70%)`,
                    opacity: 0,
                    transition: 'opacity 0.5s ease'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: `conic-gradient(from 0deg, transparent, ${feature.color}40, transparent 60deg)`,
                    opacity: 0,
                    transition: 'opacity 0.5s ease, transform 0.5s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-15px) scale(1.02)',
                    boxShadow: `0 30px 60px ${feature.color}40`,
                    borderColor: feature.color,
                    '&::before': {
                      opacity: 1
                    },
                    '&::after': {
                      opacity: 1,
                      animation: 'rotate 4s linear infinite'
                    },
                    '& .feature-icon': {
                      transform: 'scale(1.2) rotate(5deg)',
                      filter: `drop-shadow(0 10px 20px ${feature.color})`
                    }
                  },
                  '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}>
                  <CardContent sx={{ p: { xs: 3, sm: 3.5, md: 4 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <Box sx={{ 
                      color: feature.color,
                      mb: 3,
                      display: 'flex',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                      className="feature-icon"
                    >
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.95)',
                        mb: 2,
                        fontWeight: 700,
                        fontSize: '1.2rem'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.7,
                        fontSize: '0.95rem'
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={1500}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#ec4899',
              mb: 2,
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Process
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                mb: 2,
                lineHeight: 1.2
              }}
            >
              How It Works
            </Typography>
            <Typography sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1.1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}>
              Simple, secure, and seamless credential management in four steps
            </Typography>
          </Box>
        </Fade>

        <Box sx={{ position: 'relative', py: 4 }}>
          {/* Connection Lines */}
          <Box sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: '50%',
            left: '12%',
            right: '12%',
            height: '2px',
            background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4, #10b981)',
            transform: 'translateY(-50%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation: 'flowLine 3s linear infinite'
            },
            '@keyframes flowLine': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' }
            }
          }} />

          <Grid container spacing={4}>
            {howItWorks.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} {...({} as any)}>
                <Fade in={visible} timeout={1500 + index * 200}>
                  <Box sx={{
                    textAlign: 'center',
                    position: 'relative'
                  }}>
                    {/* Step Number Circle */}
                    <Box sx={{
                      width: { xs: 100, sm: 110, md: 120 },
                      height: { xs: 100, sm: 110, md: 120 },
                      margin: { xs: '0 auto 1.5rem', md: '0 auto 2rem' },
                      borderRadius: '50%',
                      background: 'rgba(17, 17, 17, 0.8)',
                      border: '2px solid',
                      borderColor: index === 0 ? '#8b5cf6' : index === 1 ? '#ec4899' : index === 2 ? '#06b6d4' : '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -10,
                        borderRadius: '50%',
                        background: `conic-gradient(from 0deg, ${index === 0 ? '#8b5cf6' : index === 1 ? '#ec4899' : index === 2 ? '#06b6d4' : '#10b981'}, transparent)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&:hover': {
                        transform: 'scale(1.1) translateY(-10px)',
                        boxShadow: `0 20px 40px ${index === 0 ? '#8b5cf6' : index === 1 ? '#ec4899' : index === 2 ? '#06b6d4' : '#10b981'}40`,
                        '&::before': {
                          opacity: 1,
                          animation: 'rotate 2s linear infinite'
                        }
                      }
                    }}>
                      <Box sx={{ 
                        color: index === 0 ? '#8b5cf6' : index === 1 ? '#ec4899' : index === 2 ? '#06b6d4' : '#10b981',
                        position: 'relative',
                        zIndex: 1
                      }}>
                        {step.icon}
                      </Box>
                    </Box>

                    {/* Step Number */}
                    <Typography sx={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: index === 0 ? '#8b5cf6' : index === 1 ? '#ec4899' : index === 2 ? '#06b6d4' : '#10b981',
                      mb: 1,
                      letterSpacing: '2px'
                    }}>
                      STEP {step.step}
                    </Typography>

                    {/* Step Title */}
                    <Typography sx={{
                      fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.95)',
                      mb: 2
                    }}>
                      {step.title}
                    </Typography>

                    {/* Step Description */}
                    <Typography sx={{
                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: 1.7
                    }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>


     {/* Verification Methods Section - SIMPLIFIED VERSION */}
<Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
  <Fade in={visible} timeout={1500}>
    <Box sx={{ textAlign: 'center', mb: 8 }}>
      <Typography sx={{
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#10b981',
        mb: 2,
        letterSpacing: '2px',
        textTransform: 'uppercase'
      }}>
        Verification
      </Typography>
      <Typography 
        variant="h2" 
        sx={{ 
          color: 'rgba(255,255,255,0.95)', 
          fontWeight: 800,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
          mb: 2,
          lineHeight: 1.2
        }}
      >
        Identity Verification
      </Typography>
      <Typography sx={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '1.1rem',
        maxWidth: '700px',
        mx: 'auto'
      }}>
        Secure multi-layer verification for learners and institutions
      </Typography>
    </Box>
  </Fade>

  <Box sx={{ 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: 3,
    justifyContent: 'center'
  }}>
    {[
      {
        icon: <FileCheck className="w-6 h-6" />,
        title: "Aadhaar",
        description: "OTP verification",
        color: "#10b981",
        tag: "Learners"
      },
      {
        icon: <Award className="w-6 h-6" />,
        title: "PAN Card",
        description: "Financial validation",
        color: "#06b6d4",
        tag: "Learners"
      },
      {
        icon: <Users className="w-6 h-6" />,
        title: "Face Recognition",
        description: "Biometric security",
        color: "#8b5cf6",
        tag: "Learners"
      },
      {
        icon: <Lock className="w-6 h-6" />,
        title: "DigiLocker",
        description: "Document integration",
        color: "#ec4899",
        tag: "Learners"
      },
      {
        icon: <Shield className="w-6 h-6" />,
        title: "GSTIN",
        description: "Institution verification",
        color: "#f59e0b",
        tag: "Issuers"
      }
    ].map((method, index) => (
      <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 18%' }, minWidth: { xs: '100%', sm: '200px', md: '180px' }, maxWidth: { xs: '100%', md: '220px' } }}>
        <Zoom in={visible} timeout={1500 + index * 100}>
          <Card sx={{
            height: '100%',
            background: 'rgba(17, 17, 17, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: { xs: '16px', sm: '18px', md: '20px' },
            p: { xs: 2.5, sm: 3 },
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: method.color,
              opacity: 0,
              transition: 'opacity 0.3s ease'
            },
            '&:hover': {
              transform: 'translateY(-10px)',
              borderColor: method.color,
              boxShadow: `0 15px 40px ${method.color}30`,
              '&::before': {
                opacity: 1
              },
              '& .verification-icon': {
                transform: 'scale(1.15)',
                background: method.color
              }
            }
          }}>
            {/* Tag */}
            <Box sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.5,
              borderRadius: '50px',
              background: `${method.color}20`,
              mb: 2
            }}>
              <Typography sx={{
                fontSize: '0.7rem',
                color: method.color,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {method.tag}
              </Typography>
            </Box>

            {/* Icon */}
            <Box 
              className="verification-icon"
              sx={{
                width: 50,
                height: 50,
                borderRadius: '12px',
                background: `${method.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: method.color,
                mb: 2,
                transition: 'all 0.3s ease'
              }}
            >
              {method.icon}
            </Box>

            {/* Title */}
            <Typography sx={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.95)',
              mb: 0.5
            }}>
              {method.title}
            </Typography>

            {/* Description */}
            <Typography sx={{
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.5
            }}>
              {method.description}
            </Typography>
          </Card>
        </Zoom>
      </Box>
    ))}
  </Box>

  {/* Trust Badge */}
  <Fade in={visible} timeout={2000}>
    <Box sx={{
      mt: 6,
      textAlign: 'center',
      p: 3,
      background: 'rgba(17, 17, 17, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '16px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      mx: 'auto',
      width: 'auto',
      position: 'relative',
      left: '50%',
      transform: 'translateX(-50%)'
    }}>
      <CheckCircle size={20} color="#10b981" />
      <Typography sx={{
        fontSize: '0.95rem',
        color: 'rgba(255,255,255,0.8)'
      }}>
        <Box component="span" sx={{ color: '#10b981', fontWeight: 700 }}>
          Government-approved
        </Box>
        {' '}verification methods trusted by 500+ institutions
      </Typography>
    </Box>
  </Fade>
</Container>



      {/* Use Cases Section - ALL IN ONE ROW */}
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={1500}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#06b6d4',
              mb: 2,
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Use Cases
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Built for Everyone
            </Typography>
            <Typography sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1.1rem',
              maxWidth: '700px',
              mx: 'auto'
            }}>
              Whether you're an institution, employer, or learner, Credify has the perfect solution
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} md={4} key={index} {...({} as any)}>
              <Zoom in={visible} timeout={1500 + index * 200}>
                <Card sx={{
                  height: '100%',
                  background: 'rgba(17, 17, 17, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: { xs: '20px', sm: '24px' },
                  p: { xs: 3, sm: 3.5, md: 4 },
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${useCase.color}, transparent)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    borderColor: useCase.color,
                    boxShadow: `0 20px 50px ${useCase.color}30`,
                    '&::before': {
                      opacity: 1
                    },
                    '& .use-case-icon': {
                      transform: 'scale(1.1) rotate(5deg)'
                    }
                  }
                }}>
                  <Box sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '18px',
                    background: `${useCase.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    color: useCase.color,
                    transition: 'all 0.3s ease'
                  }}
                    className="use-case-icon"
                  >
                    {useCase.icon}
                  </Box>

                  <Typography sx={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.95)',
                    mb: 2
                  }}>
                    {useCase.title}
                  </Typography>

                  <Typography sx={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.7,
                    mb: 3
                  }}>
                    {useCase.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {useCase.benefits.map((benefit, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: `${useCase.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Check size={12} color={useCase.color} />
                        </Box>
                        <Typography sx={{
                          fontSize: '0.9rem',
                          color: 'rgba(255,255,255,0.7)'
                        }}>
                          {benefit}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section - REDESIGNED WITH TILT CARDS */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={1500}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#10b981',
              mb: 2,
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Testimonials
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Loved by Thousands
            </Typography>
            <Typography sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1.1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}>
              See what our users have to say about their experience
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index} {...({} as any)}>
              <Fade in={visible} timeout={1700 + index * 200}>
                <Card sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, rgba(17, 17, 17, 0.8), rgba(17, 17, 17, 0.6))`,
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${testimonial.color}30`,
                  borderRadius: { xs: '24px', sm: '28px', md: '32px' },
                  p: { xs: 3, sm: 3.5, md: 4 },
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    background: `radial-gradient(circle at 50% 0%, ${testimonial.color}15, transparent 60%)`,
                    opacity: 0,
                    transition: 'opacity 0.5s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-15px) rotateZ(2deg)',
                    borderColor: testimonial.color,
                    boxShadow: `0 30px 70px ${testimonial.color}40`,
                    '&::before': {
                      opacity: 1
                    }
                  }
                }}>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Quote Icon */}
                    <Box sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '12px',
                      background: `${testimonial.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3
                    }}>
                      <Typography sx={{
                        fontSize: '2rem',
                        color: testimonial.color,
                        fontWeight: 800,
                        lineHeight: 1
                      }}>
                        "
                      </Typography>
                    </Box>

                    {/* Star Rating */}
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 3 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          fill={testimonial.color} 
                          color={testimonial.color}
                          style={{
                            animation: `starPop 0.5s ease ${i * 0.1}s both`
                          }}
                        />
                      ))}
                    </Box>

                    {/* Testimonial Text */}
                    <Typography sx={{
                      fontSize: '1.05rem',
                      color: 'rgba(255,255,255,0.85)',
                      lineHeight: 1.8,
                      mb: 4,
                      fontStyle: 'italic'
                    }}>
                      "{testimonial.text}"
                    </Typography>

                    {/* Author Info */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      pt: 3,
                      borderTop: `1px solid ${testimonial.color}20`
                    }}>
                      <Avatar sx={{
                        width: 55,
                        height: 55,
                        background: `linear-gradient(135deg, ${testimonial.color}, ${testimonial.color}80)`,
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        boxShadow: `0 8px 24px ${testimonial.color}40`
                      }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography sx={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.95)',
                          mb: 0.3
                        }}>
                          {testimonial.name}
                        </Typography>
                        <Typography sx={{
                          fontSize: '0.85rem',
                          color: 'rgba(255,255,255,0.6)',
                          mb: 0.3
                        }}>
                          {testimonial.role}
                        </Typography>
                        <Typography sx={{
                          fontSize: '0.8rem',
                          color: testimonial.color,
                          fontWeight: 600
                        }}>
                          {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Integrations Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={1500}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#8b5cf6',
              mb: 2,
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Integrations
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '3rem' },
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Seamlessly Integrated
            </Typography>
            <Typography sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}>
              Works with all your favorite platforms and services
            </Typography>
          </Box>
        </Fade>

        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {integrations.map((integration, index) => (
            <Zoom in={visible} timeout={1800 + index * 100} key={index}>
              <Box sx={{
                width: { xs: 90, sm: 95, md: 100 },
                height: { xs: 90, sm: 95, md: 100 },
                borderRadius: { xs: '16px', sm: '18px', md: '20px' },
                background: 'rgba(17, 17, 17, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-10px) scale(1.05)',
                  borderColor: '#8b5cf6',
                  boxShadow: '0 15px 40px rgba(139, 92, 246, 0.3)',
                  background: 'rgba(139, 92, 246, 0.1)'
                }
              }}>
                <Box sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.2rem'
                }}>
                  {integration.logo}
                </Box>
                <Typography sx={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600
                }}>
                  {integration.name}
                </Typography>
              </Box>
            </Zoom>
          ))}
        </Box>
      </Container>

      {/* Comparison Table Section */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={1500}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#ec4899',
              mb: 2,
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Comparison
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '3rem' },
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Credify vs Traditional
            </Typography>
          </Box>
        </Fade>

        <Fade in={visible} timeout={2000}>
          <Box sx={{
            background: 'rgba(17, 17, 17, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '24px',
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              background: 'rgba(139, 92, 246, 0.1)',
              borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
              p: 3
            }}>
              <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
                Feature
              </Typography>
              <Typography sx={{ fontWeight: 700, color: '#8b5cf6', textAlign: 'center' }}>
                Credify
              </Typography>
              <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                Traditional
              </Typography>
            </Box>

            {/* Table Rows */}
            {comparisonData.map((row, index) => (
              <Box
                key={index}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  p: 3,
                  borderBottom: index < comparisonData.length - 1 ? '1px solid rgba(139, 92, 246, 0.1)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.05)'
                  }
                }}
              >
                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {row.feature}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {row.credify ? (
                    <CheckCircle size={24} color="#10b981" />
                  ) : (
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {row.traditional ? (
                    <CheckCircle size={24} color="#10b981" />
                  ) : (
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Fade>
      </Container>

      {/* FAQ Section */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={1500}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#06b6d4',
              mb: 2,
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              FAQ
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '3rem' },
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}>
              Find answers to common questions about Credify
            </Typography>
          </Box>
        </Fade>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {faqs.map((faq, index) => (
            <Fade in={visible} timeout={1800 + index * 100} key={index}>
              <Accordion
                sx={{
                  background: 'rgba(17, 17, 17, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '16px !important',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    margin: '0 !important',
                    borderColor: '#8b5cf6'
                  },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#8b5cf6',
                    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.2)'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDown color="rgba(255,255,255,0.7)" />}
                  sx={{
                    px: 3,
                    py: 2,
                    '& .MuiAccordionSummary-content': {
                      my: 1
                    }
                  }}
                >
                  <Typography sx={{
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.95)',
                    fontSize: '1.1rem'
                  }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3 }}>
                  <Typography sx={{
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.8,
                    fontSize: '0.95rem'
                  }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Fade>
          ))}
        </Box>
      </Container>

      {/* Final CTA Section */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={2000}>
          <Box sx={{
            textAlign: 'center',
            background: 'rgba(17, 17, 17, 0.6)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: { xs: '24px', sm: '28px', md: '32px' },
            p: { xs: 3, sm: 5, md: 6, lg: 8 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(139, 92, 246, 0.1) 90deg, transparent 180deg)',
              animation: 'rotateBorder 8s linear infinite'
            },
            '@keyframes rotateBorder': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1,
                borderRadius: '50px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                mb: 3
              }}>
                <Zap size={16} color="#8b5cf6" />
                <Typography sx={{ 
                  color: '#8b5cf6',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  Join Now
                </Typography>
              </Box>

              <Typography 
                variant="h3" 
                sx={{ 
                  color: 'rgba(255,255,255,0.95)',
                  mb: 3,
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                  lineHeight: 1.2
                }}
              >
                Ready to Transform Your Career?
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  mb: 5,
                  lineHeight: 1.7,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  maxWidth: { xs: '100%', sm: '90%', md: '80%' },
                  mx: 'auto'
                }}
              >
                Join thousands of professionals who trust Credify for their digital credentials
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowRight />}
                onClick={() => router.push('/auth/register')}
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  px: { xs: 5, sm: 6, md: 7 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  fontWeight: 700,
                  borderRadius: '50px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transition: 'left 0.7s ease'
                  },
                  '& .MuiButton-endIcon': {
                    transition: 'transform 0.3s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: '0 15px 50px rgba(139, 92, 246, 0.7)',
                    '&::before': {
                      left: '100%'
                    },
                    '& .MuiButton-endIcon': {
                      transform: 'translateX(8px)'
                    }
                  },
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                Get Started Today
              </Button>
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* Footer */}
      <Box sx={{
        position: 'relative',
        zIndex: 10,
        py: 6,
        borderTop: '1px solid rgba(139, 92, 246, 0.1)',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} {...({} as any)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  C
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Credify
                </Typography>
              </Box>
              <Typography sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem',
                lineHeight: 1.7
              }}>
                The next generation digital credential platform powered by blockchain and AI
              </Typography>
            </Grid>
            <Grid item xs={6} md={2} {...({} as any)}>
              <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)', mb: 2 }}>
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['Features', 'Pricing', 'Security', 'Integrations'].map((item) => (
                  <Typography key={item} sx={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    '&:hover': { color: '#8b5cf6' }
                  }}>
                    {item}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={6} md={2} {...({} as any)}>
              <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)', mb: 2 }}>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <Typography key={item} sx={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    '&:hover': { color: '#8b5cf6' }
                  }}>
                    {item}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={6} md={2} {...({} as any)}>
              <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)', mb: 2 }}>
                Resources
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['Documentation', 'Help Center', 'Community', 'API'].map((item) => (
                  <Typography key={item} sx={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    '&:hover': { color: '#8b5cf6' }
                  }}>
                    {item}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={6} md={2} {...({} as any)}>
              <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)', mb: 2 }}>
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['Privacy', 'Terms', 'Security', 'Compliance'].map((item) => (
                  <Typography key={item} sx={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    '&:hover': { color: '#8b5cf6' }
                  }}>
                    {item}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{
            mt: 6,
            pt: 4,
            borderTop: '1px solid rgba(139, 92, 246, 0.1)',
            textAlign: 'center'
          }}>
            <Typography sx={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem'
            }}>
              © 2025 Credify. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      <style jsx global>{`
        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes starPop {
          0% {
            transform: scale(0) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </Box>
  );
};

export default LandingPage;
