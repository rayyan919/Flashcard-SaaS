'use client'

import { useState } from 'react'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  CardActionArea
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { collection } from 'firebase/firestore'
import {useUser} from '@clerk/nextjs'
import { WriteBatch } from 'firebase/firestore'


export default function Generate() {
  const {isLoaded, isSignedIn, user} = useUser()
  const [text, setText] = useState('')
  const [flashcards, setFlashcards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [name, setSetName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.')
      return
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: text,
      })
        .then((res) => res.json())
        .then((data) => setFlashcards(data))

      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }

      const data = await response.json()
      setFlashcards(data)
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('An error occurred while generating flashcards. Please try again.')
    }
  }

  const handleFlashcardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleOpen = () => {
    setOpenI(true)
  }
  const handleClose = () => {
    setOpenI(false)
  }

  const saveFlashcards = async () => {
    if (!name.trim()) {
      alert('Please enter a name for your flashcard set.')
      return
    }

    try {
      const batch = WriteBatch(db)
      const userDocRef = doc(collection(db, 'users'), user.id)
      const docSnap = await getDoc(userDocRef)

      

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || []
        if (collections.find((f) => f.name === name)){
          alert("Flashcard collection with the same name already exists!")
          return
        }
        else {
        collections.push({name})
        batch.set(userDocRef, {flashcards: collections}, {merge: true})
        }
      }
      else{
        batch.set(userDocRef, {flashcards: [{name}]})
      }
      const colRef = collection(userDocRef, name)
      flashcards.forEach((flashcard)=>{
        const cardDocREf = doc(colRef)
        batch.set(cardDocREf, flashcard)
      })
      await batch.commit()
      handleClose()
      router.push('/flashcards')

    } catch (error) {
      console.error('Error saving flashcards:', error)
      alert('An error occurred while saving flashcards. Please try again.')
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>

        <Typography variant="h4" component="h1" gutterBottom>
          Generate Flashcards
        </Typography>

        <Paper sx={{p: 4, width: '100%'}}>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            label="Enter text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
          >
            Generate Flashcards
          </Button>
        </Paper>

      </Box>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Generated Flashcards
          </Typography>
          <Grid container spacing={3}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <CardActionArea 
                  onClick={() => {handleFlashcardClick(index)}}>
                  <CardContent>
                    <Box sx={{
                      perspective: '1000px',
                      '$ > div': {
                        transition: 'transform 0.6s',
                        transformStyle: 'preserve-3d',
                        position: 'relative',
                        width: '100%',
                        height: '200px',
                        boxShadow: '0 4px 8px 0 rgba(0,0,0, 0.2)',
                        transform: flipped[index]? 'rotateY(180deg)' : 'rotateY(0deg)',

                      },
                      '$ > div > div': {
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 2,
                        boxSizing: 'border-box'

                      },
                      '$ > div > div:nth-of-type(2)':{
                        transform: 'rotateY(180deg)'
                      }
                    }}>
                     <div>
                      <div>
                        <Typography variant='h5' 
                              component="div">
                          {flashcard.front}
                        </Typography>
                        </div>
                        <div>
                        <Typography variant='h5' 
                              component="div">
                          {flashcard.back}
                        </Typography>
                        </div>
                      </div> 
                    </Box>
                    <Typography variant="h6">Front:</Typography>
                    <Typography>{flashcard.front}</Typography>
                    <Typography variant="h6" sx={{ mt: 2 }}>Back:</Typography>
                    <Typography>{flashcard.back}</Typography>
                  </CardContent>
                  </CardActionArea>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="secondary" onClick={handleOpen}>
            Save Flashcards
          </Button>
        </Box>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Save Flashcard Set</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your flashcard set.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Set Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant= "outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={saveFlashcards} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
