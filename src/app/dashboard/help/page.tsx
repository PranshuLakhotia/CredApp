'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '@/hooks/useAuth';

export default function HelpPage() {
    const { user } = useAuth();

    return (
        <DashboardLayout title="Help & Support" role={user?.role}>
            <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: '#1e293b' }}>
                    Help & Support
                </Typography>

                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Frequently Asked Questions
                    </Typography>

                    <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={500}>How do I verify a credential?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography color="text.secondary">
                                Navigate to the "Verify Credentials" section in your dashboard. You can upload a certificate file or enter the credential ID to verify its authenticity on the blockchain.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={500}>How do I update my profile?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography color="text.secondary">
                                Go to the "User Profile" section from the sidebar. Click on the "Edit" button to update your personal information, skills, and experience.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={500}>Is my data secure?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography color="text.secondary">
                                Yes, Credify uses blockchain technology to ensure the security and immutability of your credentials. Your personal data is encrypted and stored securely.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Paper>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Need more help? Contact us at <a href="mailto:support@credify.com" style={{ color: '#3b82f6' }}>support@credify.com</a>
                    </Typography>
                </Box>
            </Box>
        </DashboardLayout>
    );
}
