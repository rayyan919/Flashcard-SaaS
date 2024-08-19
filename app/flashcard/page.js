'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignedOut, SignedIn, UserButton, useUser } from '@clerk/nextjs';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import '/app/globals.css';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { fadeInBounce, fadeIn } from '@/utils/motions';
import Tilt from 'react-parallax-tilt';

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [collectionName, setCollectionName] = useState(''); // State to store the collection name
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
      setCollectionName(search); // Set the collection name from the search parameter
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
    <div className="min-h-screen flex flex-col bg-[#0d1321]">
      <Head>
        <title>Saved Flashcards</title>
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

      {flashcards.length > 0 && (
        <div ref={flashcardRef} className="mt-10">
          <h2 className="font-black bg-clip-text text-transparent bg-gradient-to-t from-[#748cab] to-[#f0ebd8]  lg:text-[70px] sm:text-[60px] xs:text-[50px] text-[40px] lg:leading-[98px] mb-10 text-center hover:text-opacity-90">{collectionName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-6 py-6">
            {flashcards.map((flashcard, index) => (
              <Tilt key={index}>
                <motion.div
                  variants={fadeIn('right', 'spring', index * 0.5, 2)}
                  initial="hidden"
                  animate="show"
                  className="cursor-pointer p-5 rounded-[20px] shadow-card2 bg-[#1d2d44] hover:shadow-2xl"
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
                        className="flip-card-front bg-[#1d2d44] text-[#f0ebd8] p-4 rounded-lg shadow-lg flex justify-center items-center text-center  mx-auto border border-gray-300 shadow-card2"
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
                        className="flip-card-back bg-[#1d2d44] text-[#f0ebd8] p-4 rounded-lg shadow-lg flex justify-center items-center text-center  mx-auto border border-gray-300 shadow-card2"
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