import "./globals.css";
import PhoneFrame from "@/components/PhoneFrame";

export const metadata = {
  title: "Groovp",
  description: "Find and evaluate teammates at SUTD before you commit to a team.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
