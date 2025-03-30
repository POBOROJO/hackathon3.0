import { Navbar } from "@/components";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;