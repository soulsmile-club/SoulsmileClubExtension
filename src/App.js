import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Welcome from './Welcome';
import Account from './Account';

const useStyles = makeStyles({
  root: {
    background: 'white',
    border: 0,
    height: 50,
    padding: '0 30px',
    width: 200
  },
  button: {
    color: '#444444',
  },
  selected: {
    color: "#eda1aa !important"
  }
});

function App() {
  const [value, setValue] = React.useState('Home');
  const classes = useStyles();
  let page = null;
  if (value == 'Home') {
    page = <Welcome />;
  } else {
    page = <Account />
  }
  return (
    <>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />

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
        <BottomNavigationAction classes={{root: classes.button, selected: classes.selected}} label="Home" value="Home" icon={<HomeIcon />} />
        <BottomNavigationAction classes={{root: classes.button, selected: classes.selected}} label="Account" value="Account" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </div>
    </>
  );
}

export default App;
