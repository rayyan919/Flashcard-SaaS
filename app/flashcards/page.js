'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignedOut, SignedIn, UserButton, useUser } from '@clerk/nextjs';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { zoomIn, fadeInBounce, fadeIn } from '@/utils/motions'
import "/app/globals.css"
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
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
    event.stopPropagation();
    setSelectedFlashcard(flashcard);
    setOpenDialog(true);
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
    setOpenDialog(false);
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
                        className="w-10 h-10 object-contain mx-2"
                        variants={fadeInBounce(0.1, 0.8)} // Or the chosen animation
                        initial="hidden"
                        animate="show"
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

      {/* Spacer */}
      <a
        className="text-[#DBF9F0] text-4xl font-bold hover:text-[#B3DEC1] text-center p-4 block">
        My Flashcards
      </a>


      {flashcards.length === 0 ? (
        <div className="text-center mt-8">
          <h3 className="text-xl font-semibold text-[#DBF9F0] mb-4">
            No Saved Collections Yet
          </h3>
          <button 
            onClick={handleStartCreating}
            className="px-4 py-2 bg-[#750D37] text-[#DBF9F0] rounded-lg hover:bg-[#DBF9F0] hover:text-[#750D37] transition-colors"
          >
            Start Creating Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-10 py-2 px-4">
          {flashcards.map((flashcard, index) => (
            <motion.div
              key={index}
              className="cursor-pointer p-5 rounded-[20px] shadow-card bg-[#B3DEC1] hover:bg-[#A0C4A7] hover:shadow-l transition duration-300"
              onClick={() => handleCardClick(flashcard.name)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#210124]">
                  {flashcard.name}
                </h3>
                <button
                    onClick={(event) => handleDeleteClick(event, flashcard)}
                    className="text-[#210124] hover:text-[#210124] transition duration-300"
                  >
                    <DeleteIcon />
                </button>

              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#B3DEC1] p-8 rounded-lg">
            <h4 className="text-lg font-bold text-[#210124] mb-4">
              Confirm Deletion
            </h4>
            <p className="text-[#210124] mb-6">
              Are you sure you want to delete the flashcard collection "{selectedFlashcard?.name}"? This action cannot be reversed.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={handleCloseDialog}
                className="px-4 py-2 bg-[#210124] text-[#DBF9F0] rounded-lg hover:bg-[#750D37] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-[#750D37] text-[#DBF9F0] rounded-lg hover:bg-[#210124] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
