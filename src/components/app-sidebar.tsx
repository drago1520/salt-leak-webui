'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
// prettier-ignore
import { TerminalIcon, Settings2Icon, PieChartIcon, Activity, Send, LifeBuoy, FlaskConical, Orbit, Usb, Thermometer,
} from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';

// This is sample data.
const data = {
  user: {
    name: 'Thomas Jam',
    email: 'thomas.jam@copenhagenatomics.com',
    avatar: '/thomas_jam.jpeg',
  },
  teams: [
    {
      name: 'Copenhagen Atomics',
      logo: (
        <Avatar>
          <AvatarImage src="/favicon.svg" />
        </Avatar>
      ),
      plan: 'Enterprise',
    },
    {
      name: 'Salts Team',
      logo: <FlaskConical />,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: <TerminalIcon />,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Sensors',
      url: '#',
      icon: <Activity />,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '#',
        },
        {
          title: 'Control room',
          url: '#',
        },
        {
          title: 'Calibration & Diagnostics',
          url: '#',
        },
        {
          title: 'Reports',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'openmsr',
      url: '#',
      icon: <Orbit />,
    },
    {
      name: 'CA Embedded',
      url: '#',
      icon: <Usb />,
    },
    {
      name: 'CA DataUploader',
      url: '#',
      icon: <Thermometer />,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: <PieChartIcon />,
    },
  ],
  footer: [
    {
      title: 'Settings',
      url: '#',
      icon: <Settings2Icon />,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
    {
      title: 'Feedback',
      url: 'mailto:dragomir1520@gmail.com',
      icon: <Send />,
    },
    { title: 'Help center', url: '#', icon: <LifeBuoy /> },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavMain label="" items={data.footer} />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
