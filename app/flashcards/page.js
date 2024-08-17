'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Container, Grid, Card, CardActionArea, CardContent, Typography, IconButton, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from '@/firebase'; // Assuming you have a firebase.js file exporting the db instance

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null); // To track which flashcard is selected for deletion
  const [openDialog, setOpenDialog] = useState(false); // State to control the dialog
  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, 'users'), user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

  const handleCardClick = (id) => {
    router.push(`/flashcard?id=${id}`);
  };

  const handleDeleteClick = (event, flashcard) => {
    event.stopPropagation(); // Prevents the click event from propagating to the CardActionArea
    setSelectedFlashcard(flashcard);
    setOpenDialog(true); // Open the confirmation dialog
  };

  const confirmDelete = async () => {
    if (!user || !selectedFlashcard) return;
    const docRef = doc(collection(db, 'users'), user.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const collections = docSnap.data().flashcards || [];
      const updatedCollections = collections.filter(flashcard => flashcard.name !== selectedFlashcard.name);
      await updateDoc(docRef, { flashcards: updatedCollections });
      setFlashcards(updatedCollections);
    }
    setOpenDialog(false); // Close the dialog after deletion
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleStartCreating = () => {
    router.push('/generate');
  };

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  return (
    <Container maxWidth="100vw" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        Saved Flashcard Collections
      </Typography>

      {flashcards.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            No Saved Collections Yet
          </Typography>
          <Button variant="contained" color="primary" onClick={handleStartCreating}>
            Start Creating Collections
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {flashcards.map((flashcard, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" component="div">
                      {flashcard.name}
                    </Typography>
                    <IconButton
                      onClick={(event) => handleDeleteClick(event, flashcard)} // Pass event and flashcard
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the flashcard collection "{selectedFlashcard?.name}"? This action cannot be reversed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
