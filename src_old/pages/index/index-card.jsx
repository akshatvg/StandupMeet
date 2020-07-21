import clsx from "clsx";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useGlobalState, useGlobalMutation } from "../../utils/container";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import useRouter from "../../utils/use-router";
import { Link } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk";
import React, { useRef, useState } from 'react';





const CustomRadio = withStyles({
  root: {
    color: "#999999",
    "&$checked": {
      color: "#44A2FC",
    },
    "&:hover": {
      backgroundColor: "inherit",
    },
  },
})(({ children, ...props }) => {
  return (
    <div
      className={`role-item ${props.checked ? "active" : "inactive"}`}
      onClick={(evt) => {
        props.onClick(props);
      }}
    >
      <div className={`icon-${props.value}`}></div>
      <div className={`radio-row ${props.value}`}>
        <div className="custom-radio">
          <input
            readOnly
            type="radio"
            value={props.value}
            checked={props.checked}
          />
          <div className="checkmark"></div>
        </div>
        <Box
          flex="1"
          className={`role-name ${props.checked ? "active" : "inactive"}`}
        >
          {props.value}
        </Box>
      </div>
    </div>
  );
});

const useStyles = makeStyles((theme) => ({
  fontStyle: {
    color: "#9ee2ff",
  },
  midItem: {
    marginTop: "1rem",
    marginBottom: "6rem",
  },
  item: {
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  coverLeft: {
    background: "linear-gradient(to bottom, #307AFF, 50%, #46cdff)",
    alignItems: "center",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  coverContent: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    color: "#fff",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    display: "flex",
    minWidth: 700,
    minHeight: 500,
    maxHeight: 500,
    borderRadius: "10px",
    boxShadow: "0px 6px 18px 0px rgba(0,0,0,0.2)",
  },
  input: {
    maxWidth: "250px",
    minWidth: "250px",
    alignSelf: "center",
  },
  grid: {
    margin: "0 !important",
  },
  button: {
    lineHeight: "21px",
    color: "rgba(255,255,255,1)",
    fontSize: "17px",
    textTransform: "none",
    height: "44px",
    width: "260px",
    "&:hover": {
      backgroundColor: "#82C2FF",
    },
    margin: theme.spacing(1),
    marginTop: "33px",
    backgroundColor: "#44a2fc",
    borderRadius: "30px",
  },
  radio: {
    padding: "0",
    fontSize: "14px",
    // display: 'flex',
    alignItems: "center",
    paddingRight: "5px",
  },
}));

export default function IndexCard() {
  const classes = useStyles();

  const routerCtx = useRouter();
  const stateCtx = useGlobalState();
  const mutationCtx = useGlobalMutation();
  const [copySuccess, setCopySuccess] = useState('');
  const textAreaRef = useRef(null);
  function copyToClipboard(e) {
    textAreaRef.current.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
    e.target.focus();
    setCopySuccess('Copied!');
  };

  const handleClick = () => {
    if (!stateCtx.config.channelName) {
      mutationCtx.toastError("You need to enter the meeting name");
      return;
    }
    if (!stateCtx.config.userName) {
      mutationCtx.toastError("Please enter your name to continue.");
      return;
    }

    mutationCtx.startLoading();
    routerCtx.history.push({
      pathname: `/meeting/${stateCtx.config.channelName}`,
    });
  };

  const handleChange = (evt) => {
    const { value, checked } = evt;
    console.log("value", evt);
    mutationCtx.updateConfig({
      host: value === "host",
    });
  };

  return (
    <Box
      marginTop="114px"
      flex="1"
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      flexDirection="column"
    >
      <Link to="/setting" className="setting-btn" />

      <div className="role-container">
        <CustomRadio
          className={classes.radio}
          value="host"
          checked={stateCtx.config.host}
          onClick={handleChange}
        ></CustomRadio>
        <CustomRadio
          className={classes.radio}
          value="audience"
          checked={!stateCtx.config.host}
          onClick={handleChange}
        ></CustomRadio>
      </div>
      <Box
        marginTop="92"
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <FormControl className={clsx(classes.input, classes.grid)}>
          <InputLabel htmlFor="channelName">Meeting Name</InputLabel>
          <Input
            id="channelName"
            name="channelName"
            value={stateCtx.config.channelName}
            onChange={(evt) => {
              const PATTERN = /^[a-zA-Z0-9!#$%&()+\-:;<=.>?@[\]^_{}|~,\s]{1,64}$/;
              const value = PATTERN.test(evt.target.value);
              if (value && evt.target.value.length < 64) {
                mutationCtx.updateConfig({ channelName: evt.target.value });
              } else {
                mutationCtx.updateConfig({ channelName: "" });
              }
            }}
          />
          
          </FormControl>
          <FormControl className={clsx(classes.input, classes.grid)}>
          <InputLabel htmlFor="userName">Enter Your Name</InputLabel>
          <Input
            id="userName"
            name="userName"
            value={stateCtx.config.userName}
            onChange={(evt) => {
              const PATTERN = /^[a-zA-Z0-9!#$%&()+\-:;<=.>?@[\]^_{}|~,\s]{1,64}$/;
              const value = PATTERN.test(evt.target.value);
              if (value && evt.target.value.length < 64) {
                mutationCtx.updateConfig({ userName: evt.target.value });
              } else {
                mutationCtx.updateConfig({ userName: "" });
              }
            }}
          />
        </FormControl>
        <FormControl className={classes.grid}>
          <Button
            onClick={handleClick}
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Start Meeting
          </Button>
        </FormControl>
      </Box>

      <div>
      {
       /* Logical shortcut for only displaying the 
          button if the copy command exists */
       document.queryCommandSupported('copy') &&
        <div>
          <button onClick={copyToClipboard}>Copy</button> 
          {copySuccess}
        </div>
      }
      <form>
        <textarea
          ref={textAreaRef}
          value='Googel isthe naesdafdsfdsfsadfsdfdsaf dsfdsjfjklsfjksdalkjfsdljkfljksadfljkadsfljklfjdsljkfdsklfkjdsafdsafjdsfjksdjkfjdsafkjdsjkfdsafjkdsafjkdsajkfjkdsfjkdsfjkdsfjkdskjfadsjfdjksfjdsfjdsjfdsajfjsdajfjkadjljkl'
        />
      </form>
    </div>
    </Box>

    
  );
}
