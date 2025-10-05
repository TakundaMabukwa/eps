import { SidebarProvider } from '@/components/ui/sidebar-provider'

import GlobalProvider from '@/context/global-context/provider'

export const metadata = {
  title: 'Motion Live',
  description: 'Motion Live Routing System',
}

export default function RootLayout({ children, sidebar, header }) {
  return (
    <GlobalProvider>
      <SidebarProvider>
        {sidebar}
        <main className="bg-[#f3f3f3] dark:bg-gray-900 flex-1 min-h-screen ">
          {header}
          <div className="flex-1  overflow-y-auto p-4 md:p-6"> {children}</div>
        </main>
      </SidebarProvider>
    </GlobalProvider>
  )
}
