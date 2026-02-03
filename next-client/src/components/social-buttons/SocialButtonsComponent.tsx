import React from 'react';
import { signIn } from "next-auth/react";
import styles from "./SocialButtonsComponent.module.css"

const SocialButtonsComponent = () => {
  const handleGoogleSignIn = () => {
    signIn("google", {
      callbackUrl: "/complete-profile",
    });
  };

  const handleFacebookSignIn = () => {
    signIn("facebook", {
      callbackUrl: "/complete-profile",
    });
  };

  return (
    <div className={styles.socialButtons}>
      <button type="button" onClick={handleGoogleSignIn} className={styles.socialButton}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/eye2.png" alt="Google" width={24} height={24}/>
        Sign Up with Google
      </button>

      <button type="button" onClick={handleFacebookSignIn} className={styles.socialButton}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/eye2.png" alt="Facebook" width={24} height={24}/>
        Sign Up with Facebook
      </button>
    </div>
  );
};

export default SocialButtonsComponent;
