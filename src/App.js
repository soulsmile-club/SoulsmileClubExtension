import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ShareIcon from '@material-ui/icons/Share';
import Welcome from './Welcome';
import Account from './Account';
import Share from './Share';

const useStyles = makeStyles({
  root: {
    background: 'white',
    border: 0,
    height: 50,
    padding: '0 0',
    width: '100%',
    fontSize: '14px !important',
    fontFamily: 'Montserrat !important',
    position: 'fixed',
    bottom: 0
  },
  label: {
    fontFamily: 'Montserrat !important',
    fontSize: '14px !important',
  },
  button: {
    color: '#444444',
    fontFamily: 'Montserrat !important',
    fontSize: '14px !important',
  },
  selected: {
    color: "#eda1aa !important",
    fontFamily: 'Montserrat',
    fontSize: '14px !important',
  }
});

function App() {
  const [value, setValue] = React.useState('Home');
  const classes = useStyles();
  let page = null;
  if (value == 'Home') {
    page = <Welcome />;
  } else if (value == "Account") {
    page = <Account />
  } else if (value == "Share") {
    page = <Share />
  }
  return (
    <>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet" />
    <div className="App">
      {page}
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        showLabels
        className={classes.root}
      >
        <BottomNavigationAction classes={{root: classes.button, label: classes.label, selected: classes.selected}} value="Home" icon={<HomeIcon />} />
        <BottomNavigationAction classes={{root: classes.button, label: classes.label, selected: classes.selected}} value="Account" icon={<AccountCircleIcon />} />
        <BottomNavigationAction classes={{root: classes.button, label: classes.label, selected: classes.selected}} value="Share" icon={<ShareIcon />} />
      </BottomNavigation>
    </div>
    </>
  );
}

export default App;
