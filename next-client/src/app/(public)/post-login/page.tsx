"use client";

import React, {useEffect, useState} from "react";
import {getSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";


export default function PostLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const redirectUser = async () => {
            const session = await getSession();
                       if (!isMounted) return;

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      if (session.user.needsProfile) {
        router.replace("/complete-profile");
        return;
      }

       const callbackUrl = searchParams.get('callbackUrl');
      if (callbackUrl) {
        router.replace(callbackUrl);
        return;
      }

      switch (session.user.role) {
        case "admin":
          router.replace("/admin");
          break;
        case "venue_admin":
          router.replace("/venue-admin");
          break;
        default:
          router.replace("/visitor");
      }
    };

    redirectUser().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false };
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "70px"}}>
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20%" }}>
      <p>Please wait...</p>
    </div>
  );
}