"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const page = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/login");
  }, [router]);
  return (
    <main></main>
  )
}

export default page