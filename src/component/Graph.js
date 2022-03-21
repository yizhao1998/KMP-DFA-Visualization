import React, { useEffect, useState, useRef } from "react";
import { Button, TextField, Stack } from "@mui/material";
import "./Graph.css";
import D3Graph from "../util/D3Graph";
import kmp from "../util/kmp";

const createD3Graph = D3Graph;

const SimpleGraph = () => {
	const [inputValue, setInputValue] = useState("");

	const [buttonDisabled, setButtonDisabled] = useState(false);

	const [inputInvalid, setInputInvalid] = useState(false);

	// record last value, improve efficiency when text not changed
	let previousValue = "";

	useEffect(() => createD3Graph("graph"), []);

	const onInputChange = (e) => {
		let value = e.target.value.toUpperCase();
		setInputValue(value);
		// async operation, cannot directly use inputValue here to test
		setInputInvalid(!(/^[A-Z]*$/).test(value));
	};

	const onDrawClick = () => {
		if (previousValue !== inputValue) {
			createD3Graph("graph", kmp(inputValue));
			previousValue = inputValue;
			setButtonDisabled(true);
			// timeout 1000 ms to avoid multiple click
			setTimeout(() => setButtonDisabled(false), 1000);
		}
	};

	return (
		<>
			<div className="graph-wrapper">
				<Stack direction="row" spacing={2}>
					<div className="inputWrapper">
						<TextField
							id="standard-basic"
							variant="outlined"
							style={{ width: "15vw" }}
							value={inputValue}
							onChange={onInputChange}
							error={inputInvalid}
							label={
								inputInvalid
									? "Only upper case english letter supported."
									: "Example: ABABAC"
							}
						/>
					</div>
					<Button
						variant="contained"
						color="success"
						onClick={onDrawClick}
						disabled={buttonDisabled || inputInvalid}
					>
						Draw
					</Button>
				</Stack>
				<div id="graph"></div>
			</div>
		</>
	);
};

export default SimpleGraph;
