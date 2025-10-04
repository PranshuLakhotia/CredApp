// 'use client';

// import React from 'react';
// import {
//   Box,
//   Grid,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   LinearProgress,
//   Avatar,
//   Chip,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemAvatar,
//   Divider,
//   IconButton,
// } from '@mui/material';
// import {
//   School,
//   TrendingUp,
//   Assignment,
//   Download,
//   Add,
//   Timeline,
//   WorkspacePremium,
//   Verified,
//   Upload,
//   GetApp,
//   MoreVert,
//   FilterList,
// } from '@mui/icons-material';
// import StatsCard from './StatsCard';
// import CredentialCard from './CredentialCard';
// import { Credential, SkillProgress } from '@/types/dashboard';

// // Mock data - replace with actual API calls
// const mockCredentials: Credential[] = [
//   {
//     id: '1',
//     title: 'Machine Learning Fundamentals',
//     issuer: 'Coursera',
//     nsqf_level: 4,
//     credit_points: 12,
//     issue_date: '2024-01-15',
//     verification_status: 'verified',
//     skills: ['Python', 'Machine Learning', 'Data Analysis'],
//     description: 'Comprehensive course covering ML algorithms and practical applications',
//   },
//   {
//     id: '2',
//     title: 'React.js Development',
//     issuer: 'Udemy',
//     nsqf_level: 3,
//     credit_points: 8,
//     issue_date: '2024-02-20',
//     verification_status: 'verified',
//     skills: ['React', 'JavaScript', 'Frontend Development'],
//     description: 'Advanced React development with hooks and modern patterns',
//   },
//   {
//     id: '3',
//     title: 'Digital Marketing Certificate',
//     issuer: 'Google',
//     nsqf_level: 2,
//     credit_points: 6,
//     issue_date: '2024-03-10',
//     verification_status: 'pending',
//     skills: ['SEO', 'Social Media', 'Analytics'],
//     description: 'Complete digital marketing strategy and implementation',
//   },
// ];

// const mockSkillProgress: SkillProgress[] = [
//   {
//     skill_name: 'Machine Learning',
//     current_level: 4,
//     target_level: 6,
//     progress_percentage: 67,
//     credentials_earned: 2,
//     total_credentials: 3,
//     last_updated: '2024-03-15',
//   },
//   {
//     skill_name: 'React Development',
//     current_level: 3,
//     target_level: 5,
//     progress_percentage: 60,
//     credentials_earned: 1,
//     total_credentials: 2,
//     last_updated: '2024-03-10',
//   },
//   {
//     skill_name: 'Data Analysis',
//     current_level: 2,
//     target_level: 4,
//     progress_percentage: 50,
//     credentials_earned: 1,
//     total_credentials: 2,
//     last_updated: '2024-03-05',
//   },
// ];

// const mockRecommendations = [
//   {
//     id: '1',
//     title: 'Advanced Machine Learning',
//     provider: 'Stanford Online',
//     nsqf_level: 5,
//     match_percentage: 95,
//     duration: '8 weeks',
//   },
//   {
//     id: '2',
//     title: 'Cloud Computing Fundamentals',
//     provider: 'AWS',
//     nsqf_level: 4,
//     match_percentage: 88,
//     duration: '6 weeks',
//   },
//   {
//     id: '3',
//     title: 'DevOps Practices',
//     provider: 'Docker',
//     nsqf_level: 4,
//     match_percentage: 82,
//     duration: '10 weeks',
//   },
// ];

// export default function LearnerDashboard() {
//   return (
//     <Box sx={{ p: 0 }}>
//       {/* Overview Section */}
//       <Box sx={{ mb: 4 }}>
//         <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
//           Overview
//         </Typography>
        
//         {/* Stats Cards Row */}
//         <Grid container spacing={3} sx={{ mb: 4 }}>
//           {/* Total Credentials */}
//           <Grid item xs={12} sm={6} md={3}>
//             <Card sx={{ p: 2, backgroundColor: '#f8f9ff', border: '1px solid #e3e8ff' }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                 <Box>
//                   <Typography variant="body2" color="text.secondary" gutterBottom>
//                     Total Credentials
//                   </Typography>
//                   <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
//                     12
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     last 30 days
//                   </Typography>
//                 </Box>
//                 <Box sx={{ 
//                   width: 40, 
//                   height: 40, 
//                   borderRadius: '50%', 
//                   backgroundColor: '#e3e8ff',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <School sx={{ color: '#6366f1' }} />
//                 </Box>
//               </Box>
//             </Card>
//           </Grid>

