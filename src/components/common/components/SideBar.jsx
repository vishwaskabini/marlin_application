import { Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText, styled, Tooltip } from "@mui/material";
import MuiDrawer from '@mui/material/Drawer';
import { useState } from "react";
import HomeIcon from '@mui/icons-material/Home';
import InsightsIcon from '@mui/icons-material/Insights';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonIcon from '@mui/icons-material/Person';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SettingsIcon from '@mui/icons-material/Settings';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SmsIcon from '@mui/icons-material/Sms';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { Link } from "react-router-dom";
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(10)} + 1px)`,
  }  
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
        color: theme.palette.common.white,
        backgroundColor: theme.palette.primary.main,
        '& .MuiSvgIcon-root' : {
            color: theme.palette.common.white
        }
    },
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

const NestedList = ({ data, level = 0, drawerState, onToggle }) => {
    console.log(drawerState);
    return (
        <List component="div" disablePadding>
        {data.map((item, index) => (
            <Tooltip title={!drawerState && item.label} placement="right" key={item.Id}>
                <div>
                    <ListItemButton component={Link} to={item.route} sx={[
                                {
                                    minHeight: 48,
                                    px: 2.5,
                                    pl: (level == 0) ? 2.5 : level *4
                                },
                                drawerState
                                    ? {
                                        justifyContent: 'initial',
                                    }
                                    : {
                                        justifyContent: 'center',
                                    },
                                ]} onClick={() => onToggle(item)}>
                        <ListItemIcon sx={[
                                        {
                                        minWidth: 0,
                                        justifyContent: 'center',
                                        },
                                        drawerState
                                        ? {
                                            mr: 3,
                                            }
                                        : {
                                            mr: 'auto',
                                            },
                                    ]}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} sx={[
                                        drawerState
                                        ? {
                                            opacity: 1,
                                            }
                                        : {
                                            opacity: 0,
                                            },
                                    ]}/>
                        {item.children && drawerState ? (item.open ? <ExpandLessIcon /> : <ExpandMoreIcon />) : null}
                    </ListItemButton>
                    {/* If item has children, display them as a nested list */}
                    {item.children && (
                        <Collapse in={item.open} timeout="auto" unmountOnExit>
                            <NestedList data={item.children} level={level + 1} drawerState={drawerState} onToggle={onToggle}/>
                        </Collapse>
                    )}
                    <Divider />
                </div>
            </Tooltip>            
        ))}
        </List>
    );
};

const Sidebar = ({drawerState}) => {

    const [drawerOpen, setDrawerOpen] = useState(true);

    const [menuData, setMenuData] = useState([
        { Id: 1, label: 'Dashboard', icon: <HomeIcon />, route: '/dashboard' },
        { Id: 2, label: 'Reports', icon: <InsightsIcon />, route: "/reports" },        
        { Id: 3, label: 'Members', icon: <GroupsIcon />, route: "/members" },
        { Id: 4, label: 'Scheduler', icon: <CalendarMonthIcon />, route: "/scheduler" },
        { Id: 5, label: 'Guest', icon: <PersonIcon />, route: "/guest" },
        { Id: 6, label: 'Packages', icon: <LocalOfferIcon />, route: "/packages" },
        { Id: 7, label: "Admin Config", icon: <EngineeringIcon />, open: false, route: "/admin/smssettings",
            children: [
                { Id: 71, label: 'SMS', icon: <SmsIcon />, route: "/admin/smssettings" },
                { Id: 72, label: 'Settings', icon: <SettingsIcon />, route: "/admin/settings" },
                { Id: 73, label: 'Roles', icon: <ManageAccountsIcon />, route: "/admin/roles" },
                { Id: 74, label: 'Attendance', icon: <AnalyticsIcon />, route: "/admin/attendance" },
                { Id: 75, label: 'Gallery', icon: <CameraEnhanceIcon />, route: "/admin/gallery" }
            ]
        }
    ]);

    const handleToggle = (itemToToggle) => {
        setMenuData(prevData =>
        prevData.map(item => {
            // Check if this item needs to be toggled
            if (item === itemToToggle) {
            // Toggle the `open` state
            return { ...item, open: !item.open };
            }

            // If this item has children, recursively toggle their state as well
            if (item.children) {
            return {
                ...item,
                children: item.children.map(child => {
                if (child === itemToToggle) {
                    return { ...child, open: !child.open };
                }
                return child;
                }),
            };
            }

            // Return item unchanged if not affected
            return item;
        })
        );
    };


    return (
        <Drawer variant="permanent" open={drawerState} sx={{'& .MuiDrawer-paper': {top: "auto"}}}>
            <NestedList data={menuData} drawerState={drawerState} onToggle={handleToggle}/>
        </Drawer>
    );
}

export default Sidebar;