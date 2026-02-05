
import React, {useState} from "react";
import { signIn } from "next-auth/react";

import styles from "./SocialButtonsComponent.module.css";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";

const SocialButtonsComponent: React.FC = () => {
  const [loading, setLoading] = useState<"google" | "facebook" | null>(null);

  const handleSocialSignIn = (provider: "google" | "facebook") => {
    return async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setLoading(provider);

      try {
      await signIn(provider, { callbackUrl: "/post-login" });
    } catch (error) {
      console.error("Social login failed:", error);
    } finally {
      setLoading(null);
    }
  };
};

    return (
        <div className={styles.socialButtons}>
            <button
                type="button"
                onClick={handleSocialSignIn("google")}
                className={styles.socialButton}
                disabled={loading === "google"}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/eye2.png" alt="Google" width={24} height={24}/>

                {loading === "google" ? (
                        <div className={`authButton ${styles.loaderWrapper}`}>
                            <LoaderComponent/>
                        </div>):("Sign in with Google")
                }

            </button>

            <button
                type="button"
                onClick={handleSocialSignIn("facebook")}
                className={styles.socialButton}
                disabled={loading === "facebook"}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/eye2.png" alt="Facebook" width={24} height={24}/>
                {loading === "facebook" ? (
                    <div className={`authButton ${styles.loaderWrapper}`}>
                        <LoaderComponent/>
                    </div>) : ("Sign in with Facebook")
                }
            </button>
        </div>
    );
};

export default SocialButtonsComponent;




// import React from 'react';
// import { signIn } from "next-auth/react";
// import styles from "./SocialButtonsComponent.module.css"
//
// const SocialButtonsComponent = () => {
//   const handleGoogleSignIn = () => {
//     signIn("google", {
//       callbackUrl: "/complete-profile",
//     });
//   };
//
//   const handleFacebookSignIn = () => {
//     signIn("facebook", {
//       callbackUrl: "/complete-profile",
//     });
//   };
//
//   return (
//     <div className={styles.socialButtons}>
//       <button type="button" onClick={handleGoogleSignIn} className={styles.socialButton}>
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src="/images/eye2.png" alt="Google" width={24} height={24}/>
//         Sign Up with Google
//       </button>
//
//       <button type="button" onClick={handleFacebookSignIn} className={styles.socialButton}>
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src="/images/eye2.png" alt="Facebook" width={24} height={24}/>
//         Sign Up with Facebook
//       </button>
//     </div>
//   );
// };
//
// export default SocialButtonsComponent;
