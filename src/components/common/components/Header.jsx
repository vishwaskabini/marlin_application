import { Avatar, Divider, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {useAuth} from '../authentication/AuthContext';
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
  })(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
      {
        props: ({ open }) => open,
        style: {
          marginLeft: drawerWidth,
          width: `calc(100% - ${drawerWidth}px)`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      },
    ],
  }));

const Header = ({onMenuClick}) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);    
    const {logout} = useAuth();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    const handleLogout = () => {
        logout();
        navigate("/login");
        handleMenuClose();
    };
    
    const handleProfileUpdate = () => {
        alert('Navigating to profile update...');
        handleMenuClose();
    };

    return(
        <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={onMenuClick}
                    edge="start"
                    sx={{marginRight: "10px"}}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                    <img src="/img/MARLIN.png" className="company-logo"/>
                </Typography>
                <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="profile"
                    onClick={handleMenuOpen}
                    sx={{marginLeft: "auto"}}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <AccountCircleIcon />
                    </Avatar>
                    <ArrowDropDownIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        style: {
                        width: 200, // Control the width of the menu
                        },
                    }}
                    >
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
      </AppBar>
    );
}

export default Header;