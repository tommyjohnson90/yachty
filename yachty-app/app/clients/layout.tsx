// Force dynamic rendering for client pages
export const dynamic = 'force-dynamic'

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