//           {/* Verified */}
//           <Grid item xs={12} sm={6} md={3}>
//             <Card sx={{ p: 2, backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                 <Box>
//                   <Typography variant="body2" color="text.secondary" gutterBottom>
//                     Verified
//                   </Typography>
//                   <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
//                     9
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     credentials
//                   </Typography>
//                 </Box>
//                 <Box sx={{ 
//                   width: 40, 
//                   height: 40, 
//                   borderRadius: '50%', 
//                   backgroundColor: '#dcfce7',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <Verified sx={{ color: '#22c55e' }} />
//                 </Box>
//               </Box>
//             </Card>
//           </Grid>

//           {/* Pending */}
//           <Grid item xs={12} sm={6} md={3}>
//             <Card sx={{ p: 2, backgroundColor: '#fef3f2', border: '1px solid #fecaca' }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                 <Box>
//                   <Typography variant="body2" color="text.secondary" gutterBottom>
//                     Pending
//                   </Typography>
//                   <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
//                     3
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     under review
//                   </Typography>
//                 </Box>
//                 <Box sx={{ 
//                   width: 40, 
//                   height: 40, 
//                   borderRadius: '50%', 
//                   backgroundColor: '#fecaca',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <Timeline sx={{ color: '#ef4444' }} />
//                 </Box>
//               </Box>
//             </Card>
//           </Grid>

//           {/* NQFQ Progress */}
//           <Grid item xs={12} sm={6} md={3}>
//             <Card sx={{ p: 2, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                 <Box sx={{ flex: 1 }}>
//                   <Typography variant="body2" color="text.secondary" gutterBottom>
//                     NQFQ Progress
//                   </Typography>
//                   <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
//                     level 4/7
//                   </Typography>
//                   <LinearProgress 
//                     variant="determinate" 
//                     value={57} 
//                     sx={{ 
//                       height: 6, 
//                       borderRadius: 3,
//                       backgroundColor: '#e0f2fe',
//                       '& .MuiLinearProgress-bar': {
//                         backgroundColor: '#0ea5e9'
//                       }
//                     }} 
//                   />
//                 </Box>
//               </Box>
//             </Card>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Main Content Grid */}
//       <Grid container spacing={3}>
//         {/* Left Column - Timeline and Charts */}
//         <Grid item xs={12} lg={6}>
//           {/* Timeline Section */}
//           <Card sx={{ mb: 3 }}>
//             <CardContent>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//                 <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
//                   Timeline
//                 </Typography>
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Button variant="outlined" size="small" sx={{ borderColor: '#e5e7eb', color: '#6b7280' }}>Year</Button>
//                   <IconButton size="small"><FilterList sx={{ color: '#6b7280' }} /></IconButton>
//                   <IconButton size="small"><MoreVert sx={{ color: '#6b7280' }} /></IconButton>
//                 </Box>
//               </Box>
              
//               {/* Timeline Chart Area - Proper Line Chart */}
//               <Box sx={{ height: 250, position: 'relative', px: 2, py: 2 }}>
//                 {/* Y-axis labels */}
//                 <Box sx={{ position: 'absolute', left: 0, top: 20, bottom: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
//                   {[10, 8, 6, 4, 2, 0].map((val) => (
//                     <Typography key={val} variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
//                       {val}
//                     </Typography>
//                   ))}
//                 </Box>
                
//                 {/* Chart area */}
//                 <Box sx={{ ml: 3, height: '100%', position: 'relative' }}>
//                   {/* Grid lines */}
//                   {[0, 1, 2, 3, 4, 5].map((i) => (
//                     <Box key={i} sx={{ 
//                       position: 'absolute', 
//                       top: `${i * 20}%`, 
//                       left: 0, 
//                       right: 0, 
//                       height: 1, 
//                       backgroundColor: '#f3f4f6' 
//                     }} />
//                   ))}
                  
