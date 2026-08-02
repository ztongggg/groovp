import "./globals.css";
import { Inter } from "next/font/google";
import PhoneFrame from "@/components/PhoneFrame";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Groovp",
  description: "Find and evaluate teammates at SUTD before you commit to a team.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
