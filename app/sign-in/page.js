import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { Container, Typography, Box } from '@mui/material';

export default function SignInPage() {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sign In to Flashcard SaaS
      </Typography>
      <Box sx={{ mt: 4 }}>
        <SignIn />
      </Box>
    </Container>
  );
}