//                   {/* Line chart path */}
//                   <svg width="100%" height="200" style={{ position: 'absolute', top: 0 }}>
//                     <defs>
//                       <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
//                         <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
//                         <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05"/>
//                       </linearGradient>
//                     </defs>
                    
//                     {/* Area fill */}
//                     <path
//                       d="M 0 160 L 60 120 L 120 140 L 180 80 L 240 100 L 300 60 L 300 200 L 0 200 Z"
//                       fill="url(#areaGradient)"
//                     />
                    
//                     {/* Line */}
//                     <path
//                       d="M 0 160 L 60 120 L 120 140 L 180 80 L 240 100 L 300 60"
//                       stroke="#3b82f6"
//                       strokeWidth="3"
//                       fill="none"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
                    
//                     {/* Data points */}
//                     {[
//                       { x: 0, y: 160 },
//                       { x: 60, y: 120 },
//                       { x: 120, y: 140 },
//                       { x: 180, y: 80 },
//                       { x: 240, y: 100 },
//                       { x: 300, y: 60 }
//                     ].map((point, index) => (
//                       <circle
//                         key={index}
//                         cx={point.x}
//                         cy={point.y}
//                         r="4"
//                         fill="#3b82f6"
//                         stroke="white"
//                         strokeWidth="2"
//                       />
//                     ))}
//                   </svg>
                  
//                   {/* X-axis labels */}
//                   <Box sx={{ position: 'absolute', bottom: -10, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
//                     {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
//                       <Typography key={month} variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
//                         {month}
//                       </Typography>
//                     ))}
//                   </Box>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>

//           {/* Charts Row */}
//           <Grid container spacing={3}>
//             {/* Top Skills Chart */}
//             <Grid item xs={12} md={6}>
//               <Card>
//                 <CardContent>
//                   <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
//                     Top Skills
//                   </Typography>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', height: 140, px: 1 }}>
//                     {[
//                       { skill: 'Python', height: 70, color: '#3b82f6' },
//                       { skill: 'Frontend', height: 110, color: '#10b981' },
//                       { skill: 'Java', height: 130, color: '#6366f1' },
//                       { skill: 'AI/ML', height: 90, color: '#8b5cf6' },
//                       { skill: 'Android', height: 80, color: '#f59e0b' },
//                       { skill: 'Other', height: 100, color: '#ef4444' }
//                     ].map((item, index) => (
//                       <Box key={item.skill} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, mx: 0.5 }}>
//                         <Box sx={{ 
//                           width: 24, 
//                           height: item.height, 
//                           backgroundColor: item.color,
//                           borderRadius: '4px 4px 0 0',
//                           mb: 1,
//                           transition: 'all 0.3s ease',
//                           '&:hover': {
//                             opacity: 0.8,
//                             transform: 'translateY(-2px)'
//                           }
//                         }} />
//                         <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textAlign: 'center' }}>
//                           {item.skill}
//                         </Typography>
//                       </Box>
//                     ))}
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>

//             {/* Traffic by Location */}
//             <Grid item xs={12} md={6}>
//               <Card>
//                 <CardContent>
//                   <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
//                     Traffic by Location
//                   </Typography>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
//                     {/* Enhanced Pie Chart */}
//                     <Box sx={{ 
//                       width: 100, 
//                       height: 100, 
//                       borderRadius: '50%',
//                       background: 'conic-gradient(#3b82f6 0deg 223deg, #10b981 223deg 304deg, #f59e0b 304deg 322deg, #6b7280 322deg 360deg)',
//                       position: 'relative',
//                       '&::after': {
//                         content: '""',
//                         position: 'absolute',
//                         top: '50%',
//                         left: '50%',
//                         transform: 'translate(-50%, -50%)',
//                         width: 40,
//                         height: 40,
//                         backgroundColor: 'white',
//                         borderRadius: '50%'
//                       }
//                     }} />
//                     <Box sx={{ flex: 1 }}>
//                       {[
//                         { location: 'United States', percentage: '62.1%', color: '#3b82f6' },
//                         { location: 'Canada', percentage: '22.5%', color: '#10b981' },
//                         { location: 'Mexico', percentage: '13.9%', color: '#f59e0b' },
//                         { location: 'Other', percentage: '1.5%', color: '#6b7280' }
//                       ].map((item, index) => (
//                         <Box key={item.location} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                             <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
//                             <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{item.location}</Typography>
//                           </Box>
//                           <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{item.percentage}</Typography>
//                         </Box>
//                       ))}
//                     </Box>
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>
//         </Grid>

