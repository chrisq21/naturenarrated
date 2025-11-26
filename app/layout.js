import './globals.css'

export const metadata = {
  title: 'TrailStory - AI-Powered Trail Audio Stories',
  description: 'Personalized audio stories that bring trails to life',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
