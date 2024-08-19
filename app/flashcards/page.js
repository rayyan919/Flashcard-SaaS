'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignedOut, SignedIn, UserButton, useUser } from '@clerk/nextjs';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { fadeInBounce } from '@/utils/motions'
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

      {/* Spacer */}
      <a
        className="font-black bg-clip-text text-transparent bg-gradient-to-t from-[#748cab] to-[#f0ebd8]  lg:text-[70px] sm:text-[60px] xs:text-[50px] text-[40px] lg:leading-[98px] mb-3 mt-10 text-center hover:text-opacity-90">
        My Flashcards
      </a>


      {flashcards.length === 0 ? (
        <div className="text-center mt-8">
          <h3 className="text-xl font-semibold text-[#DBF9F0] mb-4">
            No Saved Collections Yet
          </h3>
          <button
            onClick={handleStartCreating}
            className="px-4 py-2 hover:bg-[#f0ebd8] bg-[#1d2d44] text-[#f0ebd8] hover:text-[#1d2d44] rounded-lg "
          >
            Start Creating Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-10 py-10 px-4">
          {flashcards.map((flashcard, index) => (
            <motion.div
              key={index}
              className="cursor-pointer p-5 rounded-[20px] shadow-card bg-[#1d2d44] transition duration-300 hover:scale-95 border border-gray-300 shadow-card2"
              onClick={() => handleCardClick(flashcard.name)}
            >
              <div className="flex justify-between items-center ">
                <h3 className="text-xl font-bold  text-[#f0ebd8]">
                  {flashcard.name}
                </h3>
                <button
                  onClick={(event) => handleDeleteClick(event, flashcard)}
                  className="text-[#f0ebd8] hover:scale-110 transition duration-300"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#1d2d44] p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h4 className="text-xl font-bold mb-4 text-[#f0ebd8] text-center">
              Confirm Deletion
            </h4>
            <p className="text-[#f0ebd8] text-center mb-6">
              Are you sure you want to delete the flashcard collection "{selectedFlashcard?.name}"? This action cannot be reversed.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2  bg-[#f0ebd8] text-[#1d2d44] font-semibold hover:bg-opacity-90 rounded-lg  hover:scale-110"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2  bg-[#f0ebd8] text-[#1d2d44] font-semibold hover:bg-opacity-90 rounded-lg hover:scale-110"
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