//         {/* Right Column - Add Credentials & Recent Activity */}
//         <Grid item xs={12} lg={6}>
//           {/* Add Credentials */}
//           <Card sx={{ mb: 3 }}>
//             <CardContent>
//               <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
//                 Add Credentials
//               </Typography>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<Upload />}
//                   sx={{ 
//                     backgroundColor: '#3b82f6',
//                     color: 'white',
//                     py: 1.5,
//                     '&:hover': { backgroundColor: '#2563eb' }
//                   }}
//                 >
//                   Upload
//                 </Button>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<Verified />}
//                   sx={{ 
//                     backgroundColor: '#10b981',
//                     color: 'white',
//                     py: 1.5,
//                     '&:hover': { backgroundColor: '#059669' }
//                   }}
//                 >
//                   Get Verified
//                 </Button>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<GetApp />}
//                   sx={{ 
//                     backgroundColor: '#6366f1',
//                     color: 'white',
//                     py: 1.5,
//                     '&:hover': { backgroundColor: '#4f46e5' }
//                   }}
//                 >
//                   Submit
//                 </Button>
//               </Box>
//             </CardContent>
//           </Card>

//           {/* Recent Activity */}
//           <Card sx={{ mb: 3 }}>
//             <CardContent>
//               <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
//                 Recent Activity
//               </Typography>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 {[
//                   { action: 'Completed', item: 'Machine Learning Course', time: '2 hours ago', color: '#10b981', icon: '✓' },
//                   { action: 'Started', item: 'React Development', time: '1 day ago', color: '#3b82f6', icon: '▶' },
//                   { action: 'Earned', item: 'Python Certificate', time: '3 days ago', color: '#f59e0b', icon: '🏆' },
//                   { action: 'Submitted', item: 'Portfolio Review', time: '5 days ago', color: '#6366f1', icon: '📤' }
//                 ].map((activity, index) => (
//                   <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
//                     <Box
//                       sx={{
//                         width: 28,
//                         height: 28,
//                         borderRadius: '50%',
//                         backgroundColor: activity.color,
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         color: 'white',
//                         fontSize: '0.75rem'
//                       }}
//                     >
//                       {activity.icon}
//                     </Box>
//                     <Box sx={{ flex: 1 }}>
//                       <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.85rem' }}>
//                         <strong>{activity.action}</strong> {activity.item}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
//                         {activity.time}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 ))}
//               </Box>
//             </CardContent>
//           </Card>

//           {/* Learning Goals */}
//           <Card sx={{ mb: 3 }}>
//             <CardContent>
//               <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
//                 Learning Goals
//               </Typography>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 {[
//                   { goal: 'Complete AWS Certification', progress: 75, target: 'Dec 2024', color: '#3b82f6' },
//                   { goal: 'Master React Advanced Patterns', progress: 45, target: 'Jan 2025', color: '#10b981' },
//                   { goal: 'Learn Machine Learning', progress: 30, target: 'Mar 2025', color: '#f59e0b' }
//                 ].map((item, index) => (
//                   <Box key={index} sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//                       <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.85rem' }}>
//                         {item.goal}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
//                         {item.progress}%
//                       </Typography>
//                     </Box>
//                     <LinearProgress 
//                       variant="determinate" 
//                       value={item.progress} 
//                       sx={{ 
//                         height: 6, 
//                         borderRadius: 3, 
//                         mb: 1,
//                         backgroundColor: '#e5e7eb',
//                         '& .MuiLinearProgress-bar': {
//                           backgroundColor: item.color
//                         }
//                       }} 
//                     />
//                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
//                       Target: {item.target}
//                     </Typography>
//                   </Box>
//                 ))}
//               </Box>
//             </CardContent>
//           </Card>

