import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "./client-body";

export const metadata: Metadata = {
  title: "RideLanka — Vehicle Rental & Travel Management",
  description: "Browse, book, and manage vehicle rentals for exploring Sri Lanka's Southern Province and coastal routes. Scooters, cars, and vans available from local rental shops.",
  keywords: "vehicle rental, Sri Lanka, scooter rental, car rental, van rental, Southern Province, travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
