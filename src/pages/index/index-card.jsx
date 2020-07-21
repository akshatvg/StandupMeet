import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { useGlobalState, useGlobalMutation } from '../../utils/container';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import useRouter from '../../utils/use-router';
import { Link } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

var randomize = require('randomatic');
const CustomRadio = withStyles({
	root: {
		color: '#999999',
		'&$checked': {
			color: '#44A2FC'
		},
		'&:hover': {
			backgroundColor: 'inherit'
		}
	}
})(({ children, ...props }) => {
	return (
		<div
			className={`role-item ${props.checked ? 'active' : 'inactive'}`}
			onClick={(evt) => {
				props.onClick(props);
			}}
		>
			<div className={`icon-${props.value}`} />
			<div className={`radio-row ${props.value}`}>
				<div className="custom-radio">
					<input readOnly type="radio" value={props.value} checked={props.checked} />
					<div className="checkmark" />
				</div>
				<Box flex="1" className={`role-name ${props.checked ? 'active' : 'inactive'}`}>
					{props.value}
				</Box>
			</div>
		</div>
	);
});

const useStyles = makeStyles((theme) => ({
	fontStyle: {
		color: '#9ee2ff',
		margin: '5px auto'
	},
	midItem: {
		marginTop: '1rem',
		marginBottom: '6rem'
	},
	item: {
		flex: 1,
		display: 'flex',
		alignItems: 'center'
	},
	coverLeft: {
		background: 'linear-gradient(to bottom, #307AFF, 50%, #46cdff)',
		alignItems: 'center',
		flex: 1,
		display: 'flex',
		flexDirection: 'column'
	},
	coverContent: {
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
		color: '#fff'
	},
	container: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	card: {
		display: 'flex',
		minWidth: 700,
		minHeight: 500,
		maxHeight: 500,
		borderRadius: '10px',
		boxShadow: '0px 6px 18px 0px rgba(0,0,0,0.2)'
	},
	input: {
		maxWidth: '250px',
		minWidth: '250px',
		alignSelf: 'center'
	},
	/*grid: {
		margin: '0 !important'
	},*/
	button: {
		lineHeight: '21px',
		color: 'rgba(255,255,255,1)',
		fontSize: '17px',
		textTransform: 'none',
		height: '44px',
		width: '260px',
		'&:hover': {
			backgroundColor: '#82C2FF'
		},
		margin: theme.spacing(1),
		marginTop: '33px',
		backgroundColor: '#44a2fc',
		borderRadius: '30px'
	},
	copyclipbtn: {
		color: 'rgba(255,255,255,1)',
		fontSize: '17px',
		textTransform: 'none',
		margin: '30px auto 15px',
		width: '260px',
		'&:hover': {
			backgroundColor: '#82C2FF'
		},
		backgroundColor: '#44a2fc',
		borderRadius: '30px',
		padding: '12px 20px',
		border: 'none'
	},
	copyclibtext: {
		padding: '15px',
		color: 'currentColor',
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
		fontSize: '16px'
	},
	radio: {
		padding: '0',
		fontSize: '14px',
		// display: 'flex',
		alignItems: 'center',
		paddingRight: '5px'
	}
}));

export default function IndexCard() {
	const classes = useStyles();

	const routerCtx = useRouter();
	const stateCtx = useGlobalState();
	const mutationCtx = useGlobalMutation();
	const [ copySuccess, setCopySuccess ] = useState('');
	const [ randomStr, setRandomStr ] = useState(randomize('A0', 10));
	const textAreaRef = useRef(null);

	function copyToClipboard(e) {
		textAreaRef.current.select();
		document.execCommand('copy');
		e.target.focus();
		setCopySuccess('Link copied!');
	}

	{
		if (window.location.hash.includes('#/?join/')) {
			var joinChannelName = window.location.hash.split('#/?join/')[1];
		}
	}

	const handleClick = () => {
		
		if (!stateCtx.config.channelName) {
			if (window.location.hash.includes('#/?join/')) {
				
				
				mutationCtx.updateConfig({ channelName: randomStr });

				console.log(stateCtx.config.channelName);
			} else {
				mutationCtx.toastError('You need to enter the meeting name');
				return;
			}
		}
		if (!stateCtx.config.userName) {
			mutationCtx.toastError('Please enter your name to continue.');
			return;
		}
		if (!copySuccess) {
			if (window.location.hash.includes('#/?join/')) {
				mutationCtx.updateConfig({ channelName: window.location.hash.split('#/?join/')[1] });
			} else {
				mutationCtx.toastError('Please click on the copy the meeting link');
				return;
			}
		}
		if (!window.location.hash.includes('#/?join/')) {
		var channelString = stateCtx.config.channelName + '__' + randomStr;
		setRandomStr(channelString);
		stateCtx.config.channelName=channelString;
		}
		mutationCtx.startLoading();
		console.log(stateCtx.config.channelName);
		routerCtx.history.push({
			pathname: `/meeting/${stateCtx.config.channelName}`
		});
	};

	const handleChange = (evt) => {
		const { value, checked } = evt;
		console.log('value', evt);
		mutationCtx.updateConfig({
			host: value === 'host'
		});
	};

	return (
		<Box flex="1" display="flex" alignItems="center" justifyContent="flex-start" flexDirection="column">
			<Link to="/setting" className="setting-btn" />

			<div className="role-container host-div">
				<CustomRadio
					className={classes.radio}
					value="host"
					checked={stateCtx.config.host}
					onClick={handleChange}
				/>
				<CustomRadio
					className={classes.radio}
					value="audience"
					checked={!stateCtx.config.host}
					onClick={handleChange}
				/>
			</div>
			<Box
				marginTop="392"
				flex="1"
				display="flex"
				alignItems="center"
				justifyContent="center"
				flexDirection="column"
			>
				{!window.location.hash.includes('#/?join/') && (
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
									mutationCtx.updateConfig({ channelName: '' });
								}
							}}
						/>
					</FormControl>
				)}
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
								mutationCtx.updateConfig({
									userName: evt.target.value,
									channelName: stateCtx.config.channelName
										? stateCtx.config.channelName
										: joinChannelName
								});
							} else {
								mutationCtx.updateConfig({ userName: '' });
							}
						}}
					/>
				</FormControl>
				<FormControl className={clsx(classes.input, classes.grid)}>
					{!window.location.hash.includes('#/?join/') &&
					(stateCtx.config.channelName && document.queryCommandSupported('copy')) && (
						<div>
							<button
								onClick={copyToClipboard}
								variant="contained"
								color="primary"
								className={classes.copyclipbtn}
							>
								Copy Meeting Link
							</button>
							{copySuccess}
						</div>
					)}
					{!window.location.hash.includes('#/?join/') &&
					stateCtx.config.channelName && (
						<TextareaAutosize
							className={classes.copyclibtext}
							multiline
							rows={2}
							rowsMax={10}
							ref={textAreaRef}
							name="copyLink"
							value={window.location.href + '?join/' + stateCtx.config.channelName+'__'+randomStr}
						/>
					)}
				</FormControl>

				<FormControl className={classes.grid}>
					<Button onClick={handleClick} variant="contained" color="primary" className={classes.button}>
						Join Meeting
					</Button>
				</FormControl>
			</Box>
		</Box>
	);
}