//           {/* Upcoming Deadlines */}
//           <Card>
//             <CardContent>
//               <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
//                 Upcoming Deadlines
//               </Typography>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 {[
//                   { course: 'Python Fundamentals Quiz', deadline: 'Due in 2 days', priority: 'high', color: '#ef4444' },
//                   { course: 'React Project Submission', deadline: 'Due in 5 days', priority: 'medium', color: '#f59e0b' },
//                   { course: 'SQL Assignment', deadline: 'Due in 1 week', priority: 'low', color: '#6b7280' },
//                   { course: 'Portfolio Review', deadline: 'Due in 2 weeks', priority: 'low', color: '#6b7280' }
//                 ].map((item, index) => (
//                   <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
//                     <Box sx={{ flex: 1 }}>
//                       <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.85rem' }}>
//                         {item.course}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
//                         {item.deadline}
//                       </Typography>
//                     </Box>
//                     <Box sx={{ 
//                       width: 8, 
//                       height: 8, 
//                       borderRadius: '50%', 
//                       backgroundColor: item.color,
//                       ml: 2
//                     }} />
//                   </Box>
//                 ))}
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Credentials Section */}
//       <Box sx={{ mt: 4 }}>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
//             Credentials
//           </Typography>
//           <Box sx={{ display: 'flex', gap: 1 }}>
//             <Button variant="outlined" size="small">All</Button>
//             <IconButton size="small"><MoreVert /></IconButton>
//           </Box>
//         </Box>

//         {/* Credentials Grid */}
//         <Grid container spacing={3}>
//           {[
//             { title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', status: 'verified', color: '#e0f2fe' },
//             { title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', status: 'verified', color: '#e0f2fe' },
//             { title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', status: 'verified', color: '#fff3e0' },
//             { title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', status: 'pending', color: '#fff8e1' },
//             { title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', status: 'verified', color: '#fff3e0' },
//             { title: 'Machine Learning', issuer: 'Coursera', level: 4, date: 'May 2025', status: 'verified', color: '#e0f2fe' }
//           ].map((credential, index) => (
//             <Grid item xs={12} sm={6} md={4} key={index}>
//               <Card sx={{ backgroundColor: credential.color, border: '1px solid #e5e7eb' }}>
//                 <CardContent>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
//                     <Box sx={{ 
//                       width: 40, 
//                       height: 40, 
//                       borderRadius: '50%', 
//                       backgroundColor: 'white',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       border: '2px solid #f0f0f0'
//                     }}>
//                       <School sx={{ color: credential.status === 'verified' ? '#22c55e' : '#f59e0b' }} />
//                     </Box>
//                     <Chip 
//                       label={credential.status} 
//                       size="small" 
//                       sx={{ 
//                         backgroundColor: credential.status === 'verified' ? '#dcfce7' : '#fef3c7',
//                         color: credential.status === 'verified' ? '#166534' : '#92400e'
//                       }} 
//                     />
//                   </Box>
                  
//                   <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
//                     {credential.title}
//                   </Typography>
                  
//                   <Typography variant="body2" color="text.secondary" gutterBottom>
//                     Issuer • {credential.issuer}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" gutterBottom>
//                     NQFQ Level • {credential.level}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" gutterBottom>
//                     Issued Date • {credential.date}
//                   </Typography>

//                   <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
//                     <Button size="small" variant="text" sx={{ color: '#6366f1' }}>
//                       View details
//                     </Button>
//                     <Button size="small" variant="text" sx={{ color: '#6366f1' }}>
//                       Download
//                     </Button>
//                     <Button size="small" variant="text" sx={{ color: '#6366f1' }}>
//                       Share
//                     </Button>
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Box>
//     </Box>
//   );
// }

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  IconButton,
} from '@mui/material';
import {
  School,
  Verified,
  Timeline,
  Upload,
  GetApp,
  MoreVert,
  FilterList,
} from '@mui/icons-material';

