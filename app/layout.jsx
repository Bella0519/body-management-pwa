export const metadata = {
  title: "身體管理系統",
  description: "打針/吃藥/喝水/飲食/InBody/心情",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <meta name="theme-color" content="#ffd1e8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#fff7fb" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
          {children}
        </div>
      </body>
    </html>
  );
}