'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignedOut, SignedIn, UserButton, useUser } from '@clerk/nextjs';
import { collection, doc, getDocs } from 'firebase/firestore';
import { Container, Grid, Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import { db } from '@/firebase'; 
import '/app/globals.css';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import DeleteIcon from '@mui/icons-material/Delete';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { zoomIn, fadeInBounce, fadeIn } from '@/utils/motions';
import Tilt from 'react-parallax-tilt';

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const searchParams = useSearchParams();
  const search = searchParams.get('id');
  const flashcardRef = useRef(null); // Added ref definition

  useEffect(() => {
    async function getFlashcard() {
      if (!search || !user) return;
  
      const colRef = collection(doc(collection(db, 'users'), user.id), search);
      const docs = await getDocs(colRef);
      const flashcards = [];
      docs.forEach((doc) => {
        flashcards.push({ id: doc.id, ...doc.data() });
      });
      setFlashcards(flashcards);
  
      // Log flashcards to check if they are being retrieved correctly
      console.log(flashcards);
    }
    getFlashcard();
  }, [search, user]);

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!isLoaded || !isSignedIn) {
    return <>Loading...</>;
  }

  if (flashcards.length === 0) {
    console.log("No flashcards found");
    return <div>No flashcards to show</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#210124]">
      <Head>
        <title>Saved Flashcards</title>
      </Head>

      {/* Navbar */}
      <nav className="bg-[#750D37] p-3 flex justify-between items-center w-full">
        <div className="flex justify-center items-center">
          <img
            src="/educard_logo.png"
            alt="educard"
            className="w-5 h-5 object-contain mx-2"
          />
          <a
            href='/'
            className="text-[#DBF9F0] text-xl font-bold hover:text-[#B3DEC1]">
            EduCard
          </a>
        </div>
        <div>
          <SignedOut>
            <div className="flex justify-center items-center">
              <a
                href="/sign-in"
                className="text-[#DBF9F0] flex items-center font-semibold hover:text-[#B3DEC1] mr-4"
              >
                <FaSignInAlt className="mr-2" /> Login
              </a>
              <a
                href="/sign-up"
                className="text-[#DBF9F0] flex items-center font-semibold hover:text-[#B3DEC1]"
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

      <a
        className="text-[#DBF9F0] text-4xl font-bold hover:text-[#B3DEC1] text-center p-4 block">
        {flashcards.map((flashcard, index) => (
          <div key={index} className="mb-2">
            {flashcard.name}
          </div>
        ))}
      </a>
      
      {flashcards.length > 0 && (
        <div ref={flashcardRef} className="mt-20">
          <h2 className="text-4xl text-[#B3DEC1] font-black mb-8 text-center">Collection Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-6 py-6">
            {flashcards.map((flashcard, index) => (
              <Tilt key={index}>
                <motion.div
                  variants={fadeIn('right', 'spring', index * 0.5, 2)} 
                  initial="hidden"
                  animate="show"
                  className="cursor-pointer p-5 rounded-[20px] shadow-card bg-[#B3DEC1] hover:shadow-2xl"
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
                        className="flip-card-front bg-[#B3DEC1] text-[#210124] p-4 rounded-lg shadow-lg flex justify-center items-center text-center"
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
                        className="flip-card-back bg-[#B3DEC1] text-[#210124] p-4 rounded-lg shadow-lg flex justify-center items-center text-center"
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
        </div>
      )}
    </div>
  );
}