// Mock data remains the same
const mockCredentials = [
  { id: '1', title: 'Machine Learning Fundamentals', issuer: 'Coursera', nsqf_level: 4, credit_points: 12, issue_date: '2024-01-15', verification_status: 'verified', skills: ['Python', 'Machine Learning', 'Data Analysis'], description: 'Comprehensive course covering ML algorithms and practical applications' },
  { id: '2', title: 'React.js Development', issuer: 'Udemy', nsqf_level: 3, credit_points: 8, issue_date: '2024-02-20', verification_status: 'verified', skills: ['React', 'JavaScript', 'Frontend Development'], description: 'Advanced React development with hooks and modern patterns' },
  { id: '3', title: 'Digital Marketing Certificate', issuer: 'Google', nsqf_level: 2, credit_points: 6, issue_date: '2024-03-10', verification_status: 'pending', skills: ['SEO', 'Social Media', 'Analytics'], description: 'Complete digital marketing strategy and implementation' },
];

export default function LearnerDashboard() {
  return (
    <Box sx={{ p: 3, width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Full Screen Overview Section */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#1e293b' }}>
        Dashboard Overview
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {/* Stats Cards - Full Size */}
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ p: 3, backgroundColor: '#f8f9ff', border: '1px solid #e3e8ff', minHeight: 120, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Credentials
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  last 30 days
                </Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <School sx={{ color: '#6366f1', fontSize: 24 }} />
              </Box>
            </Box>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ p: 3, backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', minHeight: 120, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Verified
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                  9
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  credentials
                </Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Verified sx={{ color: '#22c55e', fontSize: 24 }} />
              </Box>
            </Box>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ p: 3, backgroundColor: '#fef3f2', border: '1px solid #fecaca', minHeight: 120, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                  3
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  under review
                </Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Timeline sx={{ color: '#ef4444', fontSize: 24 }} />
              </Box>
            </Box>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ p: 3, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', minHeight: 120, boxShadow: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                NQFQ Progress
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                Level 4/7
              </Typography>
              <LinearProgress variant="determinate" value={57} sx={{ height: 8, borderRadius: 4, backgroundColor: '#e0f2fe', '& .MuiLinearProgress-bar': { backgroundColor: '#0ea5e9' } }} />
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Full Size Main Content */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Left Column - 70% width */}
        <Box sx={{ flex: '2 1 600px', minWidth: '500px' }}>
          {/* Activity Timeline - Full Size */}
          <Card sx={{ mb: 3, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Activity Timeline
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small">6M</Button>
                  <IconButton size="small"><MoreVert /></IconButton>
                </Box>
              </Box>
              
              {/* Activity List - Full Size */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { date: 'Today', activity: 'Completed Python Course', type: 'success' },
                  { date: 'Yesterday', activity: 'Started React Project', type: 'info' },
                  { date: '2 days ago', activity: 'Earned ML Certificate', type: 'warning' },
                  { date: '1 week ago', activity: 'Submitted Portfolio', type: 'default' },
                  { date: '2 weeks ago', activity: 'Joined Data Science Track', type: 'info' },
                  { date: '3 weeks ago', activity: 'Completed JavaScript Basics', type: 'success' }
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, '&:hover': { backgroundColor: '#f1f5f9' } }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: item.type === 'success' ? '#22c55e' : item.type === 'info' ? '#3b82f6' : item.type === 'warning' ? '#f59e0b' : '#6b7280'
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                        {item.activity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.date}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Skills & Progress - Side by Side */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card sx={{ boxShadow: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Top Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[
                      { skill: 'Python', level: 85, color: '#3b82f6' },
                      { skill: 'React', level: 75, color: '#10b981' },
                      { skill: 'Machine Learning', level: 60, color: '#8b5cf6' },
                      { skill: 'Node.js', level: 70, color: '#f59e0b' }
                    ].map((item) => (
                      <Box key={item.skill}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{item.skill}</Typography>
                          <Typography variant="body2" color="text.secondary">{item.level}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.level} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            backgroundColor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': { backgroundColor: item.color }
                          }} 
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card sx={{ boxShadow: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Learning Progress
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[
                      { course: 'AWS Certification', progress: 75, target: 'Dec 2024' },
                      { course: 'React Advanced', progress: 45, target: 'Jan 2025' },
                      { course: 'Data Science', progress: 30, target: 'Mar 2025' }
                    ].map((item) => (
                      <Box key={item.course} sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {item.course}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">{item.progress}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.progress} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            mb: 1,
                            backgroundColor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': { backgroundColor: '#3b82f6' }
                          }} 
                        />
                        <Typography variant="body2" color="text.secondary">
                          Target: {item.target}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Right Column - 30% width */}
        <Box sx={{ flex: '1 1 400px', minWidth: '350px' }}>
          {/* Quick Actions */}
          <Card sx={{ mb: 1.5 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, fontSize: '1.1rem' }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" startIcon={<Upload />} size="small" sx={{ backgroundColor: '#3b82f6', py: 1, fontSize: '0.85rem' }}>
                  Upload Credential
                </Button>
                <Button variant="contained" startIcon={<Verified />} size="small" sx={{ backgroundColor: '#10b981', py: 1, fontSize: '0.85rem' }}>
                  Get Verified
                </Button>
                <Button variant="outlined" startIcon={<GetApp />} size="small" sx={{ py: 1, fontSize: '0.85rem' }}>
                  Download Portfolio
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card sx={{ mb: 1.5 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, fontSize: '1.1rem' }}>
                Upcoming Deadlines
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { task: 'Python Quiz', deadline: '2 days', priority: 'high', color: '#ef4444' },
                  { task: 'React Project', deadline: '5 days', priority: 'medium', color: '#f59e0b' },
                  { task: 'SQL Assignment', deadline: '1 week', priority: 'low', color: '#6b7280' },
                  { task: 'Portfolio Review', deadline: '2 weeks', priority: 'low', color: '#6b7280' }
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.85rem' }}>
                        {item.task}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Due in {item.deadline}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      backgroundColor: item.color
                    }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, fontSize: '1.1rem' }}>
                Recent Achievements
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { achievement: 'Python Certification', date: 'Today', icon: '🏆', color: '#f59e0b' },
                  { achievement: 'React Course Complete', date: 'Yesterday', icon: '✅', color: '#22c55e' },
                  { achievement: 'ML Project Submitted', date: '2 days ago', icon: '📤', color: '#3b82f6' }
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      backgroundColor: item.color, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.7rem'
                    }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.85rem' }}>
                        {item.achievement}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.date}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Compact Credentials Section */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            My Credentials
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button variant="outlined" size="small" sx={{ fontSize: '0.75rem', py: 0.5, px: 1 }}>View All</Button>
            <IconButton size="small"><MoreVert sx={{ fontSize: 18 }} /></IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {mockCredentials.map((credential) => (
            <Box key={credential.id} sx={{ flex: '1 1 300px', minWidth: '280px' }}>
              <Card sx={{ border: '1px solid #e5e7eb', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #f0f0f0' }}>
                      <School sx={{ color: credential.verification_status === 'verified' ? '#22c55e' : '#f59e0b', fontSize: 18 }} />
                    </Box>
                    <Chip 
                      label={credential.verification_status} 
                      size="small" 
                      sx={{ 
                        backgroundColor: credential.verification_status === 'verified' ? '#dcfce7' : '#fef3c7', 
                        color: credential.verification_status === 'verified' ? '#166534' : '#92400e',
                        fontSize: '0.7rem',
                        height: 20
                      }} 
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1rem', lineHeight: 1.2 }}>
                    {credential.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                    {credential.issuer} • Level {credential.nsqf_level}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 1.5 }}>
                    {new Date(credential.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button size="small" variant="text" sx={{ color: '#6366f1', fontSize: '0.75rem', p: 0.5, minWidth: 'auto' }}>
                      View
                    </Button>
                    <Button size="small" variant="text" sx={{ color: '#6366f1', fontSize: '0.75rem', p: 0.5, minWidth: 'auto' }}>
                      Download
                    </Button>
                    <Button size="small" variant="text" sx={{ color: '#6366f1', fontSize: '0.75rem', p: 0.5, minWidth: 'auto' }}>
                      Share
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
