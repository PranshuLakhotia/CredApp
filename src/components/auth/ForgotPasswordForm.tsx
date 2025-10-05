// 'use client';

// import React, { useState } from 'react';
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Link,
//   Alert,
//   InputAdornment,
// } from '@mui/material';
// import { Email, ArrowBack } from '@mui/icons-material';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { motion } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import { AuthService } from '@/services/auth.service';

// // Validation schema
// const forgotPasswordSchema = z.object({
//   email: z.string().email('Please enter a valid email address'),
// });

// type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// export default function ForgotPasswordForm() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   const {
//     control,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     getValues,
//   } = useForm<ForgotPasswordFormData>({
//     resolver: zodResolver(forgotPasswordSchema),
//     defaultValues: {
//       email: '',
//     },
//   });

//   const onSubmit = async (data: ForgotPasswordFormData) => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       await AuthService.forgotPassword(data);
//       setIsSuccess(true);
      
//       // Redirect to verify code page after 2 seconds
//       setTimeout(() => {
//         router.push(`/auth/verify-code?email=${encodeURIComponent(data.email)}`);
//       }, 2000);
//     } catch (error: any) {
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResendEmail = async () => {
//     const email = getValues('email');
//     if (email) {
//       await onSubmit({ email });
//     }
//   };

//   if (isSuccess) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.3 }}
//       >
//         <Box sx={{ textAlign: 'center' }}>
//           <Box
//             sx={{
//               width: 80,
//               height: 80,
//               borderRadius: '50%',
//               background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               mx: 'auto',
//               mb: 3,
//             }}
//           >
//             <Email sx={{ fontSize: 40, color: 'white' }} />
//           </Box>
          
//           <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
//             Check Your Email
//           </Typography>
          
//           <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
//             We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
//           </Typography>

//           <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
//             If you don't see the email in your inbox, please check your spam folder.
//           </Alert>

//           <Button
//             variant="outlined"
//             onClick={handleResendEmail}
//             disabled={isLoading}
//             sx={{ mb: 2 }}
//           >
//             Resend Email
//           </Button>

//           <Box sx={{ mt: 3 }}>
//             <Link
//               href="/auth/login"
//               sx={{
//                 color: 'primary.main',
//                 textDecoration: 'none',
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: 1,
//                 '&:hover': {
//                   textDecoration: 'underline',
//                 },
//               }}
//             >
//               <ArrowBack fontSize="small" />
//               Back to Sign In
//             </Link>
//           </Box>
//         </Box>
//       </motion.div>
//     );
//   }

//   return (
//     <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
//       {/* Error Alert */}
//       {error && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           <Alert severity="error" sx={{ mb: 3 }}>
//             {error}
//           </Alert>
//         </motion.div>
//       )}

//       {/* Instructions */}
//       <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
//         Enter your email address and we'll send you a link to reset your password.
//       </Typography>

//       {/* Email Field */}
//       <Controller
//         name="email"
//         control={control}
//         render={({ field }) => (
//           <TextField
//             {...field}
//             fullWidth
//             label="Email Address"
//             type="email"
//             autoComplete="email"
//             autoFocus
//             error={!!errors.email}
//             helperText={errors.email?.message}
//             sx={{ mb: 4 }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <Email color="action" />
//                 </InputAdornment>
//               ),
//             }}
//           />
//         )}
//       />

//       {/* Send Reset Link Button */}
//       <Button
//         type="submit"
//         fullWidth
//         variant="contained"
//         size="large"
//         disabled={isLoading || isSubmitting}
//         sx={{
//           mb: 3,
//           py: 1.5,
//           fontSize: '1.1rem',
//           fontWeight: 600,
//         }}
//       >
//         {isLoading || isSubmitting ? 'Sending...' : 'Send Reset Link'}
//       </Button>

//       {/* Back to Login Link */}
//       <Box sx={{ textAlign: 'center' }}>
//         <Link
//           href="/auth/login"
//           sx={{
//             color: 'primary.main',
//             textDecoration: 'none',
//             display: 'inline-flex',
//             alignItems: 'center',
//             gap: 1,
//             '&:hover': {
//               textDecoration: 'underline',
//             },
//           }}
//         >
//           <ArrowBack fontSize="small" />
//           Back to Sign In
//         </Link>
//       </Box>
//     </Box>
//   );
// }

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('john.doe@gmail.com');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">Credify</span>
          </div>

          {/* Back to Login */}
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition">
            <ChevronLeft size={20} />
            <span className="text-sm">Back to login</span>
          </button>

          {/* Forgot Password Form */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Forgot your password?</h1>
            <p className="text-gray-600 mb-8">
              Don't worry, happens to all of us. Enter your email below to recover your password
            </p>

            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="john.doe@gmail.com"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-100 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-200 transition"
              >
                Submit
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">Or login with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#1877F2"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#000000"
                      d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-purple-50 items-center justify-center p-12">
        <div className="max-w-lg">
          {/* Placeholder for illustration */}
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                {/* Main Lock Icon */}
                <div className="w-40 h-40 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl">
                  <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-8 w-16 h-16 bg-yellow-400 rounded-lg transform rotate-12 opacity-80"></div>
                <div className="absolute -bottom-2 -right-8 w-20 h-20 bg-indigo-300 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 -right-12 w-12 h-12 bg-yellow-500 rounded-lg transform rotate-45 opacity-70"></div>
              </div>
              <div className="text-gray-400 text-sm mt-8">Password Recovery Illustration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}