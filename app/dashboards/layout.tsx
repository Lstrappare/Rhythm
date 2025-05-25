import HeaderUser from "./components/HeaderUser";

export default function DashboartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <HeaderUser />
      {children}
    </>
  )
}