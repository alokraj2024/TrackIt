import './globals.css';

export const metadata = {
  title: 'TrackIt — Your Productivity, Supercharged',
  description: 'Manage your to-dos, build habits, schedule your day, and track your progress — all in one beautiful app.',
  keywords: 'productivity, to-do, habits, timetable, pomodoro, tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
