import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Search from "@/components/search";
import UserProfileLogo from "../../components/userProfile";
import { useIsMobile } from "../../hooks/use-mobile";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { Context } from "@/App";
import { UserType } from "../../App";
export default function Page() {
  const {
    user,
  }: {
    user: UserType | null;
  } = useContext(Context);
  const userData = {
    name: user?.nom + " " + user?.prenom,
    email: user?.email,
    avatar: user?.avatar,
  };
  console.log(userData);
  return (
    <>
      <div className=" m-3 flex justify-between items-center gap-4">
        <div className="text-2xl font-bold">TaskFlow</div>
        <div>
          <Search />
        </div>
        <div>
          <UserProfileLogo user={userData} />
        </div>
      </div>
      <SidebarProvider>
        <AppSidebar className="" />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              {useIsMobile() && <SidebarTrigger className="-ml-1" />}
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Main content */}
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
