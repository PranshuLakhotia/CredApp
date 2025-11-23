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
  BarChart3,
  CrossIcon,
  Crosshair
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingAnimation from '@/components/LoadingAnimation';
import { Cancel } from '@mui/icons-material';

const LandingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

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
    
    // Handle scroll for header transparency
    const handleScroll = () => {
      // console.log("scrolling");
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(loadTimer);
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
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
        background: '#0a0a0a',
        filter: 'none !important'
      }}>
        <Box sx={{ maxWidth: '500px', width: '100%', padding: '20px' }}>
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
      color: "#0279F2"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "NSQF Aligned",
      description: "All credentials mapped to National Skills Qualification Framework",
      color: "#014B99"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Stakeholder",
      description: "Connect learners, employers and institutions through a ecosystem",
      color: "#0284c7"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "AI-Powered Insights",
      description: "Personalized recommendations, career pathways for Learners",
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
      description: "ML algorithms maps leaner credentials to NSQF standards for employers",
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
      description: "Issue tamper-proof digital degrees, certificates",
      benefits: ["Reduce administrative costs", "Prevent certificate fraud", "Enhance reputation"],
      color: "#0279F2"
    },
    {
      icon: <Briefcase className="w-10 h-10" />,
      title: "Employers",
      description: "Instantly verify candidate credentials and skills",
      benefits: ["Faster hiring process", "Reduce verification costs", "Access skill analytics"],
      color: "#014B99"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Learners",
      description: "Own and control your digital credential portfolio",
      benefits: ["Lifelong credential storage", "Share instantly", "Career recommendations"],
      color: "#0284c7"
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
      color: "#0279F2"
    },
    {
      name: "Rajesh Kumar",
      role: "HR Director",
      company: "Tech Mahindra",
      avatar: "RK",
      rating: 5,
      text: "We've reduced our credential verification time by 95%. The AI-powered skill matching has been a game-changer for our recruitment process.",
      color: "#014B99"
    },
    {
      name: "Ananya Desai",
      role: "Software Engineer",
      company: "Recent Graduate",
      avatar: "AD",
      rating: 5,
      text: "Having all my credentials in one place with instant sharing capability made my job search so much easier. Employers love the verified badges!",
      color: "#0284c7"
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
      overflow: 'hidden',
      filter: 'none !important'
    }}>
      {/* Animated Grid Background */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(2, 121, 242, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(2, 121, 242, 0.03) 1px, transparent 1px)
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
        background: 'radial-gradient(circle, rgba(2, 121, 242, 0.15) 0%, transparent 70%)',
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
        background: 'radial-gradient(circle, rgba(1, 75, 153, 0.15) 0%, transparent 70%)',
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
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.1) 0%, transparent 70%)',
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
            background: `rgba(2, 121, 242, ${Math.random() * 0.5 + 0.2})`,
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        width: '100%',
        transition: 'all 0.3s ease-in-out',
        ...(isScrolled ? {
          mt: { xs: 1.5, md: 2 },
          ml: { xs: 2, sm: 3, md: 6 },
          mr: { xs: 2, sm: 3, md: 6 },
          mx: 'auto',
          maxWidth: { xs: '95%', sm: '92%', md: '90%' },
          borderRadius: '50px',
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(2, 121, 242, 0.3)',
          border: '1px solid rgba(2, 121, 242, 0.3)'
        } : {
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 8px rgba(2, 121, 242, 0.1)',
          borderBottom: '1px solid rgba(2, 121, 242, 0.1)'
        })
      }}>
        {/* Header Content Container */}
        <Box sx={{
          maxWidth: '1400px',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: isScrolled ? { xs: 1.5, md: 2 } : { xs: 2, md: 3 },
          transition: 'all 0.3s ease-in-out'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Logo Section */}
            <Fade in={visible} timeout={500}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <svg 
                  width={isScrolled ? "100" : "125"} 
                  height={isScrolled ? "32" : "40"} 
                  viewBox="0 0 388 106" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transition: 'all 0.3s ease-in-out' }}
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M87.3006 25.5C87.3671 25.2868 87.4336 25.0743 87.5 24.8623C88.6384 20.8014 88.3406 18.7631 85 15.8623L66 1.8623C61.0271 -1.00737 58.8635 -0.600929 56 3.3623L43.5 24.8623H6C2.68629 24.8623 0 27.5486 0 30.8623V99.8623C0 103.176 2.68629 105.862 6 105.862H57C61.4057 99.4154 56.1561 95.8321 45.3873 88.4814C39.7427 84.6284 32.5817 79.7403 24.5 72.8623C24.5 72.8623 23.8567 72.2839 23.5 71.8623C20.7252 68.5829 21.0542 65.2012 23.5 60.8623L43.1457 25.5H87.3006ZM58.9336 105.862H58.5C58.6427 105.883 58.7872 105.882 58.9336 105.862Z" fill="#0279F2"/>
                  <path d="M87.5 24.8623C87.4336 25.0743 87.3671 25.2868 87.3006 25.5C84.6983 33.8392 82.0368 43.0725 79.3996 52.2216C71.6681 79.0444 64.1453 105.143 58.9336 105.862H102C105.314 105.862 108 103.176 108 99.8623V30.8623C108 27.5486 105.314 24.8623 102 24.8623H87.5Z" fill="#014B99"/>
                  <path d="M165.29 58.2866H150.326C149.638 53.2986 147.058 51.7506 143.962 51.7506C138.974 51.7506 136.308 56.2226 136.308 64.5646C136.308 72.8206 139.06 77.2926 144.392 77.2926C147.574 77.2926 149.81 75.4006 150.67 71.7026H165.548C163.57 83.3986 155.056 89.3326 144.048 89.3326C129.858 89.3326 121 79.7866 121 64.5646C121 48.7406 130.116 39.7106 143.962 39.7106C154.884 39.7106 163.656 45.8166 165.29 58.2866Z" fill="#014B99"/>
                  <path d="M167.911 87.7846V41.2586H182.789V47.6226C185.627 42.1186 190.013 39.7106 194.485 39.7106C196.463 39.7106 198.269 40.2266 199.129 41.2586V53.8146C197.495 53.4706 195.947 53.2986 193.797 53.2986C186.315 53.2986 182.789 57.4266 182.789 64.3926V87.7846H167.911Z" fill="#014B99"/>
                  <path d="M244.638 72.4766C242.23 83.1406 233.372 89.3326 221.59 89.3326C206.97 89.3326 197.768 79.8726 197.768 64.5646C197.768 48.7406 207.056 39.7106 221.074 39.7106C235.35 39.7106 244.294 49.0846 244.294 64.3926V67.6606H213.162C213.85 74.1106 216.774 77.5506 221.59 77.5506C225.374 77.5506 227.696 76.0026 228.986 72.4766H244.638ZM221.074 51.4926C216.946 51.4926 214.366 54.2446 213.42 59.4906H228.814C227.868 54.2446 225.202 51.4926 221.074 51.4926Z" fill="#014B99"/>
                  <path d="M264.575 89.3326C252.707 89.3326 245.139 79.8726 245.139 64.5646C245.139 48.7406 252.879 39.7106 264.575 39.7106C269.305 39.7106 273.089 41.6886 275.841 45.5586V25.8646H290.719V87.7846H275.841V83.2266C273.089 87.1826 269.219 89.3326 264.575 89.3326ZM268.101 77.2926C273.175 77.2926 275.841 72.8206 275.841 64.5646C275.841 56.2226 273.175 51.7506 268.101 51.7506C263.113 51.7506 260.447 56.2226 260.447 64.5646C260.447 72.8206 263.113 77.2926 268.101 77.2926Z" fill="#014B99"/>
                  <path d="M310.951 52.6106V41.2586H316.369C316.455 30.1646 321.873 24.3166 330.989 24.3166C334.859 24.3166 337.611 25.0906 338.987 25.7786V34.9806H337.955C332.451 34.9806 331.247 37.3886 331.247 41.2586H338.987V52.6106H331.247V87.7846H316.369V52.6106H310.951Z" fill="#014B99"/>
                  <path d="M352 63C352 63 348.681 55 341.181 41.2583H350.234C353.363 41.3138 355 41 357.5 46.5L358.5 48.5C366.201 28.6023 372.39 22.1827 386 23L387.5 23.5C361 62 366 89.5 341 88L351.5 67C352.337 65.1285 352.957 64.6244 352 63Z" fill="#014B99"/>
                  <path d="M293.622 87.7843V41.2583H308.5V87.7843H293.622Z" fill="#014B99"/>
                  <circle cx="301" cy="28" r="8" fill="#0279F2"/>
                </svg>
              </Box>
            </Fade>

            {/* Right Section */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.5, sm: 2, md: 4 }
            }}>
              {/* Navigation Menu - Desktop Only */}
              <Fade in={visible} timeout={500} style={{ transitionDelay: '0.2s' }}>
                <Box sx={{
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  gap: { lg: 3, xl: 4 }
                }}>
                  {['Features', 'How It Works', 'Use Cases'].map((item, index) => (
                    <Typography
                      key={item}
                      onClick={() => {
                        const sectionId = item.toLowerCase().replace(/\s+/g, '-');
                        const element = document.getElementById(sectionId);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: isScrolled ? '0.875rem' : '1rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          color: '#0279F2',
                          transform: 'translateY(-1px)'
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -4,
                          left: 0,
                          width: 0,
                          height: '2px',
                          background: '#0279F2',
                          transition: 'width 0.3s ease'
                        },
                        '&:hover::after': {
                          width: '100%'
                        }
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Fade>

              {/* Auth Buttons */}
              <Fade in={visible} timeout={500} style={{ transitionDelay: '0.4s' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1, sm: 1.5, md: 2 }
                }}>
                  {/* Sign In Button - Hidden on mobile when scrolled */}
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/auth/login')}
                    sx={{
                      display: { xs: isScrolled ? 'none' : 'inline-flex', sm: 'inline-flex' },
                      color: 'rgba(255,255,255,0.9)',
                      borderColor: 'rgba(2, 121, 242, 0.3)',
                      borderWidth: '1px',
                      px: isScrolled ? { xs: 1.5, sm: 2, md: 3 } : { xs: 2, sm: 3, md: 4 },
                      py: isScrolled ? { xs: 0.75, md: 1 } : { xs: 1, md: 1.5 },
                      fontWeight: 600,
                      fontSize: isScrolled ? { xs: '0.75rem', md: '0.875rem' } : { xs: '0.875rem', md: '1rem' },
                      borderRadius: '50px',
                      minWidth: 'auto',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#0279F2',
                        backgroundColor: 'rgba(2, 121, 242, 0.1)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(2, 121, 242, 0.3)'
                      }
                    }}
                  >
                    Sign In
                  </Button>
                  {/* Get Started Button */}
                  <Button
                    variant="contained"
                    onClick={() => router.push('/auth/register')}
                    sx={{
                      background: 'linear-gradient(135deg, #0279F2 0%, #014B99 100%)',
                      color: 'white',
                      px: isScrolled ? { xs: 1.5, sm: 2, md: 3 } : { xs: 2, sm: 3, md: 4 },
                      py: isScrolled ? { xs: 0.75, md: 1 } : { xs: 1, md: 1.5 },
                      fontWeight: 600,
                      fontSize: isScrolled ? { xs: '0.75rem', md: '0.875rem' } : { xs: '0.875rem', md: '1rem' },
                      borderRadius: '50px',
                      minWidth: 'auto',
                      boxShadow: '0 4px 20px rgba(2, 121, 242, 0.4)',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        transform: 'translateY(-1px) scale(1.05)',
                        boxShadow: '0 8px 30px rgba(2, 121, 242, 0.6)',
                        background: 'linear-gradient(135deg, #014B99 0%, #0279F2 100%)'
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </Box>
              </Fade>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Hero Section - IMPROVED WITH BETTER SPACE UTILIZATION */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, pt: { xs: 12, md: 14 }, pb: { xs: 8, md: 10 }, mt: 10 }}>
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
                    background: 'rgba(2, 121, 242, 0.1)',
                    border: '1px solid rgba(2, 121, 242, 0.3)',
                    mb: 3,
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { boxShadow: '0 0 0 0 rgba(2, 121, 242, 0.4)' },
                      '50%': { boxShadow: '0 0 0 8px rgba(2, 121, 242, 0)' }
                    }
                  }}>
                    <Sparkles size={16} color="#0279F2" />
                    <Typography sx={{ 
                      color: '#0279F2',
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
                      background: 'linear-gradient(135deg, #0279F2, #014B99, #0ea5e9)',
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
                      background: 'linear-gradient(135deg, #0279F2 0%, #014B99 100%)',
                      px: { xs: 3, sm: 4 },
                      py: { xs: 1.5, sm: 1.8 },
                      fontSize: { xs: '0.95rem', sm: '1.05rem' },
                      fontWeight: 700,
                      borderRadius: '50px',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(2, 121, 242, 0.4)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, #014B99 0%, #0279F2 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '& .MuiButton-endIcon': {
                        transition: 'transform 0.3s ease'
                      },
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 12px 48px rgba(2, 121, 242, 0.6)',
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
                      borderColor: 'rgba(2, 121, 242, 0.4)',
                      borderWidth: '2px',
                      px: { xs: 3, sm: 4 },
                      py: { xs: 1.5, sm: 1.8 },
                      fontSize: { xs: '0.95rem', sm: '1.05rem' },
                      fontWeight: 700,
                      borderRadius: '50px',
                      background: 'rgba(2, 121, 242, 0.05)',
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
                        background: 'rgba(2, 121, 242, 0.2)',
                        transform: 'translate(-50%, -50%)',
                        transition: 'width 0.6s ease, height 0.6s ease'
                      },
                      '&:hover': {
                        borderColor: '#0279F2',
                        backgroundColor: 'rgba(2, 121, 242, 0.15)',
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
                {/* <Grid container spacing={2} sx={{ mt: 2 }}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} sm={6} md={3} key={index} {...({} as any)}>
                      <Box sx={{
                        background: 'rgba(17, 17, 17, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(2, 121, 242, 0.2)',
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
                          borderColor: '#0279F2',
                          boxShadow: '0 10px 30px rgba(2, 121, 242, 0.3)'
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
                          color: '#0279F2',
                          mb: 1.5,
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                          {stat.icon}
                        </Box>
                        <Typography sx={{
                          fontSize: { xs: '1.4rem', sm: '1.6rem' },
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #0279F2, #014B99)',
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
                </Grid> */}
              </Box>
            </Slide>
          </Grid>

          
        </Grid>
      </Container>

      {/* Features Section */}
      <Container id="features" maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={1500}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#0279F2',
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
                  border: '1px solid rgba(2, 121, 242, 0.2)',
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
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: `0 20px 40px ${feature.color}30`,
                    borderColor: feature.color,
                    '&::before': {
                      opacity: 1
                    },
                    '& .feature-icon': {
                      transform: 'scale(1.15)',
                      filter: `drop-shadow(0 5px 15px ${feature.color})`
                    }
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
      <Container id="how-it-works" maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={1500}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#014B99',
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
            background: 'linear-gradient(90deg, #0279F2, #014B99, #0284c7, #0ea5e9)',
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
                      borderColor: index === 0 ? '#0279F2' : index === 1 ? '#014B99' : index === 2 ? '#0284c7' : '#0ea5e9',
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
                        background: `conic-gradient(from 0deg, ${index === 0 ? '#0279F2' : index === 1 ? '#014B99' : index === 2 ? '#0284c7' : '#0ea5e9'}, transparent)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&:hover': {
                        transform: 'scale(1.1) translateY(-10px)',
                        boxShadow: `0 20px 40px ${index === 0 ? '#0279F2' : index === 1 ? '#014B99' : index === 2 ? '#0284c7' : '#0ea5e9'}40`,
                        '&::before': {
                          opacity: 1,
                          animation: 'rotate 2s linear infinite'
                        }
                      }
                    }}>
                      <Box sx={{ 
                        color: index === 0 ? '#0279F2' : index === 1 ? '#014B99' : index === 2 ? '#0284c7' : '#0ea5e9',
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
                      color: index === 0 ? '#0279F2' : index === 1 ? '#014B99' : index === 2 ? '#0284c7' : '#0ea5e9',
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
            border: '1px solid rgba(2, 121, 242, 0.2)',
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
      border: '1px solid rgba(2, 121, 242, 0.2)',
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
      <Container id="use-cases" maxWidth="xl" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 10 }}>
        <Fade in={visible} timeout={1500}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#0284c7',
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

        <Grid container spacing={6} ml={4}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} md={4} key={index} {...({} as any)}>
              <Zoom in={visible} timeout={1500 + index * 200}>
                <Card sx={{
                  height: '100%',
                  background: 'rgba(17, 17, 17, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(2, 121, 242, 0.2)',
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
              color: '#0279F2',
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
                border: '1px solid rgba(2, 121, 242, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-10px) scale(1.05)',
                  borderColor: '#0279F2',
                  boxShadow: '0 15px 40px rgba(2, 121, 242, 0.3)',
                  background: 'rgba(2, 121, 242, 0.1)'
                }
              }}>
                <Box sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0279F2, #014B99)',
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
              color: '#014B99',
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
            border: '1px solid rgba(2, 121, 242, 0.2)',
            borderRadius: '24px',
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              background: 'rgba(2, 121, 242, 0.1)',
              borderBottom: '1px solid rgba(2, 121, 242, 0.2)',
              p: 3
            }}>
              <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
                Feature
              </Typography>
              <Typography sx={{ fontWeight: 700, color: '#0279F2', textAlign: 'center' }}>
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
                  borderBottom: index < comparisonData.length - 1 ? '1px solid rgba(2, 121, 242, 0.1)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(2, 121, 242, 0.05)'
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
                    <Cancel
                      sx={{ 
                        fontSize: 24,
                        color: 'rgba(239, 68, 68, 0.6)'
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {row.traditional ? (
                    <CheckCircle size={24} color="#10b981" />
                  ) : (
                    <Cancel
                      sx={{ 
                        fontSize: 24,
                        color: 'rgba(239, 68, 68, 0.8)'
                      }}
                    />
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
              color: '#0ea5e9',
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
                  border: '1px solid rgba(2, 121, 242, 0.2)',
                  borderRadius: '16px !important',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    margin: '0 !important',
                    borderColor: '#0279F2'
                  },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#0279F2',
                    boxShadow: '0 8px 30px rgba(2, 121, 242, 0.2)'
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
            border: '1px solid rgba(2, 121, 242, 0.2)',
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
              background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(2, 121, 242, 0.1) 90deg, transparent 180deg)',
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
                background: 'rgba(2, 121, 242, 0.15)',
                border: '1px solid rgba(2, 121, 242, 0.3)',
                mb: 3
              }}>
                <Zap size={16} color="#0279F2" />
                <Typography sx={{ 
                  color: '#0279F2',
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
                  background: 'linear-gradient(135deg, #0279F2 0%, #014B99 100%)',
                  px: { xs: 5, sm: 6, md: 7 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  fontWeight: 700,
                  borderRadius: '50px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(2, 121, 242, 0.5)',
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
                    boxShadow: '0 15px 50px rgba(2, 121, 242, 0.7)',
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
        borderTop: '1px solid rgba(2, 121, 242, 0.1)',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} {...({} as any)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <svg width="125" height="40" viewBox="0 0 388 106" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M87.3006 25.5C87.3671 25.2868 87.4336 25.0743 87.5 24.8623C88.6384 20.8014 88.3406 18.7631 85 15.8623L66 1.8623C61.0271 -1.00737 58.8635 -0.600929 56 3.3623L43.5 24.8623H6C2.68629 24.8623 0 27.5486 0 30.8623V99.8623C0 103.176 2.68629 105.862 6 105.862H57C61.4057 99.4154 56.1561 95.8321 45.3873 88.4814C39.7427 84.6284 32.5817 79.7403 24.5 72.8623C24.5 72.8623 23.8567 72.2839 23.5 71.8623C20.7252 68.5829 21.0542 65.2012 23.5 60.8623L43.1457 25.5H87.3006ZM58.9336 105.862H58.5C58.6427 105.883 58.7872 105.882 58.9336 105.862Z" fill="#0279F2"/>
                    <path d="M87.5 24.8623C87.4336 25.0743 87.3671 25.2868 87.3006 25.5C84.6983 33.8392 82.0368 43.0725 79.3996 52.2216C71.6681 79.0444 64.1453 105.143 58.9336 105.862H102C105.314 105.862 108 103.176 108 99.8623V30.8623C108 27.5486 105.314 24.8623 102 24.8623H87.5Z" fill="#014B99"/>
                    <path d="M165.29 58.2866H150.326C149.638 53.2986 147.058 51.7506 143.962 51.7506C138.974 51.7506 136.308 56.2226 136.308 64.5646C136.308 72.8206 139.06 77.2926 144.392 77.2926C147.574 77.2926 149.81 75.4006 150.67 71.7026H165.548C163.57 83.3986 155.056 89.3326 144.048 89.3326C129.858 89.3326 121 79.7866 121 64.5646C121 48.7406 130.116 39.7106 143.962 39.7106C154.884 39.7106 163.656 45.8166 165.29 58.2866Z" fill="#014B99"/>
                    <path d="M167.911 87.7846V41.2586H182.789V47.6226C185.627 42.1186 190.013 39.7106 194.485 39.7106C196.463 39.7106 198.269 40.2266 199.129 41.2586V53.8146C197.495 53.4706 195.947 53.2986 193.797 53.2986C186.315 53.2986 182.789 57.4266 182.789 64.3926V87.7846H167.911Z" fill="#014B99"/>
                    <path d="M244.638 72.4766C242.23 83.1406 233.372 89.3326 221.59 89.3326C206.97 89.3326 197.768 79.8726 197.768 64.5646C197.768 48.7406 207.056 39.7106 221.074 39.7106C235.35 39.7106 244.294 49.0846 244.294 64.3926V67.6606H213.162C213.85 74.1106 216.774 77.5506 221.59 77.5506C225.374 77.5506 227.696 76.0026 228.986 72.4766H244.638ZM221.074 51.4926C216.946 51.4926 214.366 54.2446 213.42 59.4906H228.814C227.868 54.2446 225.202 51.4926 221.074 51.4926Z" fill="#014B99"/>
                    <path d="M264.575 89.3326C252.707 89.3326 245.139 79.8726 245.139 64.5646C245.139 48.7406 252.879 39.7106 264.575 39.7106C269.305 39.7106 273.089 41.6886 275.841 45.5586V25.8646H290.719V87.7846H275.841V83.2266C273.089 87.1826 269.219 89.3326 264.575 89.3326ZM268.101 77.2926C273.175 77.2926 275.841 72.8206 275.841 64.5646C275.841 56.2226 273.175 51.7506 268.101 51.7506C263.113 51.7506 260.447 56.2226 260.447 64.5646C260.447 72.8206 263.113 77.2926 268.101 77.2926Z" fill="#014B99"/>
                    <path d="M310.951 52.6106V41.2586H316.369C316.455 30.1646 321.873 24.3166 330.989 24.3166C334.859 24.3166 337.611 25.0906 338.987 25.7786V34.9806H337.955C332.451 34.9806 331.247 37.3886 331.247 41.2586H338.987V52.6106H331.247V87.7846H316.369V52.6106H310.951Z" fill="#014B99"/>
                    <path d="M352 63C352 63 348.681 55 341.181 41.2583H350.234C353.363 41.3138 355 41 357.5 46.5L358.5 48.5C366.201 28.6023 372.39 22.1827 386 23L387.5 23.5C361 62 366 89.5 341 88L351.5 67C352.337 65.1285 352.957 64.6244 352 63Z" fill="#014B99"/>
                    <path d="M293.622 87.7843V41.2583H308.5V87.7843H293.622Z" fill="#014B99"/>
                    <circle cx="301" cy="28" r="8" fill="#0279F2"/>
                  </svg>
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
                    '&:hover': { color: '#0279F2' }
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
                    '&:hover': { color: '#0279F2' }
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
                    '&:hover': { color: '#0279F2' }
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
                    '&:hover': { color: '#0279F2' }
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
            borderTop: '1px solid rgba(2, 121, 242, 0.1)',
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
