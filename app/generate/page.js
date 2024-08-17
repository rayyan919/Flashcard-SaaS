'use client'
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
    CardActionArea,
} from '@mui/material'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { collection, doc, getDoc, writeBatch } from 'firebase/firestore'
import { useState } from 'react'
import { db } from '@/firebase'

export default function Generate() {
    const [text, setText] = useState('')
    const [flashcards, setFlashcards] = useState([])
    const [name, setName] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const { isLoaded, isSignedIn, user } = useUser()
    const [flipped, setFlipped] = useState([])
    const [open, setOpen] = useState(false)
    const router = useRouter()



    const cleanResponse = (text) => {
        let cleanedText = text.replace(/[`]+/g, '').replace(/```json/g, '').replace(/```/g, '');
        if (cleanedText.startsWith("json")) {
            cleanedText = cleanedText.substring(4).trim(); // Remove "json" and trim leading spaces
        }

        return cleanedText;
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: text }),
            });

            const data = await response.json();
            let rawFlashcardsText = data.response.candidates[0].content.parts[0].text || '{}';

            console.log('Raw Flashcards Text:', rawFlashcardsText);

            // Clean the raw text response
            const cleanedFlashcardsText = cleanResponse(rawFlashcardsText);

            console.log('Cleaned Flashcards Text:', cleanedFlashcardsText);

            // Parse the cleaned response
            const parsedFlashcardsText = JSON.parse(cleanedFlashcardsText);

            if (parsedFlashcardsText.flashcards && Array.isArray(parsedFlashcardsText.flashcards)) {
                setFlashcards(parsedFlashcardsText.flashcards);
            } else {
                console.error('No flashcards found in the response');
            }
        } catch (error) {
            console.error('Error fetching flashcards:', error);
        }
    };


    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const saveFlashcards = async () => {
        if (!name) {
            alert('Please enter a name')
            return
        }

        try {
            const batch = writeBatch(db)
            const userDocRef = doc(collection(db, 'users'), user.id)
            const docSnap = await getDoc(userDocRef)

            if (docSnap.exists()) {
                const collections = docSnap.data().flashcards || []
                if (collections.find((f) => f.name === name)) {
                    alert('Flashcard collection with the same name already exists')
                    return
                } else {
                    collections.push({ name })
                    batch.set(userDocRef, { flashcards: collections }, { merge: true })
                }
            } else {
                batch.set(userDocRef, { flashcards: [{ name }] })
            }

            const colRef = collection(userDocRef, name)
            flashcards.forEach((flashcard) => {
                const cardDocRef = doc(colRef)
                batch.set(cardDocRef, flashcard)
            })

            await batch.commit()
            handleClose()
            router.push('/flashcards')
        } catch (error) {
            console.error('Error saving flashcards:', error)
        }
    }
    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Generate Flashcards
                </Typography>
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
            </Box>

            {flashcards.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Generated Flashcards
                    </Typography>
                    <Grid container spacing={3}>
                        {flashcards.map((flashcard, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card>
                                    <CardActionArea onClick={() => handleCardClick(index)}>
                                        <CardContent>
                                            <Box sx={{
                                                perspective: '1000px', '& > div': {
                                                    transition: 'transform 0.6s',
                                                    transformStyle: 'preserve-3d',
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: '200px',
                                                    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                                    transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                                },
                                                '& > div> div': {
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    backfaceVisibility: 'hidden',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    fontSize: '1.2rem',
                                                    textAlign: 'center',
                                                },
                                                '& > div > div:last-child': {
                                                    transform: 'rotateY(180deg)'
                                                }
                                            }}>
                                                <div>
                                                    <div>{flashcard.front}</div>
                                                    <div>{flashcard.back}</div>
                                                </div>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 4 }}
                            onClick={handleOpen}
                            fullWidth
                        >
                            Save Flashcards
                        </Button>
                    </Box>
                </Box>
            )}
            
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Save Flashcards</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter a name for your flashcard collection:
                    </DialogContentText>
                    <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        margin="dense"
                        label="Collection Name"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={saveFlashcards} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}


