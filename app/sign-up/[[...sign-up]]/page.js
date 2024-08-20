'use client';

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import { Container, Typography, Box, AppBar, Button, Toolbar } from '@mui/material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeInBounce, fadeIn } from '@/utils/motions';
import Tilt from 'react-parallax-tilt';
import { FaSignInAlt } from 'react-icons/fa';

export default function SignUpPage() {
    return (
        <div style={{ backgroundColor: '#0d1321', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
            <AppBar position='sticky' sx={{ backgroundColor: "#11192c", mb: 4, top: 0, zIndex: 50 }}>
                <Toolbar>
                    <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <img
                            src="/educard_logo.png"
                            alt="educard"
                            className="w-10 h-10 object-contain mx-2"
                            style={{ marginRight: '8px' }}
                        />
                        <a
                            href='/'
                            className="text-[#f0ebd8] text-xl font-bold  hover:text-[#748cab]">
                            EduCard
                        </a>

                    </div>
                    <div className="flex justify-center items-center">
                        <a
                            href="/sign-in"
                            className="flex items-center text-[#f0ebd8] text-xl font-bold hover:text-[#748cab] mr-4"
                        >
                            <FaSignInAlt className="mr-2" />
                            Login
                        </a>
                    </div>


                </Toolbar>
            </AppBar>

            <Container maxWidth="100vw" sx={{ textAlign: 'center', mt: 4, backgroundColor: '#0d1321', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <Box
                    display="flex"
                    flexDirection={"column"}
                    alignItems="center"
                    justifyContent={"center"}
                    component={motion.div}
                    variants={fadeIn('up', 'spring', 0.5, 1)}
                    initial="hidden"
                    animate="show"
                    sx={{ backgroundColor: '#1d2d44', p: 4, borderRadius: '20px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)' }}
                >
                    <Typography variant="h4" sx={{ color: '#f0ebd8', mb: 2, fontWeight:500 }}>Sign Up</Typography>
                    <Tilt>
                        <Box>
                            <SignUp />
                        </Box>
                    </Tilt>
                </Box>
            </Container>
        </div>
    );
}
