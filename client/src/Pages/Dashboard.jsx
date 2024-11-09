import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "../hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Plus, User, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useRef, useState } from "react";
import { DashboardChart } from "@/components/blocks/DashboardChart";

// Sample data
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const { toast } = useToast();
  const codeRef = useRef(null);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = () => {
    const text = codeRef.current.textContent; // Get the current text of the <code> element
    if (text) {
      navigator.clipboard.writeText(text).then(
        toast({
          title: "Copied to clipboard",
        })
      );
    }
  };
  return (
    <div className='grid h-screen grid-cols-[280px_1fr] bg-black dark text-foreground'>
      {/* Sidebar */}
      <div className='border-r flex bg-card flex-col'>
        <div className='p-4 pt-8'>
          <div className='relative z-20 flex items-center text-lg font-medium'>
            <svg
              viewBox='0 0 153 177'
              className='mr-2 h-8 w-8 fill-white'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M18.4157 1.00699C20.7214 0.344786 23.1323 0 25.5804 0C26.0665 0 26.5526 0.0135769 27.0365 0.0407316H25.4358C23.0403 0.0407316 20.6798 0.371324 18.4157 1.00699Z'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M0.143287 27.5614C0.048178 26.6896 0 25.8093 0 24.9225C0 18.3232 2.67987 11.9938 7.45036 7.32868C10.5264 4.31926 14.3094 2.16019 18.4173 1.00569C14.3648 2.16876 10.6341 4.31285 7.59382 7.288C2.82333 11.9531 0.143287 18.2826 0.143287 24.8819L0.143287 27.5614Z'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M0.144571 86.9176C0.127494 86.5782 0.121094 86.2348 0.121094 85.8893C0.121094 85.5458 0.127494 85.2023 0.144571 84.8609V86.9176Z'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M116.85 29.0028C116.735 29.0139 116.618 29.0196 116.499 29.0196C116.382 29.0196 116.265 29.0139 116.148 29.0028H116.85ZM116.359 22.0691C116.405 22.0673 116.451 22.0665 116.499 22.0665C116.547 22.0665 116.593 22.0673 116.641 22.0691H116.359Z'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M0.143921 84.8605C0.693594 72.9456 10.7445 63.4492 23.0609 63.4492H89.377C101.121 63.4492 110.804 72.0808 112.156 83.2107C112.263 84.0898 112.319 84.9832 112.319 85.8909C112.319 87.5306 112.139 89.1293 111.797 90.6688C109.558 100.766 100.37 108.331 89.377 108.331H87.1992C86.9672 108.278 86.729 108.251 86.4823 108.251H44.2599C43.7541 108.214 43.2441 108.194 42.73 108.194C30.8378 108.194 21.1841 118.228 21.1841 130.586C21.1841 131.271 21.2133 131.948 21.2718 132.617V163.584C21.2718 163.686 21.276 163.788 21.2844 163.888C21.5498 165.554 22.946 166.826 24.6242 166.826C26.2314 166.826 27.5795 165.657 27.9244 164.093V132.171C27.8721 131.65 27.847 131.12 27.847 130.586C27.847 130.051 27.8721 129.521 27.9244 129V128.154H28.0289C28.9736 121.951 33.4734 116.968 39.2899 115.535C40.3934 115.263 41.545 115.118 42.73 115.118C43.8356 115.118 45.9528 115.175 45.9528 115.175H51.019V152.065C51.019 158.665 48.3396 164.992 43.5681 169.66C38.7987 174.325 32.328 176.948 25.5814 176.948C18.8349 176.948 12.3642 174.325 7.59482 169.66C2.82332 164.992 0.143921 158.665 0.143921 152.065V108.498C1.75114 97.4318 12.7383 88.8677 26.0496 88.8677H76.6216C76.7825 88.8881 76.9435 88.8983 77.1065 88.8983H77.8506C78.0136 88.8983 78.1766 88.8881 78.3355 88.8677C79.138 88.7634 79.8904 88.4036 80.4694 87.8373C81.1632 87.1585 81.5541 86.2365 81.5541 85.2756C81.5541 84.3147 81.1632 83.3926 80.4694 82.7139C79.8925 82.1496 79.1484 81.7919 78.3501 81.6855C78.185 81.6631 78.0199 81.6528 77.8506 81.6528H77.1065C76.9393 81.6528 76.7721 81.6631 76.6091 81.6855H26.0496C15.5159 81.6855 6.2384 85.9789 0.143921 92.5967V84.8605ZM26.5805 162.514C26.639 162.768 26.6704 163.032 26.6704 163.301C26.6704 163.396 26.6662 163.488 26.6578 163.58C26.6453 163.753 26.6181 163.923 26.5805 164.089V162.514Z'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M116.85 29.0029C116.735 29.0139 116.618 29.0196 116.499 29.0196C116.382 29.0196 116.265 29.0139 116.148 29.0029H116.85Z'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M116.849 29.0025C116.732 29.0136 116.616 29.0193 116.497 29.0193C116.379 29.0193 116.262 29.0136 116.148 29.0025H116.849ZM116.358 22.0688C116.404 22.0669 116.451 22.066 116.497 22.066C116.546 22.066 116.593 22.0669 116.639 22.0688H116.358Z'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M25.4372 0.0403442H126.905C133.652 0.0403442 140.122 2.66193 144.892 7.32835C149.663 11.9948 152.343 18.3239 152.343 24.9232V24.9236C152.343 31.5228 149.663 37.852 144.892 42.5182C143.395 43.982 141.732 45.2455 139.945 46.2882C138.81 46.9506 137.625 47.5251 136.402 48.0075C135.251 48.4614 134.068 48.8314 132.858 49.1156C130.924 49.5715 128.926 49.8066 126.905 49.8066H57.8784C54.0892 49.8066 51.019 52.8099 51.019 56.5165H29.3936V38.2627C29.3936 33.1486 33.6322 29.0029 38.8614 29.0029H116.148C116.265 29.0139 116.382 29.0196 116.499 29.0196C116.618 29.0196 116.735 29.0139 116.85 29.0029C118.648 28.8303 120.054 27.346 120.054 25.5431C120.054 25.5406 120.054 25.5383 120.054 25.5359C120.05 23.6667 118.535 22.1417 116.641 22.0691C116.593 22.0673 116.547 22.0665 116.499 22.0665C116.451 22.0665 116.405 22.0673 116.359 22.0691H38.8614C29.7176 22.0691 22.3064 29.3193 22.3064 38.2627V56.5246C13.4239 56.7393 5.50062 60.726 0.143921 66.9083V24.8825C0.143921 18.2833 2.82332 11.9541 7.59482 7.28766C10.6337 4.31362 14.3644 2.17024 18.4169 1.00675C20.6804 0.371132 23.0421 0.0403442 25.4372 0.0403442Z'
              />
            </svg>
            <p className='text-3xl'> FormFlow</p>
          </div>
        </div>
        <div className='p-4 border-b'>
          <Button variant='outline' className='w-full justify-start gap-2'>
            <Plus className='h-4 w-4' />
            Add New
          </Button>
        </div>
        <ScrollArea className='flex-1 p-4'>
          <div className='space-y-1'>
            <Collapsible>
              <div className='flex gap-40'>
                <p> Projects </p>
                <CollapsibleTrigger
                  onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                >
                  {isProjectMenuOpen ? (
                    <ChevronDown size={20} className='mt-2' />
                  ) : (
                    <ChevronUp size={20} className='mt-2' />
                  )}
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <Button
                  variant='ghost'
                  className='w-full justify-start font-normal text-gray-400 hover:bg-[#252525] hover:text-white'
                >
                  Project name
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start font-normal text-gray-400 hover:bg-[#252525] hover:text-white'
                >
                  Project name
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start font-normal text-gray-400 hover:bg-[#252525] hover:text-white'
                >
                  Project name
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
        <div className='p-4 mt-auto border-t'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center'>
              <User className='h-5 w-5' />
            </div>
            <div className='flex flex-col'>
              <div className='text-sm font-medium'>First Last</div>
              <div className='text-xs text-muted-foreground'>
                email@domain.com
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex flex-col bg-black '>
        <div className='flex justify-end p-12 '>
          <Button variant='ghost' className=' gap-2'>
            <p className='font-semibold'>Account Form</p> <LogOut size={20} />
          </Button>
        </div>
        <div className='flex-1 p-16 pt-0'>
          <div className='mb-4'>
            <h1 className='text-2xl pl-2 font-semibold'>Form Name</h1>
          </div>
          <Tabs defaultValue='overview' className='w-full '>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='submissions'>Submissions</TabsTrigger>
              <TabsTrigger value='settings'>Settings</TabsTrigger>
              <TabsTrigger value='workflow'>Workflow</TabsTrigger>
              <TabsTrigger value='rules'>Rules</TabsTrigger>
            </TabsList>
            <TabsContent value='overview' className='gap-4  grid grid-cols-2'>
              <Card className='mt-4 p-6'>
                <h2 className='text-sm font-semibold'>INTEGRATION</h2>
                <Separator className='my-4' />
                <div className='space-y-4'>
                  <div className='text-sm'>Form endpoint</div>
                  <div className='flex gap-2'>
                    {isLoading ? (
                      <Skeleton className='flex-1 h-10 bg-[#252525]' />
                    ) : (
                      <code
                        ref={codeRef}
                        className='flex-1 bg-[#141414] p-2 rounded-md text-sm text-gray-300'
                      >
                        https://formflow.com/form/half-selfballhea
                      </code>
                    )}
                    <Button
                      variant='outline'
                      onClick={copyToClipboard}
                      size='icon'
                    >
                      <Copy className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </Card>
              <Card className='mt-4 p-6'>
                <h2 className='text-sm font-semibold mb-4'>
                  Monthly Submissions
                </h2>
                <Separator className='my-4' />
                {isLoading ? (
                  <Skeleton className='h-8 w-16 bg-[#252525]' />
                ) : (
                  <div className='text-2xl font-bold text-white'>17</div>
                )}
              </Card>

              <DashboardChart chartData={chartData} />
              <DashboardChart chartData={chartData} />
            </TabsContent>
            <TabsContent value='submissions'>
              <div className='flex flex-col gap-4 items-center text-muted-foreground'>
                Nothing here yet
              </div>
            </TabsContent>
            <TabsContent value='settings'>
              <div className='flex flex-col gap-4 items-center text-muted-foreground'>
                Nothing here yet
              </div>
            </TabsContent>
            <TabsContent value='workflow'>
              <div className='flex flex-col gap-4 items-center text-muted-foreground'>
                Nothing here yet
              </div>
            </TabsContent>
            <TabsContent value='rules'>
              <div className='flex flex-col gap-4 items-center text-muted-foreground'>
                Nothing here yet
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
