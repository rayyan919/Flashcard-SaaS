'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { collection, doc, getDoc, writeBatch } from 'firebase/firestore'
import { useState, useEffect, useRef } from 'react'
import { SignedOut, SignedIn, UserButton } from '@clerk/nextjs';
import { db } from '@/firebase'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { zoomIn, fadeInBounce, fadeIn } from '@/utils/motions'
import "/app/globals.css"
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Tilt from 'react-parallax-tilt';

export default function Generate() {
    const [text, setText] = useState('')
    const [flashcards, setFlashcards] = useState([])
    const [name, setName] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const { isLoaded, isSignedIn, user } = useUser()
    const [flipped, setFlipped] = useState([])
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const [loading, setLoading] = useState(false) 
    const flashcardRef = useRef(null) // Reference to the flashcards container

    const cleanResponse = (text) => {
        let cleanedText = text.replace(/[`]+/g, '').replace(/```json/g, '').replace(/```/g, '');
        if (cleanedText.startsWith("json")) {
            cleanedText = cleanedText.substring(4).trim();
        }
        return cleanedText;
    };

    const handleSubmit = async () => {
        setLoading(true); // Set loading to true when the generation starts
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

            const cleanedFlashcardsText = cleanResponse(rawFlashcardsText);
            const parsedFlashcardsText = JSON.parse(cleanedFlashcardsText);

            if (parsedFlashcardsText.flashcards && Array.isArray(parsedFlashcardsText.flashcards)) {
                setFlashcards(parsedFlashcardsText.flashcards);
                setTimeout(() => {
                    scrollToFlashcards();
                }, 100); // Delay scrolling slightly to ensure flashcards are in view
            } else {
                console.error('No flashcards found in the response');
            }
        } catch (error) {
            console.error('Error fetching flashcards:', error);
        } finally {
            setLoading(false); // Set loading to false once the process is complete
        }
    };
    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
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

    const scrollToFlashcards = () => {
        if (flashcardRef.current) {
            flashcardRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#0d1321]">
            <Head>
                <title>Generate Flashcards</title>
            </Head>

            {/* Navbar */}
            <nav className="bg-[#11192c] bg-opacity-90  py-4 px-5 flex justify-between items-center w-full sticky top-0 z-50">
                <div className="flex justify-center items-center">
                    <img
                        src="/educard_logo.png"
                        alt="educard"
                        className="w-10 h-10 object-contain mx-2"
                        variants={fadeInBounce(0.1, 0.8)} // Or the chosen animation
                        initial="hidden"
                        animate="show"
                    />
                    <a
                        href='/'
                        className="text-[#f0ebd8] text-xl font-bold  hover:text-[#748cab]">
                        EduCard
                    </a>
                </div>
                <div>
                    <SignedOut>
                        <div className="flex justify-center items-center">
                            <a
                                href="/sign-in"
                                className="text-[#f0ebd8] text-xl font-bold  hover:text-[#748cab] mr-4"
                            >
                                <FaSignInAlt className="mr-2" /> Login
                            </a>
                            <a
                                href="/sign-up"
                                className="text-[#f0ebd8] text-xl font-bold  hover:text-[#748cab]"
                            >
                                <FaUserPlus className="mr-2" /> Sign Up
                            </a>
                        </div>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </nav>

            <div className="container mx-auto flex-grow py-16">
                <motion.div
                    variants={zoomIn(0.1, 0.3)}
                    initial="hidden"
                    animate="show"
                >
                    <div className="font-black bg-clip-text text-transparent bg-gradient-to-t from-[#748cab] to-[#f0ebd8]  lg:text-[70px] sm:text-[60px] xs:text-[50px] text-[40px] lg:leading-[98px] mb-2 text-center hover:text-opacity-90">
                        Generate Flashcards
                    </div>
                </motion.div>

                <motion.div
                    variants={fadeInBounce(0.5, 0.8)}
                    initial="hidden"
                    animate="show"
                    className="mb-10"
                >
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-4 text-lg text-[#0d1321] bg-[#f0ebd8] font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#1d2d44] min-h-[250px]"
                        placeholder="Enter text here..."
                        rows="6"
                    ></textarea>
                </motion.div>
                <motion.div
                    variants={fadeIn("up", "spring", 0.5, 0.8)}
                    initial="hidden"
                    animate="show"
                    className="flex justify-center items-center"
                >
                    <button
                        ref={flashcardRef}
                        className="hover:bg-[#f0ebd8] bg-[#1d2d44] text-[#f0ebd8] hover:text-[#1d2d44] font-bold py-3 px-8 mt-5 rounded hover:scale-110"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Generate"}
                    </button>
                </motion.div>
                
                {flashcards.length > 0 && (
                    <div className="mt-20">
                        <h2 className="font-black bg-clip-text text-transparent bg-gradient-to-t from-[#748cab] to-[#f0ebd8]  lg:text-[70px] sm:text-[60px] xs:text-[50px] text-[40px] lg:leading-[98px] mb-10 text-center hover:text-opacity-90">Collection Preview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {flashcards.map((flashcard, index) => (
                                <Tilt>
                                    <motion.div
                                        key={index}
                                        variants={fadeIn('right', 'spring', index * 0.5, 2)} // Similar to FeatureCard's animation
                                        initial="hidden"
                                        animate="show"
                                        className="cursor-pointer p-5 rounded-[20px] shadow-card2 bg-[#1d2d44] hover:shadow-2xl "
                                        onClick={() => handleCardClick(index)}
                                    >
                                        <div
                                            className={`flip-card ${flipped[index] ? 'flipped' : ''}`}
                                            style={{
                                                perspective: '1000px',
                                                width: '100%',
                                                height: '200px',
                                                position: 'relative',
                                            }}
                                        >
                                            <div
                                                className="flip-card-inner"
                                                style={{
                                                    transformStyle: 'preserve-3d',
                                                    transition: 'transform 0.6s',
                                                    transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                    width: '100%',
                                                    height: '100%',
                                                    position: 'relative',
                                                }}
                                            >
                                                <div
                                                    className="flip-card-front bg-[#1d2d44] text-[#f0ebd8] p-4 rounded-2xl shadow-lg flex justify-center items-center text-center mx-auto border border-gray-300 shadow-card2 "
                                                    style={{
                                                        backfaceVisibility: 'hidden',
                                                        position: 'absolute',
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                >
                                                    <p className="text-lg font-semibold">{flashcard.front}</p>
                                                </div>
                                                <div
                                                    className="flip-card-back bg-[#1d2d44] text-[#f0ebd8] p-4 rounded-2xl shadow-lg flex justify-center items-center text-center mx-auto border border-gray-300 shadow-card2"
                                                    style={{
                                                        backfaceVisibility: 'hidden',
                                                        position: 'absolute',
                                                        width: '100%',
                                                        height: '100%',
                                                        transform: 'rotateY(180deg)',
                                                    }}
                                                >
                                                    <p className="text-lg font-semibold">{flashcard.back}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Tilt>
                            ))}
                        </div>
                        <div className="flex justify-center items-center mt-10">
                            <button
                                className="hover:bg-[#f0ebd8] bg-[#1d2d44] text-[#f0ebd8] hover:text-[#1d2d44] font-bold py-3 px-8 rounded hover:scale-110"
                                onClick={handleOpen}
                            >
                                Save Collection
                            </button>
                        </div>
                    </div>
                )}

                {open && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-[#1d2d44] p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                            <h3 className="text-xl font-bold mb-4 text-[#f0ebd8] text-center">Save Collection</h3>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                placeholder="Enter collection name..."
                                className="w-full p-3 border text-[#0d1321] font-semibold border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#3e5c76]"
                            />
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={handleClose}
                                    className="py-2 px-4 bg-[#f0ebd8] text-[#1d2d44] font-semibold hover:bg-opacity-90 rounded-lg  hover:scale-110"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveFlashcards}
                                    className="py-2 px-4 bg-[#f0ebd8] text-[#1d2d44] font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-300 hover:scale-110"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
