'use client';
import React, { useRef } from 'react';
import { SignedOut, SignedIn, UserButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import getStripe from '@/utils/get-stripe';
import Head from 'next/head';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import { slideUp, textVariant, fadeIn, fadeInBounce } from '@/utils/motions';
import Tilt from 'react-parallax-tilt';
import "/app/globals.css"

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
    });
    const checkoutSessionJson = await checkoutSession.json();

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };

  const handleGetStartedClick = () => {
    if (isSignedIn) {
      router.push('/generate');
    } else {
      router.push('/sign-in');
    }
  };

  const handleSavedFlashcardsClick = () => {
    if (isSignedIn) {
      router.push('/flashcards');
    } else {
      router.push('/sign-in');
    }
  };

  const FeatureCard = ({ title, description, index, isInView }) => (
    <Tilt>
      <motion.div
        variants={fadeIn('right', 'spring', index * 0.5, 2)}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        className="p-5 rounded-[20px]  bg-[#1d2d44] hover:shadow-2xl min-h-[250px] flex justify-center items-center max-w-sm  mx-auto border border-gray-300 shadow-card2  ); "
      >
        <div>
          <h3 className=" text-2xl font-semibold text-[#748cab]  mb-4">{title}</h3>
          <p className="text-[#f0ebd8]">{description}</p>
        </div>
      </motion.div>
    </Tilt>
  );

  const KeyFeatures = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const features = [
      {
        title: 'Simple Input',
        description:
          'Just paste your text, and EduCard will turn it into effective flashcards in no time.',
      },
      {
        title: 'Intelligent Processing',
        description:
          'Our AI-powered system extracts key information to create concise, easy-to-study flashcards.',
      },
      {
        title: 'Access Anywhere',
        description:
          'Study wherever you are, on any device. Your flashcards are always with you.',
      },
    ];

    return (
      <section ref={ref} className="my-24 text-center">
        <motion.div variants={textVariant(0.5)}>
          <h2 className=" bg-clip-text text-transparent bg-gradient-to-t from-[#748cab] to-[#f0ebd8]  mb-10 text-center font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px]">
            Key Features
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 px-10 font-semibold">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </section>
    );
  };

  const pricingPlans = [
    {
      title: 'Basic',
      price: '$0 / month',
      description: 'No subscription required',
      features: [
        'Limited AI Flashcards',
        '20,000 characters per text upload',
        'No document uploading',
        'No exporting',
        'Limited new features',
      ],
      buttonText: 'Get Started',
      buttonAction: handleGetStartedClick,
    },
    {
      title: 'Pro',
      price: '$10 / month',
      description: 'Billed monthly',
      features: [
        'Unlimited AI Flashcards',
        '60,000 characters per text upload',
        'Upload documents',
        'Export to Anki, PDF and more',
        'New features soon',
      ],
      buttonText: 'Subscribe',
      buttonAction: handleSubmit,
    },
  ];

  const PricingCard = ({ plan, index, isInView }) => (
    <Tilt>
      <motion.div
        variants={fadeIn('up', 'spring', index * 0.5, 2)}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        className="p-8 rounded-lg shadow-lg bg-[#1d2d44] hover:shadow-2xl flex flex-col justify-between min-h-[400px] max-w-xs sm:max-w-sm mx-auto border border-gray-300 shadow-card2"
      >
        <div>
          <h3 className="text-3xl font-semibold text-[#748cab] mb-6">
            {plan.title}
          </h3>
          <p className="text-xl text-[#f0ebd8] mb-4">{plan.price}</p>
          <p className="text-md text-[#f0ebd8] mb-3">{plan.description}</p>
          <ul className="text-[#f0ebd8] mb-8 space-y-3">
            {plan.features.map((feature, i) => (
              <li key={i} className="text-md">
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <button
          className="bg-[#f0ebd8] hover:bg-[#0d1321] hover:text-[#f0ebd8] text-[#1d2d44] font-bold py-3 px-8 rounded"
          onClick={plan.buttonAction}
        >
          {plan.buttonText}
        </button>
      </motion.div>
    </Tilt>
  );

  const PricingPlans = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
      <section ref={ref} className="mt-24  flex justify-center items-center min-h-screen">
        <div className="text-center">
          <motion.div
            variants={fadeIn('up', 'spring', 2, 2)}
            initial="hidden"
            animate="show"
          >
            <h2 className="bg-clip-text text-transparent bg-gradient-to-t from-[#748cab] to-[#f0ebd8]  mb-10 font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px] text-center">
              Pricing Plans
            </h2>
          </motion.div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-10 px-5 ">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} plan={plan} index={index} isInView={isInView} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-full mx-auto bg-[#0d1321]">
      <Head>
        <title>EduCard</title>
        <meta
          name="description"
          content="Effortlessly generate study flashcards from your notes."
        />
      </Head>

      {/* Navbar */}
      <nav className="bg-[#11192c] bg-opacity-90  p-5 flex justify-between items-center w-full sticky top-0 z-50">
        <a
          href='/'
          className="text-[#f0ebd8] text-xl font-bold  hover:text-[#748cab]">EduCard</a>
        <div>
          <SignedOut>
            <div className="flex justify-center items-center">
              <a
                href="/sign-in"
                className="text-[#f0ebd8] flex items-center font-semibold hover:text-[#748cab] mr-4"
              >
                <FaSignInAlt className="mr-2" /> Login
              </a>
              <a
                href="/sign-up"
                className="text-[#f0ebd8] flex items-center font-semibold hover:text-[#748cab]"
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

      {/* Welcome Section */}
      <section className="text-center">
        <div className="my-14">
          <div className="flex justify-center items-center">
            <motion.img
              src="/educard_logo.png"
              alt="educard"
              className="w-56 h-56 object-contain"
              variants={fadeInBounce(0.1, 0.8)} // Or the chosen animation
              initial="hidden"
              animate="show"
            />
          </div>

          <motion.div variants={textVariant(0.1)} initial="hidden" animate="show">
            <h1 className="font-black bg-clip-text text-transparent bg-gradient-to-t from-[#748cab] to-[#f0ebd8]  lg:text-[70px] sm:text-[60px] xs:text-[50px] text-[40px] lg:leading-[98px] mb-2 text-center hover:text-opacity-90">
              Welcome to EduCard
            </h1>
          </motion.div>
          <motion.div variants={slideUp(0.2)} initial="hidden" animate="show">
            <div className=' flex justify-center items-center'>
              <p className="text-[#f0ebd8] font-medium text-center font-sm lg:text-[22px] sm:text-[18px] xs:text-[16px] text-[16px] lg:leading-[40px]  max-w-2xl">
                Master your studies with EduCard. Create custom flashcards in seconds or convert notes instantly.
              </p>
            </div>
            <button
              className="hover:bg-[#f0ebd8] bg-[#1d2d44] text-[#f0ebd8] hover:text-[#1d2d44] font-bold py-3 px-8 mt-5 rounded"
              onClick={handleGetStartedClick}
            >
              Get Started
            </button>
            <button
              className="bg-[#f0ebd8] hover:bg-[#1d2d44] hover:text-[#f0ebd8] text-[#1d2d44] font-bold py-3 px-6 mt-5 ml-4 rounded"
              onClick={handleSavedFlashcardsClick}
            >
              My Flashcards
            </button>
          </motion.div>
        </div>
      </section>

      <KeyFeatures />
      <PricingPlans />
    </div>
  );
}


