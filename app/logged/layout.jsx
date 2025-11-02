'use client';
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import RecyclingIcon from '@mui/icons-material/Recycling';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Link from "next/link";

import { useRouter, usePathname } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/userContext';
import { SignOut } from '../../services/user';
import { APPNAME } from '../../config/consts';
import path from 'path';
import { Badge } from '@mui/material';
import { Shop, ShoppingBag, ShoppingCart } from '@mui/icons-material';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(0),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Paths = [
    {
        path: '/logged/home',
        title: 'Início',
        icon: <HomeIcon sx={{color: 'secondary.main'}}/>
    },
    {
        path: '/logged/profile',
        title: 'Perfil',
        icon: <AccountCircleIcon sx={{color: 'secondary.main'}}/>
    },
    {
        path: '/logged/requests',
        title: 'Solicitações',
        icon: <GroupIcon sx={{color: 'secondary.main'}}/>
    },
    {
        path: '/logged/dashboard',
        title: 'Estatísticas',
        icon: <BarChartIcon sx={{color: 'secondary.main'}}/>
    },
    {
      path: '/logged/marketplace',
      title: 'Marketplace',
      icon: <ShoppingBag sx={{color: 'secondary.main'}}/>
    },
    {
      path: '/logged/materials',
      title: 'Materiais',
      icon: <RecyclingIcon sx={{color: 'secondary.main'}}/>
    }
];

export default function Scaffold({children}) {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function handleSignOut() {
    SignOut((code, message)=>{
        if(code === 200){
            router.push('/');
        }
    });
}

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{backgroundColor:'secondary.dark'}}>
        <Toolbar sx={{justifyContent:'space-between'}}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }), color: 'background.ligh'}}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" noWrap component="div" sx={{color: 'background.dark', margin:'auto'}}>
            {APPNAME}
          </Typography>
          <IconButton aria-label="delete" size="small" onClick={handleSignOut}
            sx={{
                "&:hover": {
                    backgroundColor: 'secondary.main',
                }
            }}
            >
            <Typography variant="h10" sx={{color: 'background.light', marginRight: '10px'}}>
                Sair
            </Typography>
            <LogoutIcon sx={{color: "background.light"}}/>
        </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader sx={{flexDirection:'column'}}>

            <Avatar alt={user.name} src={user.photoUrl || '/icon.svg'} sx={{width: '100px', height: '100px', marginTop:'10px', backgroundColor:'primary.dark', padding:'5px'}}/>
            <IconButton onClick={handleDrawerClose} sx={{position: 'absolute', top: '10px', alignSelf: 'end'}}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
  

        </DrawerHeader>
        <Typography variant="subtitle1" noWrap component="div" sx={{color: 'primary.main', margin: '20px auto 0px auto'}}>
          {user.name}
        </Typography>

        <Typography variant="subtitle2" noWrap component="div" sx={{color: 'primary.dark', margin: '0px auto 20px auto'}}>
          {user.email}
        </Typography>

        <List>
          {Paths.map((link, index) => {
            const isSelected = pathname.startsWith(link.path);
          return (
            <ListItem key={index} disablePadding>
                <Link 
                  rel="preload"
                  href={link.path} 
                  crossOrigin="anonymous"
                  style={{width: '100%', textDecoration: 'none'}}
                  passHref
                >
                  <ListItemButton sx={{...(isSelected && {backgroundColor: 'background.main'})}}>
                    <ListItemIcon>
                    {link.icon}
                    </ListItemIcon>
                    <ListItemText primary={link.title} />
                  </ListItemButton>
                </Link>
            </ListItem>
          )})}
        </List>
      </Drawer>
      <Main open={open} sx={{backgroundColor:"background.main", px:{sm: open ? 1 : 10}, minHeight:'100vh'}}>
        <DrawerHeader />
        <Box sx={{backgroundColor:'background.light', padding: '25px', borderBottomRightRadius: '15px',  borderBottomLeftRadius: '15px'}}>
            {children}
        </Box>
      </Main>
    </Box>
  );
}