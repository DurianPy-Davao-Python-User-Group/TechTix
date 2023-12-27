import { FC, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { TECHTIX_72, TECHTIX_WORD_72 } from '@/assets/techtix';
import Button from '@/components/Button';
import CollapsibleSidebar from '@/components/CollapsibleSidebar/CollapsibleSidebar';
import Icon from '@/components/Icon';
import Sheet from '@/components/Sheet';
import { cn } from '@/utils/classes';
import { AdminRouteConfigProps } from './getAdminRouteConfig';

interface AdminSideBarProps {
  tablet: boolean;
  adminConfig: AdminRouteConfigProps[];
  isSidebarOpen: boolean;
  isCreateEventOpen: boolean;
  isMobileSidebarOpen: boolean;
  openSidebarWidth: number;
  collapsedSidebarWidth: number;
  setSidebarOpen: (value: boolean) => void;
  setMobileSidebarOpen: (value: boolean) => void;
}

const AdminSideBar: FC<AdminSideBarProps> = ({
  tablet,
  isSidebarOpen,
  isMobileSidebarOpen,
  adminConfig,
  openSidebarWidth,
  collapsedSidebarWidth,
  setSidebarOpen,
  setMobileSidebarOpen
}) => {
  const navigate = useNavigate();
  const SIDEBAR_ROUTE_MAP = adminConfig;
  const { pathname } = useLocation();
  const toggleMobileSidebar = () => setMobileSidebarOpen(!isMobileSidebarOpen);

  const TECHTIX_LOGO = <img src={TECHTIX_WORD_72} alt="" className="w-24" />;

  const SideBarOption = ({ optionName, iconName, route, onClick, selected = false, disabled = false, visible = true }: AdminRouteConfigProps) => {
    if (!visible) {
      return null;
    }

    const onOptionSelect = () => {
      if (route) {
        navigate(route);
        !tablet && toggleMobileSidebar();
      } else if (onClick) {
        onClick();
        !tablet && toggleMobileSidebar();
      }
    };

    const currentRouteSelected = pathname === route;

    return (
      <li>
        <Button
          className={cn(
            'flex w-full justify-start text-primary-foreground border-none hover:bg-primary-foreground hover:text-primary-500',
            (currentRouteSelected || selected) && 'text-primary-500 bg-primary-foreground pointer-events-none',
            !isSidebarOpen && 'justify-center'
          )}
          onClick={onOptionSelect}
          variant="ghost"
          disabled={disabled}
        >
          {iconName && <Icon name={iconName} className={cn('flex-shrink-0', isSidebarOpen && 'mr-3')} />}
          {isSidebarOpen && <p>{optionName}</p>}
        </Button>
      </li>
    );
  };

  const upperOptions = SIDEBAR_ROUTE_MAP.filter((option) => option.location === 'upper').map((option) => <SideBarOption key={option.optionName} {...option} />);
  const lowerOptions = SIDEBAR_ROUTE_MAP.filter((option) => option.location === 'lower').map((option) => <SideBarOption key={option.optionName} {...option} />);

  if (!tablet) {
    const handleMobileClick = () => {
      setSidebarOpen(true);
      setMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const MobileSidebar = () => (
      <Sheet className="bg-primary-500 pt-12" closeIconClassName="text-primary-foreground" visible={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <div className="h-full flex flex-col justify-between">
          <ul className="space-y-4">{upperOptions}</ul>
          <ul className="space-y-4">{lowerOptions}</ul>
        </div>
      </Sheet>
    );

    return (
      <nav className="flex flex-shrink-0 justify-center items-center p-2 bg-primary-500">
        <Button
          variant="ghost"
          className="text-primary-foreground absolute left-2"
          size="icon"
          icon="List"
          onClick={handleMobileClick}
          iconClassname="w-6 h-6"
        />
        <MobileSidebar />
        <span className="flex items-center justify-center space-x-2">
          <img src={TECHTIX_72} className="w-[50px]" alt="TechTix Logo" />
          <img src={TECHTIX_WORD_72} alt="" className="w-24" />
        </span>
      </nav>
    );
  }

  return (
    <CollapsibleSidebar
      className="max-h-screen h-full left-0 p-4 bg-primary-500 flex-shrink-0 relative z-0 mr-[-25px]"
      open={isSidebarOpen}
      openSidebarWidth={openSidebarWidth}
      collapsedSidebarWidth={collapsedSidebarWidth}
    >
      <div className="h-full flex flex-col w-[80%] justify-between">
        <ul className="space-y-4">
          <span className="flex items-center justify-center space-x-1">
            <img src={TECHTIX_72} className="w-[50px]" alt="TechTix Logo" />
            {isSidebarOpen && TECHTIX_LOGO}
          </span>
          {upperOptions}
        </ul>
        <ul className="space-y-4">{lowerOptions}</ul>
      </div>
    </CollapsibleSidebar>
  );
};

export default AdminSideBar;
