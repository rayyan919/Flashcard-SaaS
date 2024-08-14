import React from 'react';
import { SignUp } from '@clerk/nextjs';
import { Container, Typography, Box } from '@mui/material';

export default function SignUpPage() {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sign Up for Flashcard SaaS
      </Typography>
      <Box sx={{ mt: 4 }}>
        <SignUp />
      </Box>
    </Container>
  );
}
